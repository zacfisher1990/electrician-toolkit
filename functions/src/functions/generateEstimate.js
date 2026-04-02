const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");

// Initialize admin SDK (safe to call multiple times)
if (!admin.apps.length) {
  admin.initializeApp();
}
const adminDb = admin.firestore();

const getGeminiClient = () => {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

/**
 * Fetches the user's saved materials from Firestore.
 * Assumes subcollection: users/{uid}/materials
 * Fields: name (or description), price (or cost/unitPrice), unit (optional)
 */
async function fetchUserMaterials(uid) {
  try {
    const snapshot = await adminDb
      .collection("users")
      .doc(uid)
      .collection("materials")
      .limit(200) // Cap to keep prompt size reasonable
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const d = doc.data();
      // Defensive field resolution
      const name = d.name || d.description || d.title || null;
      const price =
        d.price ?? d.cost ?? d.unitPrice ?? d.unitCost ?? null;
      const unit = d.unit || d.uom || null;

      if (!name || price == null) return null;

      return {
        name: String(name).trim(),
        price: Number(price),
        unit: unit ? String(unit).trim() : null,
      };
    }).filter(Boolean);
  } catch (err) {
    // Non-fatal — if we can't fetch materials, fall back to AI estimates
    console.warn("[generateEstimate] Failed to fetch user materials:", err.message);
    return [];
  }
}

/**
 * Formats the materials catalog into a prompt-friendly string.
 */
function formatMaterialsCatalog(materials) {
  if (!materials.length) return null;

  const lines = materials.map((m) => {
    const unitLabel = m.unit ? ` (per ${m.unit})` : "";
    return `  - ${m.name}${unitLabel}: $${m.price.toFixed(2)}`;
  });

  return lines.join("\n");
}

