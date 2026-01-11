const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const getGeminiClient = () => {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const BASE_PROMPT = `You are an expert electrician assistant creating comprehensive job estimates. You have extensive knowledge of:
- Current material pricing from Home Depot, Lowe's, and electrical supply houses
- Realistic labor times for electrical work
- Regional labor rates for electricians

## CRITICAL INSTRUCTIONS:

### Materials Pricing:
- Use CURRENT 2024-2025 retail prices from Home Depot/Lowe's
- Wire prices have increased significantly - 12/2 Romex 250ft is approximately $145-160
- estimatedPrice = price PER UNIT (the app calculates totals)

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
- Recessed lights: Each light uses 8-12ft of wire + 50ft home run. 6 lights = 130-150ft minimum
- Room outlets: Calculate perimeter, add outlet every 12ft, each needs ~18ft wire + 50ft home run
- A 250ft roll typically covers ONE circuit. Larger rooms or many fixtures may need 2 rolls
- Always factor 20% waste
- When in doubt, round UP on wire quantity

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

### Labor Rate Suggestions:
Base rates vary by job type and region. Provide a suggested rate with range.

## RESPONSE FORMAT:
Respond with ONLY valid JSON. No markdown, no code blocks, no explanation.
{
  "materials": [{"name": "Item description", "quantity": 1, "estimatedPrice": 10.00, "notes": "Optional note"}],
  "laborEstimate": {
    "low": 4,
    "mid": 6,
    "high": 8,
    "reasoning": "Brief explanation of estimate"
  },
  "suggestedRate": {
    "rate": 85,
    "range": {"low": 65, "high": 125},
    "reasoning": "Brief explanation"
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
You must calculate wire realistically based on room dimensions and fixture count.

Recessed Can Lights:
- Lights are typically spaced 4-6 feet apart
- Each light needs 8-12ft of wire to reach the next light
- First light needs home run to switch (add 40-60ft depending on panel distance)
- Example: 6 can lights = ~80-100ft just for the lights + 50ft home run = 130-150ft minimum
- A 250ft roll covers roughly 8-12 can lights with home run

Room Outlet Wiring:
- Estimate outlets every 12ft of wall (per code)
- Each outlet needs ~15-20ft of wire (drops, routes through studs)
- Add 40-60ft for home run to panel
- Example: 12x12 room (48ft perimeter) = 4 outlets × 18ft + 50ft home run = ~125ft
- Example: 15x23 room (76ft perimeter) = 6 outlets × 18ft + 50ft home run = ~160ft

3-Way Switch Runs:
- 14/3 between switches, typically 15-30ft depending on room
- Add regular 14/2 for the home run and light legs

General Rules:
- Always add 20% waste factor for cuts, mistakes, routing around obstacles
- Basement/attic runs add significant length - add 30-50ft per circuit
- A 250ft roll is usually needed per circuit, sometimes 2 rolls for larger rooms
- Don't underestimate - running short is costly; extra wire is cheap insurance

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

**CURRENT PRICING REFERENCE (Home Depot 2024-2025):**
- 14/2 NM-B 250ft: $105-115
- 12/2 NM-B 250ft: $145-160
- 14/3 NM-B 250ft: $140-155
- 12/3 NM-B 250ft: $200-220
- 10/2 NM-B 125ft: $130-145
- 10/3 NM-B 125ft: $175-190
- 6/3 NM-B 125ft: $280-320
- 15A breaker: $5-8
- 20A breaker: $6-9
- 15A AFCI breaker: $40-50
- 20A AFCI breaker: $42-52
- 15A GFCI outlet: $18-24
- 20A GFCI outlet: $22-28
- Standard duplex outlet: $0.80-2
- Decora outlet: $2-4
- Single pole switch: $1-3
- 3-way switch: $3-6
- 4-way switch: $12-18
- 4" LED recessed light: $8-15 each
- Smoke detector (hardwired): $25-40
- CO detector (hardwired): $30-45

**RESIDENTIAL LABOR RATES (2024-2025):**
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

**CURRENT PRICING REFERENCE (2024-2025):**
- 1/2" EMT 10ft: $5-7
- 3/4" EMT 10ft: $8-11
- 1" EMT 10ft: $12-16
- #12 THHN 500ft: $95-120
- #10 THHN 500ft: $140-170
- 12/2 MC cable 250ft: $200-250
- 12/3 MC cable 250ft: $270-320
- 20A commercial spec outlet: $3-5
- 20A commercial GFCI: $25-35
- EMT connectors/couplings: $0.50-2 each
- 4" square box: $3-6
- LED troffer 2x4: $45-80
- Exit sign LED: $25-50

**COMMERCIAL LABOR RATES (2024-2025):**
- Standard commercial electrician: $85-110/hr
- Prevailing wage/union: $120-175/hr
- Service/emergency: $125-200/hr
- Most commercial TI work: $90-120/hr typical

**COMMERCIAL LABOR TIME FACTORS:**
- New construction: Base times
- Tenant improvement: Add 25% (working around existing)
- Occupied space: Add 50% (after hours, working around people)
- High ceiling work: Add 25-50% (lifts, scaffolding)`;

const INDUSTRIAL_RULES = `
## INDUSTRIAL ELECTRICAL RULES (NEC + Standard Practice):

**Wiring Methods:**
- Rigid Metal Conduit (RMC) for durability
- IMC (Intermediate) where permitted
- PVC conduit in corrosive environments
- MC/AC cable in some applications
- Cable tray systems for large runs

**Wire Types:**
- THHN/THWN standard
- XHHW for wet locations
- MTW for machine tool wiring
- Larger conductors: 500 MCM, 750 MCM common

**Voltage Systems:**
- 480V 3-phase for motors/machinery
- 277V for HID/LED high-bay lighting
- 120/208V for convenience outlets
- Control circuits: 24V, 120V

**Motor Circuits:**
- Size wire at 125% of motor FLA
- Starter/contactor rated for motor HP
- Overload protection required
- Disconnect within sight of motor
- VFDs for variable speed applications

**Disconnects:**
- Required within sight of all motors
- Lockable disconnects for safety
- Fused vs non-fused based on design

**CURRENT PRICING REFERENCE (2024-2025):**
- 1" Rigid conduit 10ft: $30-40
- 1-1/2" Rigid conduit 10ft: $50-65
- 2" Rigid conduit 10ft: $70-90
- #6 THHN 500ft: $300-380
- #4 THHN 500ft: $450-550
- #2 THHN 500ft: $600-750
- 3-phase disconnect 60A: $100-180
- 3-phase disconnect 100A: $180-300
- Motor starter 10HP: $250-500
- VFD 5HP: $500-1000
- 400A panel 3-phase: $1000-1800
- LED high bay 150W: $120-200

**INDUSTRIAL LABOR RATES (2024-2025):**
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

    const { jobDescription, jobType = 'residential' } = request.data;

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
      
      const prompt = `${systemPrompt}

Generate a COMPLETE estimate for this ${jobTypeLabel} electrical job including:
1. Materials list with current retail pricing
2. Labor hour estimate (low/mid/high range with reasoning)
3. Suggested hourly rate with range

Job Description:
${jobDescription}

Remember: JSON only, no markdown.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      console.log(`[generateEstimate][${selectedJobType}] Raw AI response length:`, responseText.length);

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
            
            return {
              name: String(mat.name).substring(0, 200),
              quantity: Math.max(1, Math.round(Number(mat.quantity) || 1)),
              estimatedPrice: Math.max(0, Number(price.toFixed(2))),
              notes: mat.notes ? String(mat.notes).substring(0, 200) : null,
              flagged: flagged,
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
        
        // Ensure low < mid < high
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
        
        // Ensure rate is within range
        if (suggestedRate.rate < suggestedRate.range.low) {
          suggestedRate.rate = suggestedRate.range.low;
        }
        if (suggestedRate.rate > suggestedRate.range.high) {
          suggestedRate.rate = suggestedRate.range.high;
        }
      }

      console.log(`[generateEstimate][${selectedJobType}] Parsed:`, {
        materials: materials.length,
        laborEstimate: laborEstimate ? `${laborEstimate.low}/${laborEstimate.mid}/${laborEstimate.high}` : 'none',
        suggestedRate: suggestedRate ? `$${suggestedRate.rate}/hr` : 'none',
      });

      return { 
        materials, 
        laborEstimate, 
        suggestedRate 
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