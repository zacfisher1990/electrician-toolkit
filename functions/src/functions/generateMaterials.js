const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const getGeminiClient = () => {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const BASE_PROMPT = `You are an expert electrician assistant creating material estimates. You have extensive knowledge of current material pricing from Home Depot, Lowe's, and electrical supply houses.

## CRITICAL PRICING INSTRUCTIONS:
- Use CURRENT 2024-2025 retail prices from Home Depot/Lowe's
- Wire prices have increased significantly - 12/2 Romex 250ft is approximately $145-160, NOT $80-100
- Always estimate on the realistic side - contractors need accurate costs
- estimatedPrice = price PER UNIT (the app calculates totals)

## RESPONSE FORMAT:
Respond with ONLY valid JSON. No markdown, no code blocks, no explanation.
{"materials":[{"name":"Item description","quantity":1,"estimatedPrice":10.00,"notes":"Optional note"}]}`;

const RESIDENTIAL_RULES = `
## RESIDENTIAL ELECTRICAL RULES (NEC + Standard Practice):

**Wiring Methods:**
- NM-B (Romex) is standard for residential
- MC cable in exposed locations or per local code
- UF cable for underground/outdoor

**Wire Sizing:**
- 14 AWG → 15A breakers ONLY
- 12 AWG → 20A breakers ONLY  
- 10 AWG → 30A breakers
- 8 AWG → 40A breakers
- 6 AWG → 50-60A (ranges, subpanels)

**Standard Circuits:**
- General outlets (bedrooms, living rooms): 14/2 NM-B on 15A
- General lighting: 14/2 NM-B on 15A
- Bathroom receptacles: 12/2 NM-B on 20A GFCI (dedicated circuit)
- Kitchen countertop: 12/2 NM-B on 20A (minimum 2 circuits)
- Refrigerator: 12/2 NM-B on dedicated 20A
- Dishwasher: 12/2 NM-B on 20A
- Garbage disposal: 14/2 or 12/2 (check local code)
- Microwave: 12/2 NM-B on dedicated 20A
- Laundry: 12/2 NM-B on 20A
- Garage outlets: 12/2 NM-B on 20A GFCI
- Outdoor outlets: 12/2 NM-B on 20A GFCI
- Electric dryer: 10/3 NM-B on 30A
- Electric range: 6/3 NM-B or 8/3 on 40-50A

**Smoke/CO Detectors:**
- ALWAYS use 14/3 NM-B for interconnected detectors
- Red wire = interconnect signal
- Required: each bedroom, outside bedrooms, each floor

**GFCI/AFCI Protection:**
- ONE GFCI can protect multiple downstream outlets
- Bathrooms, kitchens, garage, outdoor, laundry, basement unfinished: GFCI required
- Bedrooms, living areas: AFCI required (breaker or outlet)
- Don't over-spec multiple GFCIs when one protects the circuit

**3-Way/4-Way Switches:**
- Use 14/3 between 3-way switches (or 12/3 on 20A)
- 4-way switches in middle of run use 14/4 or two 14/3

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
- 15A AFCI breaker: $35-45
- 20A AFCI breaker: $38-48
- 15A GFCI outlet: $18-24
- 20A GFCI outlet: $22-28
- Standard duplex outlet: $0.80-2
- Decora outlet: $2-4
- Single pole switch: $0.80-2
- 3-way switch: $3-6
- 4" LED recessed (6-pack): $45-65
- Smoke detector (hardwired): $25-40`;

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
- Exit sign LED: $25-50`;

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
- LED high bay 150W: $120-200`;

const JOB_TYPE_PROMPTS = {
  residential: RESIDENTIAL_RULES,
  commercial: COMMERCIAL_RULES,
  industrial: INDUSTRIAL_RULES,
};

exports.generateMaterials = onCall(
  {
    secrets: ["GEMINI_API_KEY"],
    timeoutSeconds: 60,
    memory: "256MiB",
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

    if (jobDescription.length > 1500) {
      throw new HttpsError(
        "invalid-argument",
        "Job description is too long. Please keep it under 1500 characters."
      );
    }

    const validJobTypes = ['residential', 'commercial', 'industrial'];
    const selectedJobType = validJobTypes.includes(jobType) ? jobType : 'residential';
    
    const systemPrompt = BASE_PROMPT + JOB_TYPE_PROMPTS[selectedJobType];

    try {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      });

      const jobTypeLabel = selectedJobType.charAt(0).toUpperCase() + selectedJobType.slice(1);
      
      const prompt = `${systemPrompt}

Generate a materials list for this ${jobTypeLabel} electrical job. Use CURRENT retail pricing. JSON only:

${jobDescription}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      console.log(`[${selectedJobType}] Raw AI response length:`, responseText.length);

      let parsedResponse;
      try {
        let cleanJson = responseText.trim();
        
        // Remove markdown code blocks if present
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.slice(7);
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.slice(3);
        }
        if (cleanJson.endsWith("```")) {
          cleanJson = cleanJson.slice(0, -3);
        }
        cleanJson = cleanJson.trim();
        
        // Extract JSON object
        const firstBrace = cleanJson.indexOf("{");
        const lastBrace = cleanJson.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }
        
        parsedResponse = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError.message);
        console.error("Response:", responseText.substring(0, 1000));
        throw new HttpsError(
          "internal",
          "Failed to parse AI response. Please try again."
        );
      }

      if (!parsedResponse.materials || !Array.isArray(parsedResponse.materials)) {
        throw new HttpsError(
          "internal",
          "Invalid AI response format. Please try again."
        );
      }

      // Flag threshold based on job type
      const flagThreshold = selectedJobType === 'industrial' ? 1500 : 
                           selectedJobType === 'commercial' ? 800 : 500;

      const materials = parsedResponse.materials
        .filter((mat) => mat.name && typeof mat.estimatedPrice === "number")
        .map((mat) => {
          let price = Number(mat.estimatedPrice) || 0;
          let flagged = price > flagThreshold;
          
          if (flagged) {
            console.warn(`High price flagged: ${mat.name} at $${price}`);
          }
          
          return {
            name: String(mat.name).substring(0, 200),
            quantity: Math.max(1, Math.round(Number(mat.quantity) || 1)),
            estimatedPrice: Math.max(0, Number(price.toFixed(2))),
            notes: mat.notes ? String(mat.notes).substring(0, 200) : null,
            flagged: flagged,
          };
        })
        .slice(0, 50);

      console.log(`[${selectedJobType}] Successfully parsed`, materials.length, "materials");

      return { materials };
    } catch (error) {
      console.error("AI Materials Generation Error:", error);

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
        "Failed to generate materials. Please try again."
      );
    }
  }
);