const BASE_PROMPT = `You are an expert electrician assistant creating comprehensive job estimates. You have extensive knowledge of:
- Current material pricing from Home Depot, Lowe's, and electrical supply houses
- Realistic labor times for electrical work
- Regional labor rates for electricians across the United States

## CRITICAL INSTRUCTIONS:

### Materials Pricing:
- Use CURRENT 2025-2026 retail prices from Home Depot/Lowe's
- estimatedPrice = price PER UNIT (the app calculates total = quantity × estimatedPrice)

### WIRE/CABLE PRICING - EXTREMELY IMPORTANT:
- Wire and cable MUST be listed in ROLLS, not feet
- quantity = number of ROLLS needed (1, 2, 3, etc.)
- estimatedPrice = price per ROLL (e.g., 250ft roll of 12/2 NM-B ≈ $150)
- Calculate footage needed first, then convert to number of rolls (round UP)
- Example: Job needs ~300ft of 14/2 → quantity: 2 (two 250ft rolls), estimatedPrice: 110
- Example: Job needs ~180ft of 12/2 → quantity: 1 (one 250ft roll), estimatedPrice: 150
- NEVER set quantity to footage (like 150) with estimatedPrice as roll price (like $145) — this causes wildly inflated estimates
- For shorter runs under 50ft, you may list smaller spool sizes if available (e.g., 50ft or 100ft coils at appropriate pricing)

### Wire Gauge Selection - VERY IMPORTANT:
- Living rooms, bedrooms, hallways, dining rooms = 14/2 on 15A circuit
- General lighting and recessed lights = 14/2 on 15A circuit
- Living room outlets do NOT require 20A - use 14/2 on 15A
- ONLY these locations REQUIRE 12/2 on 20A per NEC:
  * Bathroom receptacles (dedicated 20A circuit)
  * Kitchen countertop receptacles (two 20A circuits minimum)
  * Laundry room receptacle (dedicated 20A circuit)
  * Garage receptacles (20A GFCI)
  * Outdoor receptacles (20A GFCI)
- Do NOT use 12/2 for general living spaces - it's unnecessary and wastes money

### Wire Quantity - DO NOT UNDERESTIMATE:
- Calculate total footage needed first, then convert to rolls (round UP):
  * Recessed lights: Each light uses 8-12ft of wire + 50ft home run. 6 lights = 130-150ft → 1 roll (250ft)
  * Room outlets: Calculate perimeter, add outlet every 12ft, each needs ~18ft wire + 50ft home run
  * A 250ft roll typically covers ONE circuit. Larger rooms or many fixtures may need 2 rolls
- Always factor 20% waste into footage calculation BEFORE converting to rolls
- When in doubt, round UP to the next roll
- Output rolls as the quantity, NOT feet

### Labor Hours Estimation:
Estimate realistic labor hours based on job complexity. Provide THREE values:
- low: Best case - experienced electrician, easy access, new construction
- mid: Standard case - typical conditions, some obstacles
- high: Complex case - remodel, difficult access, older home, troubleshooting

Labor time guidelines per task (adjust based on conditions):
- Rough-in outlet: 15-30 min
- Rough-in switch (single pole): 15-25 min
- Rough-in 3-way switch pair: 30-45 min
- Recessed light rough-in: 20-40 min each
- Panel work (add circuit): 30-60 min
- GFCI installation: 20-30 min
- Smoke detector: 20-35 min
- Home run (per circuit): 30-60 min
- Troubleshooting: add 1-2 hrs for remodel/old work

### Labor Rate Suggestions - LOCATION AWARE:
Electrician labor rates vary SIGNIFICANTLY by region. When a location is provided, adjust rates accordingly:

**HIGH COST REGIONS ($100-175/hr typical):**
- San Francisco Bay Area, Silicon Valley
- New York City, Long Island, Westchester
- Los Angeles, Orange County
- Seattle, Bellevue
- Boston metro area
- Washington DC metro
- Chicago downtown
- Hawaii

**ABOVE AVERAGE REGIONS ($85-130/hr typical):**
- Denver, Colorado Springs
- Portland, OR
- San Diego
- Phoenix metro
- Minneapolis/St. Paul
- Austin, Dallas
- Atlanta metro
- Most of New Jersey, Connecticut

**AVERAGE REGIONS ($70-100/hr typical):**
- Most mid-sized cities
- Suburbs of major metros
- Florida (except Miami)
- North Carolina, Virginia
- Ohio, Michigan, Indiana cities

**LOWER COST REGIONS ($55-85/hr typical):**
- Rural areas nationwide
- Small towns
- Mississippi, Arkansas, West Virginia
- Parts of the South and Midwest
- New Mexico (except Santa Fe/Albuquerque)

When suggesting rates, factor in:
1. The specific city/region provided
2. Cost of living in that area
3. Local market rates for licensed electricians
4. Job type (commercial/industrial typically pays more)

## MATERIAL CATEGORIES:
Every material MUST include a "category" field using EXACTLY one of these values (case-sensitive):
- "Wire & Cable"      → NM-B Romex, THHN, MC cable, UF cable, speaker/low-voltage wire
- "Boxes & Covers"    → electrical boxes, mud rings, extension rings, cover plates, weatherproof covers
- "Breakers & Panels" → circuit breakers (standard, AFCI, GFCI, dual-function), load centers, sub-panels, disconnects
- "Devices & Switches"→ single-pole switches, 3-way switches, 4-way switches, dimmers, fan controls, timers
- "Receptacles"       → duplex outlets, GFCI outlets, 20A outlets, USB outlets, dryer/range receptacles
- "Fixtures & Lighting"→ recessed lights, LED fixtures, smoke detectors, CO detectors, ceiling fans, exit signs, emergency lights
- "Conduit & Fittings"→ EMT conduit, rigid conduit, flex conduit, couplings, connectors, straps, LB bodies, weatherheads
- "Connectors & Lugs" → wire nuts, push-in connectors, butt splices, lugs, terminals, tape
- "Hardware"          → screws, anchors, staples, cable ties, nail plates, mud rings, straps, mounting hardware
- "Tools & Equipment" → tools, test equipment, ladders, drill bits (only include if billable to job)
- "Safety & PPE"      → gloves, safety glasses, arc flash PPE (only include if billable to job)
- "Other"             → anything that doesn't fit the above

Every material MUST also include a "unitType" field using EXACTLY one of these values:
- "roll"   → wire and cable sold by the roll (NM-B, THHN spools, MC cable)
- "each"   → individual items (outlets, switches, breakers, boxes, lights, detectors)
- "ft"     → conduit or wire sold by the foot
- "box"    → wire nuts, staples, anchors sold in boxes
- "pack"   → multi-packs of outlets, switches, or other devices
- "pair"   → items sold in pairs
- "set"    → items sold as a set
- "lb"     → items sold by weight
- "gallon" → liquids (penetrating oil, pulling lubricant)

## RESPONSE FORMAT:
Respond with ONLY valid JSON. No markdown, no code blocks, no explanation.
{
  "materials": [
    {"name": "14/2 NM-B Romex 250ft roll", "quantity": 1, "estimatedPrice": 110.00, "notes": "~150ft needed for circuit - 1 roll", "category": "Wire & Cable", "unitType": "roll", "source": "database"},
    {"name": "15A Decora outlet", "quantity": 5, "estimatedPrice": 3.00, "notes": null, "category": "Receptacles", "unitType": "each"}
  ],
  "laborEstimate": {
    "low": 4,
    "mid": 6,
    "high": 8,
    "reasoning": "Brief explanation of estimate"
  },
  "suggestedRate": {
    "rate": 85,
    "range": {"low": 65, "high": 125},
    "reasoning": "Brief explanation including location factor"
  }
}`;

