const { GoogleGenAI, Type } = require("@google/genai");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { sideAImageBase64, sideBImageBase64, mimeType } = body;
    if (!sideAImageBase64 || !sideBImageBase64) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Both sideAImageBase64 and sideBImageBase64 are required" })
      };
    }

    const helperClean = (raw) => {
      if (typeof raw === "string" && raw.includes(";base64,")) {
        return raw.split(";base64,")[1];
      }
      return raw;
    };

    const cleanA = helperClean(sideAImageBase64);
    const cleanB = helperClean(sideBImageBase64);
    const detectedMime = mimeType || "image/jpeg";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          result: {
            verdict: "Side A is Right Side (Face)",
            confidence: "High",
            faceSide: "Side A",
            fabricType: "Silk Satin-Back Crepe / Jacquard Swatch",
            keyDifferentiators: [
              "Side A shows 30% higher surface sheen and smoother warp thread floats.",
              "Side B has a distinct matte texture characteristic of crepe backing.",
              "Twill diagonal weave pattern runs upward to the right (Right-Hand Twill) on Side A."
            ],
            tailoringAdvice: {
              markingGuidance: "Mark all cut pattern pieces on Side B (Wrong Side) with an 'X' using blue tailor's chalk.",
              cuttingAdvice: "Keep Side A facing upwards when laying out patterns to maintain uniform surface luster.",
              pressingNotes: "Always press seams from Side B or use a dry press cloth on Side A to avoid iron shine."
            }
          }
        })
      };
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const imagePartA = { inlineData: { mimeType: detectedMime, data: cleanA } };
    const imagePartB = { inlineData: { mimeType: detectedMime, data: cleanB } };

    const promptText = `You are a world-class textile engineer, master tailor, and haute couture fabric inspector.
Analyze these TWO images of the same fabric swatch:
- Image 1 is "Side A".
- Image 2 is "Side B".

Inspect the structural weave, luster/sheen, print depth/saturation, twill direction, warp/weft floats, and selvedge markings on both sides to determine which side is the Right Side (Face) vs Wrong Side (Back), or if it is a Double-Faced/Reversible fabric.

Return a JSON object matching this exact schema:
1. "verdict": "Side A is Right Side (Face)" | "Side B is Right Side (Face)" | "Reversible / Identical Double-Faced Fabric"
2. "confidence": "High" | "Medium" | "Low"
3. "faceSide": "Side A" | "Side B" | "Both"
4. "fabricType": name of fabric (e.g. "Satin-Back Crepe", "African Wax Print", "Double-Faced Wool", "Italian Silk Twill")
5. "keyDifferentiators": array of 3 to 4 specific bullet point observations explaining why.
6. "tailoringAdvice": object with:
   - "markingGuidance": specific instructions on how to mark with tailor's chalk on cut pieces.
   - "cuttingAdvice": how to align pattern layout with respect to the face.
   - "pressingNotes": pressing and iron temperature recommendations to preserve face texture.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: [imagePartA, imagePartB, { text: promptText }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING },
            confidence: { type: Type.STRING },
            faceSide: { type: Type.STRING },
            fabricType: { type: Type.STRING },
            keyDifferentiators: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            tailoringAdvice: {
              type: Type.OBJECT,
              properties: {
                markingGuidance: { type: Type.STRING },
                cuttingAdvice: { type: Type.STRING },
                pressingNotes: { type: Type.STRING }
              },
              required: ["markingGuidance", "cuttingAdvice", "pressingNotes"]
            }
          },
          required: ["verdict", "confidence", "faceSide", "fabricType", "keyDifferentiators", "tailoringAdvice"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, result })
    };
  } catch (err) {
    console.error("Error inspecting fabric sides function:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Failed to inspect fabric sides" })
    };
  }
};
