const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const getGeminiClient = () => {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const RECEIPT_PROMPT = `You are a receipt scanner for an electrician's invoicing app. Analyze this receipt image and extract all line items.

## INSTRUCTIONS:
1. Extract each item name and its price
2. If quantity > 1, calculate the per-unit price (price ÷ quantity)
3. Ignore tax lines, subtotals, and totals - only extract actual purchased items
4. For electrical supplies, use clear descriptions (e.g., "1/2" EMT Conduit" not just product codes)

## RESPONSE FORMAT:
Return ONLY valid JSON with no markdown, no code blocks, no explanation:
{
  "items": [
    { "description": "Item name", "quantity": 1, "rate": 12.99 }
  ]
}

## RULES:
- description: Clear item name from receipt
- quantity: Number purchased (default 1 if unclear)
- rate: Price PER ITEM (not line total)
- If receipt is unreadable, return: {"items": [], "error": "Could not read receipt"}
- Do NOT include tax, subtotal, or total as line items
- Maximum 50 items`;

exports.scanReceipt = onCall(
  {
    secrets: ["GEMINI_API_KEY"],
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to scan receipts."
      );
    }

    const { imageBase64, mimeType = "image/jpeg" } = request.data;

    // Validate input
    if (!imageBase64 || typeof imageBase64 !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "Image data is required."
      );
    }

    // Check image size (base64 is ~33% larger than binary, limit to ~10MB image)
    if (imageBase64.length > 15000000) {
      throw new HttpsError(
        "invalid-argument",
        "Image is too large. Please use a smaller image."
      );
    }

    // Validate mime type
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    const selectedMimeType = validMimeTypes.includes(mimeType) ? mimeType : "image/jpeg";

    try {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.1, // Low temperature for more consistent extraction
          maxOutputTokens: 4000,
        },
      });

      // Create the multimodal content with image
      const result = await model.generateContent([
        RECEIPT_PROMPT,
        {
          inlineData: {
            mimeType: selectedMimeType,
            data: imageBase64,
          },
        },
      ]);

      const response = await result.response;
      const responseText = response.text();

      console.log("[scanReceipt] Raw AI response length:", responseText.length);

      // Parse JSON response
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
        console.error("[scanReceipt] JSON Parse Error:", parseError.message);
        console.error("[scanReceipt] Response:", responseText.substring(0, 500));
        throw new HttpsError(
          "internal",
          "Failed to parse receipt data. Please try again with a clearer photo."
        );
      }

      // Check for error in response
      if (parsedResponse.error) {
        return {
          success: false,
          error: parsedResponse.error,
          lineItems: [],
        };
      }

      // Process and validate items
      let items = [];
      if (parsedResponse.items && Array.isArray(parsedResponse.items)) {
        items = parsedResponse.items
          .filter((item) => item.description && typeof item.rate === "number")
          .map((item) => ({
            description: String(item.description).substring(0, 200).trim(),
            quantity: Math.max(1, Number(item.quantity) || 1),
            rate: Math.max(0, Number(Number(item.rate).toFixed(2))),
          }))
          .slice(0, 50); // Max 50 items
      }

      console.log("[scanReceipt] Parsed items:", items.length);

      if (items.length === 0) {
        return {
          success: false,
          error: "No items found in receipt. Please try a clearer photo.",
          lineItems: [],
        };
      }

      return {
        success: true,
        lineItems: items,
        itemCount: items.length,
      };
    } catch (error) {
      console.error("[scanReceipt] Error:", error);

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
        "Failed to scan receipt. Please try again."
      );
    }
  }
);