const RESIDENTIAL_RULES = `
## RESIDENTIAL ELECTRICAL RULES (NEC + Standard Practice):

**Wiring Methods:**
- NM-B (Romex) is standard for residential
- MC cable in exposed locations or per local code
- UF cable for underground/outdoor

**Wire Sizing - FOLLOW STRICTLY:**
- 14 AWG (14/2, 14/3) → 15A breakers ONLY
- 12 AWG (12/2, 12/3) → 20A breakers ONLY  
- 10 AWG → 30A breakers
- 8 AWG → 40A breakers
- 6 AWG → 50-60A (ranges, subpanels)

**Circuit Types - USE CORRECT WIRE GAUGE:**
- Bedrooms: 14/2 on 15A (outlets and lights)
- Living rooms: 14/2 on 15A (outlets and lights) - does NOT require 20A
- Dining rooms: 14/2 on 15A
- Hallways: 14/2 on 15A
- Recessed can lights: 14/2 on 15A
- General lighting circuits: 14/2 on 15A

THESE REQUIRE 20A (12/2) - NEC MANDATED:
- Bathroom receptacles: 12/2 on 20A GFCI (dedicated circuit - CODE REQUIRED)
- Kitchen countertop: 12/2 on 20A (minimum 2 circuits - CODE REQUIRED)
- Refrigerator: 12/2 on dedicated 20A
- Dishwasher: 12/2 on 20A
- Garbage disposal: 12/2 on 20A
- Microwave: 12/2 on dedicated 20A
- Laundry: 12/2 on 20A (CODE REQUIRED)
- Garage outlets: 12/2 on 20A GFCI
- Outdoor outlets: 12/2 on 20A GFCI
- Electric dryer: 10/3 on 30A
- Electric range: 6/3 or 8/3 on 40-50A

**WIRE QUANTITY ESTIMATION - CRITICAL:**
Calculate total footage needed, then convert to ROLLS (round UP). Output quantity as number of ROLLS.

Recessed Can Lights:
- Lights are typically spaced 4-6 feet apart
- Each light needs 8-12ft of wire to reach the next light
- First light needs home run to switch (add 40-60ft depending on panel distance)
- Example: 6 can lights = ~80-100ft just for the lights + 50ft home run = 130-150ft → 1 roll (250ft)
- A 250ft roll covers roughly 8-12 can lights with home run

Room Outlet Wiring:
- Estimate outlets every 12ft of wall (per code)
- Each outlet needs ~15-20ft of wire (drops, routes through studs)
- Add 40-60ft for home run to panel
- Example: 12x12 room (48ft perimeter) = 4 outlets × 18ft + 50ft home run = ~125ft → 1 roll (250ft)
- Example: 15x23 room (76ft perimeter) = 6 outlets × 18ft + 50ft home run = ~160ft → 1 roll (250ft)

3-Way Switch Runs:
- 14/3 between switches, typically 15-30ft depending on room
- Add regular 14/2 for the home run and light legs

General Rules:
- Always add 20% waste factor for cuts, mistakes, routing around obstacles
- Basement/attic runs add significant length - add 30-50ft per circuit
- A 250ft roll is usually needed per circuit, sometimes 2 rolls for larger rooms
- Don't underestimate - running short is costly; extra wire is cheap insurance
- ALWAYS output wire quantity as NUMBER OF ROLLS with price per roll

**Smoke/CO Detectors:**
- ALWAYS use 14/3 NM-B for interconnected detectors (red wire = interconnect)
- Each detector needs ~30-50ft of 14/3 to reach the next one
- Required: each bedroom, outside bedrooms, each floor

**GFCI/AFCI Protection:**
- ONE GFCI device protects all downstream outlets on that circuit
- Don't specify multiple GFCIs for the same circuit
- Bathrooms, kitchens, garage, outdoor, laundry, basement: GFCI required
- Bedrooms, living areas: AFCI breaker required (not AFCI outlets)

**3-Way/4-Way Switches:**
- Use 14/3 between 3-way switches (12/3 only if on 20A circuit)
- 4-way switches go in the middle, also need 14/3 or 14/4

**CURRENT PRICING REFERENCE (Home Depot 2025-2026) — prices are PER ROLL:**
- 14/2 NM-B 250ft: $110-120
- 12/2 NM-B 250ft: $160-170
- 14/3 NM-B 250ft: $160-172
- 12/3 NM-B 250ft: $215-230
- 10/2 NM-B 250ft: $300-320
- 10/3 NM-B 250ft: $390-415
- 6/3 NM-B 125ft: $310-360
- 15A standard breaker: $7-9
- 20A standard breaker: $8-11
- 15A AFCI/GFCI dual-function breaker: $60-68
- 20A AFCI/GFCI dual-function breaker: $63-77
- 15A GFCI outlet: $20-28
- 20A GFCI outlet: $24-32
- Standard duplex outlet (15A TR): $2-4
- Decora outlet (15A TR): $4-7
- Single pole switch: $3-5
- 3-way switch: $5-8
- 4-way switch: $14-22
- 4" or 6" LED recessed light (integrated): $12-22 each
- Smoke detector (hardwired): $30-48
- CO detector (hardwired): $38-55

**RESIDENTIAL LABOR RATES (2025-2026) - USE LOCATION TO ADJUST:**
Base rates (adjust based on provided location):
- Economy/handyman rate: $50-65/hr
- Standard licensed electrician: $75-95/hr  
- Master electrician/premium: $100-150/hr
- Most residential work: $75-100/hr typical

**RESIDENTIAL LABOR TIME FACTORS:**
- New construction: Use base times (easier access)
- Finished basement: Add 25-50% (working overhead, existing structure)
- Remodel/old work: Add 50-100% (fishing wires, patching, surprises)
- Attic work: Add 25% (heat, access, working conditions)
- Crawl space: Add 25-50% (access, comfort)`;

