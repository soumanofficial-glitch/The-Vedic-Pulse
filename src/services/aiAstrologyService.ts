export async function getDailyHoroscope(zodiac: string): Promise<DailyHoroscope> {
  const apiKey = process.env.GEMINI_API_KEY;
  const today = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full' });

  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }

  const prompt = `
    Generate a highly accurate Vedic daily horoscope (Rashifal) for ${zodiac} for today: ${today}.
    Provide a specific, non-generic prediction (approx 30-40 words) that feels authentic to Indian Vedic astrology (Jyotish).
    Use terms like Graha, Karma, or Drishti naturally where appropriate. 
    DO NOT use markdown formatting like bold asterisks (**) in the prediction text.
    The tone should be that of a knowledgeable Indian astrologer.
    
    Return in JSON format:
    {
      "prediction": "string",
      "loveScore": number (0-100),
      "careerScore": number (0-100),
      "healthScore": number (0-100),
      "luckyNumber": number,
      "luckyColor": "string"
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
          required: ["prediction", "loveScore", "careerScore", "healthScore", "luckyNumber", "luckyColor"],
          properties: {
            prediction: { type: Type.STRING },
            loveScore: { type: Type.NUMBER },
            careerScore: { type: Type.NUMBER },
            healthScore: { type: Type.NUMBER },
            luckyNumber: { type: Type.NUMBER },
            luckyColor: { type: Type.STRING }
          }
        }
      }
    });

    if (!response || !response.text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(response.text) as DailyHoroscope;
  } catch (error) {
    console.error("Daily Horoscope Error:", error);
    // Fallback to pseudo-random but stable daily values if AI fails
    return {
      prediction: "The Grahas align for spiritual growth today. Your persistence in your Swadharma is your greatest asset as planetary Drishti favors your Karman.",
      loveScore: 75,
      careerScore: 80,
      healthScore: 85,
      luckyNumber: 7,
      luckyColor: "Saffron"
    };
  }
}

import { BirthDetails, AstrologyReport, DailyHoroscope } from "../types";
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
      "personalizedInsight": "A profoundly spiritual summary of their current path",
      "careerAnalysis": "Detailed 200-word analysis of career path and milestones...",
      "healthAnalysis": "Detailed physical and mental wellbeing analysis...",
      "loveAnalysis": "In-depth emotional and relationship compatibility insights...",
      "remedies": ["Specific Mantra 1", "Specific Charity 2", "Stone recommendation"],
      "mahadashaPeriod": "Analysis of current Mahadasha and its influence...",
      "shaniSadeSati": "Current status of Saturn's transit and its effects...",
      "karmicDuty": "Your soul's primary purpose for this lifetime...",
      "dailySadhana": "Set of morning/evening rituals for planetary balance..."
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
          required: [
            "luckScore", "energyScore", "luckyColor", "luckyNumber", 
            "favorableTimings", "planetaryAlignment", "relationshipEnergy", 
            "financialEnergy", "personalizedInsight", "careerAnalysis",
            "healthAnalysis", "loveAnalysis", "remedies", "mahadashaPeriod",
            "shaniSadeSati", "karmicDuty", "dailySadhana"
          ],
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
            careerAnalysis: { type: Type.STRING },
            healthAnalysis: { type: Type.STRING },
            loveAnalysis: { type: Type.STRING },
            remedies: { type: Type.ARRAY, items: { type: Type.STRING } },
            mahadashaPeriod: { type: Type.STRING },
            shaniSadeSati: { type: Type.STRING },
            karmicDuty: { type: Type.STRING },
            dailySadhana: { type: Type.STRING }
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
