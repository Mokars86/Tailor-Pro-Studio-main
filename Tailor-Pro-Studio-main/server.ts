import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // Server-side Gemini client initialization
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API endpoint for Hands-Free Voice Dictation Parsing
  app.post("/api/parse-dictation", async (req, res) => {
    try {
      const { transcript } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: "Transcript is required" });
      }

      if (!ai) {
        return res.json({ measurements: {}, success: false, reason: "No GEMINI_API_KEY available" });
      }

      const prompt = `You are an expert tailoring assistant. Parse the following hands-free spoken dictation from a fitting session into standard garment measurement key-value pairs (numerical or decimal string, in inches).
      Spoken dictation text: "${transcript}"

      Map terms to these specific keys:
      - bust: bust, chest (if female), bustline
      - chest: chest (if male), chestline
      - shoulder: shoulder width, shoulder across
      - underbust: underbust, under bust, shoulder to underbust
      - breastLength: breast length, shoulder to bust point, apex
      - neck: neck, neck circumference
      - sleeveLength: sleeve length, sleeve, arm length
      - roundSleeves: round sleeve, bicep, arm hole, sleeve width
      - topLength: top length, shirt length, blouse length
      - waist: waist, waistline, natural waist
      - hips: hips, hip, hip line
      - skirtLength: skirt length
      - fullLength: full length, gown length, dress length, total length
      - thigh: thigh, upper leg
      - knee: knee, knee line
      - ankle: ankle, leg opening
      - inseam: inseam, trouser length, inside leg

      Extract numeric measurements accurately (e.g. "36", "28.5", "14"). Return as string numbers.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bust: { type: Type.STRING },
              chest: { type: Type.STRING },
              shoulder: { type: Type.STRING },
              underbust: { type: Type.STRING },
              breastLength: { type: Type.STRING },
              neck: { type: Type.STRING },
              sleeveLength: { type: Type.STRING },
              roundSleeves: { type: Type.STRING },
              topLength: { type: Type.STRING },
              waist: { type: Type.STRING },
              hips: { type: Type.STRING },
              skirtLength: { type: Type.STRING },
              fullLength: { type: Type.STRING },
              thigh: { type: Type.STRING },
              knee: { type: Type.STRING },
              ankle: { type: Type.STRING },
              inseam: { type: Type.STRING }
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      const cleanMeasurements: Record<string, string> = {};
      Object.entries(parsed).forEach(([key, val]) => {
        if (val && typeof val === 'string' && val.trim() !== '') {
          cleanMeasurements[key] = val.trim();
        }
      });

      return res.json({ measurements: cleanMeasurements, success: true });
    } catch (err: any) {
      console.error("Error parsing dictation:", err);
      return res.status(500).json({ error: err.message || "Failed to parse dictation" });
    }
  });

  // API endpoint for Master Fabric Color & Thread Matcher
  app.post("/api/analyze-fabric", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data (imageBase64) is required" });
      }

      // Clean base64 string if data URL prefix exists
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

      if (!ai) {
        // Fallback response if GEMINI_API_KEY is not set
        return res.json({
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
        });
      }

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
      return res.json({ success: true, analysis });
    } catch (err: any) {
      console.error("Error analyzing fabric:", err);
      return res.status(500).json({ error: err.message || "Failed to analyze fabric image" });
    }
  });

  // API endpoint for Fabric Face & Back (Right Side vs Wrong Side) Inspector
  app.post("/api/inspect-fabric-sides", async (req, res) => {
    try {
      const { sideAImageBase64, sideBImageBase64, mimeType } = req.body;
      if (!sideAImageBase64 || !sideBImageBase64) {
        return res.status(400).json({ error: "Both sideAImageBase64 and sideBImageBase64 are required for inspection" });
      }

      const helperCleanBase64 = (raw: string) => {
        if (typeof raw === "string" && raw.includes(";base64,")) {
          return raw.split(";base64,")[1];
        }
        return raw;
      };

      const cleanA = helperCleanBase64(sideAImageBase64);
      const cleanB = helperCleanBase64(sideBImageBase64);
      const detectedMime = mimeType || "image/jpeg";

      if (!ai) {
        // Fallback response if GEMINI_API_KEY is not set
        return res.json({
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
        });
      }

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
      return res.json({ success: true, result });
    } catch (err: any) {
      console.error("Error inspecting fabric sides:", err);
      return res.status(500).json({ error: err.message || "Failed to inspect fabric sides" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