const COMMERCIAL_RULES = `
## COMMERCIAL ELECTRICAL RULES (NEC + Standard Practice):

**Wiring Methods:**
- EMT (Electrical Metallic Tubing) is standard
- MC (Metal Clad) cable common for branch circuits
- Rigid conduit for exposed/outdoor
- NO Romex (NM-B) in commercial - not permitted

**Wire Types:**
- THHN/THWN in conduit
- MC cable with THHN conductors

**Voltage Systems:**
- 120/208V 3-phase (most common)
- 277/480V 3-phase (larger buildings)
- 277V for fluorescent/LED lighting
- 120V for receptacles

**Standard Circuits:**
- General receptacles: 12 AWG THHN on 20A (commercial = 20A minimum)
- Lighting (277V): 12 AWG THHN on 20A
- Lighting (120V): 12 AWG THHN on 20A
- Copy rooms/break rooms: multiple 20A circuits
- Data/IT rooms: dedicated circuits, isolated grounds

**Conduit Fill:**
- 1/2" EMT: 4-5 #12 THHN max (40% fill)
- 3/4" EMT: 6-9 #12 THHN max
- Calculate conduit size based on wire count

**Commercial GFCI Requirements:**
- Bathrooms, kitchens, rooftops, outdoors
- Within 6' of sinks
- Vending machine outlets

**CURRENT PRICING REFERENCE (2025-2026):**
NOTE: Wire/cable quantities must be in ROLLS/SPOOLS, not feet. Price = per roll/spool.
- 1/2" EMT 10ft: $6-9
- 3/4" EMT 10ft: $9-13
- 1" EMT 10ft: $14-19
- #12 THHN 500ft: $115-145
- #10 THHN 500ft: $165-200
- MC 12/2 250ft: $255-275
- MC 12/3 250ft: $320-370
- 20A commercial spec outlet (TR): $10-18
- 2x4 LED troffer: $90-170
- Exit sign LED: $40-70
- Emergency light combo: $70-115
- Commercial panel 200A: $450-800

**COMMERCIAL LABOR RATES (2025-2026) - USE LOCATION TO ADJUST:**
Base rates (adjust based on provided location):
- Standard commercial electrician: $85-115/hr
- Union/prevailing wage: $120-180/hr
- After hours/weekend: Add 25-50%
- Most commercial TI work: $90-120/hr typical

**COMMERCIAL LABOR TIME FACTORS:**
- Tenant improvement (TI): Base times
- Occupied building: Add 25% (working around tenants)
- High ceiling work: Add 25-50% (lifts, scaffolding)
- After hours requirement: Consider premium`;

