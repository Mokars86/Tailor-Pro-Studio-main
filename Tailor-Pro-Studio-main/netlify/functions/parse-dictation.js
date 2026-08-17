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
    const transcript = body.transcript;
    if (!transcript) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Transcript is required" })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ measurements: {}, success: false, reason: "No GEMINI_API_KEY available" })
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
    const cleanMeasurements = {};
    Object.entries(parsed).forEach(([key, val]) => {
      if (val && typeof val === 'string' && val.trim() !== '') {
        cleanMeasurements[key] = val.trim();
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ measurements: cleanMeasurements, success: true })
    };
  } catch (err) {
    console.error("Error parsing dictation function:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Failed to parse dictation" })
    };
  }
};
