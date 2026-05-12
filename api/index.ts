import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY) });
});

// Gemini API Proxy
app.post(["/api/generate-astrology", "/generate-astrology"], async (req, res) => {
  const { prompt } = req.body;
  
  const rawKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const apiKey = rawKey?.trim();
  
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY in environment variables.");
    return res.status(500).json({ 
      error: "GEMINI_API_KEY is not configured on the server.", 
      details: "Please add GEMINI_API_KEY to your Vercel Environment Variables and REDEPLOY the project." 
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response || !response.text) {
      throw new Error("AI returned an empty response.");
    }

    const responseText = response.text;
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