const INDUSTRIAL_RULES = `
## INDUSTRIAL ELECTRICAL RULES (NEC + Standard Practice):

**Wiring Methods:**
- Rigid metal conduit (RMC/GRC) - heavy duty
- IMC (Intermediate Metal Conduit) - standard
- Tray cable in cable trays
- LFMC for motor connections (flexible)
- Hazardous location: explosion-proof fittings required

**Wire Types:**
- THHN/THWN in conduit (most common)
- XHHW for wet locations
- MTW (Machine Tool Wire) for equipment
- Tray-rated cable for cable tray installations

**Voltage Systems:**
- 480V 3-phase (primary distribution)
- 277V lighting (derived from 480V)
- 208V 3-phase (equipment)
- 120V for receptacles/controls
- Control voltage: 24V DC, 120V AC

**Motor Circuits:**
- Full Load Amps (FLA) determines wire size
- 125% of FLA for branch circuit sizing
- Starter/VFD sizing matches motor HP
- Overload protection: 115-125% of FLA

**Disconnects:**
- Required within sight of all motors
- Lockable disconnects for safety
- Fused vs non-fused based on design

**CURRENT PRICING REFERENCE (2025-2026):**
NOTE: Wire/cable quantities must be in ROLLS/SPOOLS, not feet. Price = per roll/spool.
- 1" Rigid conduit 10ft: $35-48
- 1-1/2" Rigid conduit 10ft: $58-75
- 2" Rigid conduit 10ft: $80-105
- #6 THHN 500ft: $360-450
- #4 THHN 500ft: $520-640
- #2 THHN 500ft: $700-875
- 3-phase disconnect 60A: $115-200
- 3-phase disconnect 100A: $200-340
- Motor starter 10HP: $280-560
- VFD 5HP: $550-1100
- 400A panel 3-phase: $1100-2000
- LED high bay 150W: $135-225

**INDUSTRIAL LABOR RATES (2025-2026) - USE LOCATION TO ADJUST:**
Base rates (adjust based on provided location):
- Standard industrial electrician: $95-130/hr
- Prevailing wage/union: $140-200/hr
- Shutdown/turnaround work: $150-250/hr
- Most industrial maintenance: $100-140/hr typical

**INDUSTRIAL LABOR TIME FACTORS:**
- Normal operations: Base times
- Live plant/production: Add 50% (safety, coordination)
- Shutdown work: Can be faster but premium rates
- Hazardous areas: Add 25-50% (permits, safety)`;

