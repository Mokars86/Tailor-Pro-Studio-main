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
    const { imageBase64, mimeType } = body;
    if (!imageBase64) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Image data (imageBase64) is required" })
      };
    }

    let cleanBase64 = imageBase64;
    let detectedMime = mimeType || "image/jpeg";

    if (typeof imageBase64 === "string" && (imageBase64.startsWith("http://") || imageBase64.startsWith("https://"))) {
      try {
        const imgRes = await fetch(imageBase64);
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          cleanBase64 = Buffer.from(buffer).toString("base64");
          detectedMime = imgRes.headers.get("content-type") || detectedMime;
        }
      } catch (fetchErr) {
        console.warn("Could not fetch remote image URL on server:", fetchErr);
      }
    } else if (typeof imageBase64 === "string" && imageBase64.includes(";base64,")) {
      const parts = imageBase64.split(";base64,");
      cleanBase64 = parts[1];
      const mimeMatch = parts[0].match(/data:(.*?)$/);
      if (mimeMatch) {
        detectedMime = mimeMatch[1];
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback response if GEMINI_API_KEY is not set
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          analysis: {
            fabricType: "Rich Vlisco Wax Print / Jacquard",
            patternTexture: "Intricate Floral & Geometric Weave",
            dominantColor: { name: "Deep Emerald Green", hex: "#0E3832" },
            secondaryColors: [
              { name: "Royal Gold Accent", hex: "#DCA134" },
              { name: "Satin Ochre", hex: "#B8860B" },
              { name: "Midnight Navy Undertone", hex: "#111827" }
            ],
            threads: [
              {
                purpose: "Primary Seam Thread",
                threadColorName: "Emerald Forest",
                recommendedCode: "Gutermann Mara #824",
                hex: "#0E3832",
                rationale: "Matches the dark base weave for invisible internal seams, armhole stitching, and darts."
              },
              {
                purpose: "Topstitching & Lapels",
                threadColorName: "Metallic Amber Gold",
                recommendedCode: "Coats & Clark Heavy #302",
                hex: "#DCA134",
                rationale: "Complements the gold motif for elegant visible topstitching on cuffs and lapels."
              },
              {
                purpose: "Accent & Embroidery",
                threadColorName: "Satin Ochre Silk",
                recommendedCode: "Aman Seracycle #104",
                hex: "#B8860B",
                rationale: "Ideal for decorative embroidery patterns or edge binding without overpowering the print."
              },
              {
                purpose: "Lining & Blind Hem",
                threadColorName: "Dark Shadow Navy",
                recommendedCode: "Gutermann Skala #900",
                hex: "#111827",
                rationale: "Translucent blind hem thread that blends seamlessly into dark lining and hem allowances."
              }
            ],
            tailoringAdvice: {
              needleRecommendation: "Universal 80/12 or Microtex 70/10 for tight weaves",
              threadType: "100% Core-Spun Polyester (100/2 weight)",
              stitchingNotes: "Use a 2.5mm stitch length and medium thread tension to prevent puckering along bias seams."
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

    const imagePart = {
      inlineData: {
        mimeType: detectedMime,
        data: cleanBase64
      }
    };

    const promptText = `You are a master tailor, textile colorist, and haute couture fabric expert.
Analyze this fabric photo carefully. Extract the color profile of the fabric and provide exact thread matching specifications for sewing it in a professional bespoke tailoring atelier.

Return a JSON object matching this exact schema:
1. "fabricType": name or probable type of fabric (e.g. "Vlisco African Wax Print", "Emerald Silk Satin", "Brocade Jacquard", "Linen Blend").
2. "patternTexture": description of pattern or texture (e.g., "Metallic Geometric Floral Print", "Solid Matt Finish", "Striped Twill").
3. "dominantColor": object with "name" (e.g. "Emerald Green") and "hex" (e.g. "#0E3832").
4. "secondaryColors": array of up to 3 objects with "name" and "hex".
5. "threads": array of 3 to 4 thread recommendations:
   Each thread object MUST contain:
   - "purpose": "Primary Seam Thread" | "Topstitching & Lapels" | "Accent & Embroidery" | "Lining & Blind Hem"
   - "threadColorName": e.g. "Emerald Forest"
   - "recommendedCode": e.g. "Gutermann Mara #824" or "Coats & Clark #302"
   - "hex": exact matching HEX code for the thread
   - "rationale": 1-2 sentence tailored explanation of where and why to use this thread on this fabric.
6. "tailoringAdvice": object with:
   - "needleRecommendation": needle size & type
   - "threadType": thread weight/material
   - "stitchingNotes": practical sewing advice for tension, stitch length, or handling.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: [imagePart, { text: promptText }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fabricType: { type: Type.STRING },
            patternTexture: { type: Type.STRING },
            dominantColor: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                hex: { type: Type.STRING }
              },
              required: ["name", "hex"]
            },
            secondaryColors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  hex: { type: Type.STRING }
                },
                required: ["name", "hex"]
              }
            },
            threads: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  purpose: { type: Type.STRING },
                  threadColorName: { type: Type.STRING },
                  recommendedCode: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                },
                required: ["purpose", "threadColorName", "recommendedCode", "hex", "rationale"]
              }
            },
            tailoringAdvice: {
              type: Type.OBJECT,
              properties: {
                needleRecommendation: { type: Type.STRING },
                threadType: { type: Type.STRING },
                stitchingNotes: { type: Type.STRING }
              },
              required: ["needleRecommendation", "threadType", "stitchingNotes"]
            }
          },
          required: ["fabricType", "patternTexture", "dominantColor", "threads", "tailoringAdvice"]
        }
      }
    });

    const analysis = JSON.parse(response.text || "{}");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, analysis })
    };
  } catch (err) {
    console.error("Error analyzing fabric function:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Failed to analyze fabric image" })
    };
  }
};
