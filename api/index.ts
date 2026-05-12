import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

// Gemini API Proxy
app.post("/api/generate-astrology", async (req, res) => {
  const { prompt } = req.body;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
  }

  try {
    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    // Safety check for parsing JSON from Gemini
    try {
        const cleanText = responseText.replace(/```json\n?|\n?```/g, "").trim();
        res.json(JSON.parse(cleanText));
    } catch (e) {
        res.json({ error: "Failed to parse AI response as JSON", raw: responseText });
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate astrology report" });
  }
});

// Since this is for Vercel, we export the app
export default app;
