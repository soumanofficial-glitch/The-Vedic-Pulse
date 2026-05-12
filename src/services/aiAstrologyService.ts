import { GoogleGenAI, Type } from "@google/genai";
import { BirthDetails, AstrologyReport } from "../types";

// Note: For GitHub Pages (static site), we call Gemini API from the browser.
// Ensure you set VITE_GEMINI_API_KEY in your deployment environment.
let genAIClient: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI {
  if (!genAIClient) {
    // Priority: Environment Variable -> Hardcoded Fallback
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBATs5zPTdPu2a72eDadxcu0YYVPBtZRrg";
    
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      throw new Error("Missing Gemini API Key. Please ensure the API key is correctly configured.");
    }
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

export async function generateAstrologyReport(details: BirthDetails, reportType: string): Promise<AstrologyReport> {
  const prompt = `
    You are an expert Vedic Astrologer. Generate a highly personalized ${reportType} for the following user:
    Name: ${details.name}
    DOB: ${details.dob}
    Time of Birth: ${details.tob}
    Place of Birth: ${details.pob}

    The report should feel spiritual, premium, and trustworthy. Use modern Indian English.
    Provide scores from 0-100 for Luck and Energy.
    Provide specific Vedic insights.
  `;

  try {
    const ai = getGenAIClient();

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            luckScore: { type: Type.NUMBER },
            energyScore: { type: Type.NUMBER },
            luckyColor: { type: Type.STRING },
            luckyNumber: { type: Type.NUMBER },
            favorableTimings: { type: Type.STRING },
            planetaryAlignment: { type: Type.STRING },
            relationshipEnergy: { type: Type.STRING },
            financialEnergy: { type: Type.STRING },
            personalizedInsight: { type: Type.STRING },
          },
          required: [
            "luckScore", 
            "energyScore", 
            "luckyColor", 
            "luckyNumber", 
            "favorableTimings", 
            "planetaryAlignment", 
            "relationshipEnergy", 
            "financialEnergy", 
            "personalizedInsight"
          ],
        },
      },
    });

    if (!response || !response.text) {
      throw new Error("Empty response from AI engine. Please try again.");
    }

    const result = JSON.parse(response.text.trim() || "{}");
    return result as AstrologyReport;
  } catch (error: any) {
    console.error("Error generating report:", error);
    
    // Check for common API errors
    if (error?.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid Gemini API Key. Please check your configuration.");
    }
    if (error?.message?.includes("quota")) {
      throw new Error("Daily limit reached for the AI service. Please try again tomorrow.");
    }
    
    throw error;
  }
}
