const { onCall, HttpsError } = require("firebase-functions/v2/https");
const Anthropic = require("@anthropic-ai/sdk");

// Initialize Anthropic client
// Store your API key in Firebase environment config:
// firebase functions:secrets:set ANTHROPIC_API_KEY
const getAnthropicClient = () => {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
};

const SYSTEM_PROMPT = `You are an expert electrician assistant helping create accurate material estimates. 
You have deep knowledge of:
- NEC (National Electrical Code) requirements
- Common electrical materials, brands, and current pricing
- Standard installation practices and labor considerations
- Wire sizing based on amperage and distance (voltage drop calculations)
- Breaker and panel requirements
- Conduit sizing and types
- Safety equipment and permit requirements

When given a job description, generate a comprehensive list of materials needed.
Be specific with material specifications (wire gauge, conduit size, breaker amperage, etc.).
Include quantities based on typical job requirements.
Estimate prices based on current retail/wholesale pricing (Home Depot, electrical supply house ranges).

IMPORTANT: Always respond with valid JSON only, no markdown or explanation text.

Response format (JSON array):
{
  "materials": [
    {
      "name": "Material name with specs (e.g., '200A Main Breaker Panel')",
      "quantity": 1,
      "estimatedPrice": 285.00,
      "notes": "Optional brief note about selection"
    }
  ]
}

Guidelines:
- Include all necessary materials, even small items (wire nuts, staples, etc.)
- Use realistic current market prices
- Round prices to reasonable amounts
- Include permit fees when applicable
- For wire, specify gauge and type (THHN, NM-B, etc.)
- Consider both materials and consumables`;

exports.generateMaterials = onCall(
  {
    secrets: ["ANTHROPIC_API_KEY"],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request) => {
    // Verify the user is authenticated
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to use AI features."
      );
    }

    const { jobDescription } = request.data;

    if (!jobDescription || typeof jobDescription !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "Job description is required."
      );
    }

    if (jobDescription.length > 1000) {
      throw new HttpsError(
        "invalid-argument",
        "Job description is too long. Please keep it under 1000 characters."
      );
    }

    try {
      const anthropic = getAnthropicClient();

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Generate a materials list for this electrical job:\n\n${jobDescription}`,
          },
        ],
        system: SYSTEM_PROMPT,
      });

      // Extract the text content from the response
      const responseText = message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");

      // Parse the JSON response
      let parsedResponse;
      try {
        // Handle potential markdown code blocks
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.replace(/^```json\n?/, "").replace(/\n?```$/, "");
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```\n?/, "").replace(/\n?```$/, "");
        }
        
        parsedResponse = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("Failed to parse AI response:", responseText);
        throw new HttpsError(
          "internal",
          "Failed to parse AI response. Please try again."
        );
      }

      // Validate the response structure
      if (!parsedResponse.materials || !Array.isArray(parsedResponse.materials)) {
        throw new HttpsError(
          "internal",
          "Invalid AI response format. Please try again."
        );
      }

      // Sanitize and validate each material
      const materials = parsedResponse.materials
        .filter((mat) => mat.name && typeof mat.estimatedPrice === "number")
        .map((mat) => ({
          name: String(mat.name).substring(0, 200),
          quantity: Math.max(1, Math.round(Number(mat.quantity) || 1)),
          estimatedPrice: Math.max(0, Number(mat.estimatedPrice.toFixed(2))),
          notes: mat.notes ? String(mat.notes).substring(0, 200) : null,
        }))
        .slice(0, 50); // Limit to 50 items max

      return { materials };
    } catch (error) {
      console.error("AI Materials Generation Error:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      // Handle Anthropic API errors
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