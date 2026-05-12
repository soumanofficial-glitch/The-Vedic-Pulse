import { BirthDetails, AstrologyReport } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

export async function generateAstrologyReport(details: BirthDetails, reportType: string): Promise<AstrologyReport> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please check your Settings > Secrets.");
  }

  const prompt = `
    You are a legendary Vedic (Jyotish) Astrologer with 30 years of experience. 
    Generate a profound, highly personalized ${reportType} for the following individual:
    
    Individual Profile:
    - Name: ${details.name}
    - Birth Date: ${details.dob}
    - Birth Time: ${details.tob}
    - Birth Place: ${details.pob}

    Guidelines for the Report:
    1. Authenticity: Use actual Vedic terminology (Nakshatra, Mahadasha, Dosha) if relevant.
    2. Specificity: Ensure the insights are unique to the combination of their DOB, TOB, and POB. Do not give generic advice.
    3. Tone: Spiritual, sophisticated, premium, and empowering. Use modern Indian English.
    4. Quantitative: Luck and Energy scores (0-100) must reflect the astrological alignment for the current period.
    5. Actionable: Remedial measures (Upayas) should be practical yet traditional.

    Return the data in the following JSON format ONLY:
    {
      "luckScore": 85,
      "energyScore": 92,
      "luckyColor": "Emerald Green",
      "luckyNumber": 7,
      "favorableTimings": "Morning between 7:30 AM and 9:15 AM",
      "planetaryAlignment": "Jupiter is strongly positioned in your 9th house, bringing expansion.",
      "relationshipEnergy": "Vibrant and harmonious",
      "financialEnergy": "Stable with growth potential",
      "personalizedInsight": "A profoundly spiritual summary of their current path"
    }
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["luckScore", "energyScore", "luckyColor", "luckyNumber", "favorableTimings", "planetaryAlignment", "relationshipEnergy", "financialEnergy", "personalizedInsight"],
          properties: {
            luckScore: { type: Type.NUMBER },
            energyScore: { type: Type.NUMBER },
            luckyColor: { type: Type.STRING },
            luckyNumber: { type: Type.NUMBER },
            favorableTimings: { type: Type.STRING },
            planetaryAlignment: { type: Type.STRING },
            relationshipEnergy: { type: Type.STRING },
            financialEnergy: { type: Type.STRING },
            personalizedInsight: { type: Type.STRING }
          }
        }
      }
    });

    if (!response || !response.text) {
      throw new Error("AI returned an empty response. Please ensure your Gemini API key is active.");
    }

    return JSON.parse(response.text) as AstrologyReport;
  } catch (error: any) {
    console.error("Error generating report:", error);
    
    if (error.message?.includes("API_KEY") || error.message?.includes("not valid")) {
      throw new Error("Gemini API key is invalid or not found. Please check your Settings > Secrets.");
    }
    
    throw error;
  }
}