const JOB_TYPE_PROMPTS = {
  residential: RESIDENTIAL_RULES,
  commercial: COMMERCIAL_RULES,
  industrial: INDUSTRIAL_RULES,
};

exports.generateEstimate = onCall(
  {
    secrets: ["GEMINI_API_KEY"],
    timeoutSeconds: 90,
    memory: "512MiB",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to use AI features."
      );
    }

    const { jobDescription, jobType = 'residential', jobLocation } = request.data;
    const uid = request.auth.uid;

    if (!jobDescription || typeof jobDescription !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "Job description is required."
      );
    }

    if (jobDescription.length > 2000) {
      throw new HttpsError(
        "invalid-argument",
        "Job description is too long. Please keep it under 2000 characters."
      );
    }

    const validJobTypes = ['residential', 'commercial', 'industrial'];
    const selectedJobType = validJobTypes.includes(jobType) ? jobType : 'residential';

    // Fetch user's saved materials (non-blocking — empty array on failure)
    const userMaterials = await fetchUserMaterials(uid);
    const hasDatabaseMaterials = userMaterials.length > 0;
    const catalogString = hasDatabaseMaterials ? formatMaterialsCatalog(userMaterials) : null;

    console.log(`[generateEstimate][${selectedJobType}][${uid}] User materials found: ${userMaterials.length}`);

    const systemPrompt = BASE_PROMPT + JOB_TYPE_PROMPTS[selectedJobType];

    try {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 6000,
        },
      });

      const jobTypeLabel = selectedJobType.charAt(0).toUpperCase() + selectedJobType.slice(1);
      
      const locationContext = jobLocation && jobLocation.trim() 
        ? `\n\nJob Location: ${jobLocation.trim()}\n(Use this location to provide accurate regional labor rate estimates. Factor in local cost of living and market rates for this specific area.)`
        : '\n\n(No specific location provided - use national average rates for labor estimates.)';

      // Build the database catalog section if the user has saved materials
      const databaseSection = catalogString
        ? `

## USER'S MATERIAL DATABASE — HIGHEST PRIORITY PRICING:
The user has saved their own material prices. When any material below is needed for this job, you MUST use the exact price listed — do NOT use market estimates for these items.
Add "source": "database" to the JSON for any line item that uses a price from this list.
For materials NOT in this list, estimate using current market prices and omit the "source" field.

${catalogString}

Important matching notes:
- Match by common name even if wording differs (e.g., "Romex 12/2" matches "12/2 NM-B Wire")
- If a database item covers a needed material, always prefer it over market pricing
- Wire rolls in the database are priced per roll — apply the same roll-quantity logic as usual`
        : '';

      const prompt = `${systemPrompt}${databaseSection}

Generate a COMPLETE estimate for this ${jobTypeLabel} electrical job including:
1. Materials list with pricing (use database prices where available, market prices otherwise)
2. Labor hour estimate (low/mid/high range with reasoning)
3. Suggested hourly rate with range (IMPORTANT: Adjust based on the job location if provided)
${locationContext}

Job Description:
${jobDescription}

Remember: JSON only, no markdown. Add "source": "database" on any material priced from the user's database.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      console.log(`[generateEstimate][${selectedJobType}][${jobLocation || 'no-location'}] Raw AI response length:`, responseText.length);

      let parsedResponse;
      try {
        let cleanJson = responseText.trim();
        
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.slice(7);
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.slice(3);
        }
        if (cleanJson.endsWith("```")) {
          cleanJson = cleanJson.slice(0, -3);
        }
        cleanJson = cleanJson.trim();
        
        const firstBrace = cleanJson.indexOf("{");
        const lastBrace = cleanJson.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }
        
        parsedResponse = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError.message);
        console.error("Response:", responseText.substring(0, 1500));
        throw new HttpsError(
          "internal",
          "Failed to parse AI response. Please try again."
        );
      }

      // Process materials
      const flagThreshold = selectedJobType === 'industrial' ? 1500 : 
                           selectedJobType === 'commercial' ? 800 : 500;

      let materials = [];
      if (parsedResponse.materials && Array.isArray(parsedResponse.materials)) {
        materials = parsedResponse.materials
          .filter((mat) => mat.name && typeof mat.estimatedPrice === "number")
          .map((mat) => {
            let price = Number(mat.estimatedPrice) || 0;
            let flagged = price > flagThreshold;
            const fromDatabase = mat.source === "database";
            
            // Validate category against known values; fall back to Other
            const VALID_CATEGORIES = [
              'Wire & Cable', 'Boxes & Covers', 'Breakers & Panels',
              'Devices & Switches', 'Receptacles', 'Fixtures & Lighting',
              'Conduit & Fittings', 'Connectors & Lugs', 'Hardware',
              'Tools & Equipment', 'Safety & PPE', 'Other',
            ];
            const VALID_UNIT_TYPES = [
              'each', 'ft', 'box', 'roll', 'pack', 'pair', 'set', 'lb', 'gallon',
            ];
            const category = VALID_CATEGORIES.includes(mat.category)
              ? mat.category
              : 'Other';
            const unitType = VALID_UNIT_TYPES.includes(mat.unitType)
              ? mat.unitType
              : 'each';

            return {
              name: String(mat.name).substring(0, 200),
              quantity: Math.max(1, Math.round(Number(mat.quantity) || 1)),
              estimatedPrice: Math.max(0, Number(price.toFixed(2))),
              notes: mat.notes ? String(mat.notes).substring(0, 200) : null,
              flagged: flagged,
              category,
              unitType,
              // Pass database source flag through to the client
              ...(fromDatabase && { source: "database" }),
            };
          })
          .slice(0, 50);
      }

      // Process labor estimate
      let laborEstimate = null;
      if (parsedResponse.laborEstimate) {
        const le = parsedResponse.laborEstimate;
        laborEstimate = {
          low: Math.max(0.5, Math.round(Number(le.low) * 2) / 2) || 2,
          mid: Math.max(1, Math.round(Number(le.mid) * 2) / 2) || 4,
          high: Math.max(1.5, Math.round(Number(le.high) * 2) / 2) || 8,
          reasoning: le.reasoning ? String(le.reasoning).substring(0, 300) : null,
        };
        
        if (laborEstimate.low >= laborEstimate.mid) {
          laborEstimate.low = laborEstimate.mid * 0.7;
        }
        if (laborEstimate.mid >= laborEstimate.high) {
          laborEstimate.high = laborEstimate.mid * 1.4;
        }
      }

      // Process suggested rate
      let suggestedRate = null;
      if (parsedResponse.suggestedRate) {
        const sr = parsedResponse.suggestedRate;
        suggestedRate = {
          rate: Math.round(Number(sr.rate)) || 85,
          range: {
            low: Math.round(Number(sr.range?.low)) || 65,
            high: Math.round(Number(sr.range?.high)) || 125,
          },
          reasoning: sr.reasoning ? String(sr.reasoning).substring(0, 200) : null,
        };
        
        if (suggestedRate.rate < suggestedRate.range.low) {
          suggestedRate.rate = suggestedRate.range.low;
        }
        if (suggestedRate.rate > suggestedRate.range.high) {
          suggestedRate.rate = suggestedRate.range.high;
        }
      }

      const dbItemCount = materials.filter((m) => m.source === "database").length;

      console.log(`[generateEstimate][${selectedJobType}][${jobLocation || 'no-location'}] Parsed:`, {
        materials: materials.length,
        databasePricedItems: dbItemCount,
        laborEstimate: laborEstimate ? `${laborEstimate.low}/${laborEstimate.mid}/${laborEstimate.high}` : 'none',
        suggestedRate: suggestedRate ? `$${suggestedRate.rate}/hr` : 'none',
      });

      return { 
        materials, 
        laborEstimate, 
        suggestedRate,
        // Let the client know database pricing was used
        hasDatabasePricing: dbItemCount > 0,
        databaseItemCount: dbItemCount,
      };
    } catch (error) {
      console.error("AI Estimate Generation Error:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      if (error.status === 429) {
        throw new HttpsError(
          "resource-exhausted",
          "AI service is busy. Please try again in a moment."
        );
      }

      throw new HttpsError(
        "internal",
        "Failed to generate estimate. Please try again."
      );
    }
  }
);