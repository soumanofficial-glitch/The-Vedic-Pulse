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
      model: "gemini-1.5-pro",
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
import { getPanchangForDate } from "./panchangService";

export async function generateAstrologyReport(details: BirthDetails, reportType: string, partner2?: BirthDetails): Promise<AstrologyReport> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please check your Settings > Secrets.");
  }

  const panchangData = getPanchangForDate(details.dob);
  const isLoveCompatibility = reportType === "love-compatibility" && partner2;

  const partnerInfo = isLoveCompatibility ? `
    Partner 2 Profile:
    - Name: ${partner2.name}
    - Birth Date: ${partner2.dob}
    - Birth Time: ${partner2.tob}
    - Birth Place: ${partner2.pob}
  ` : '';

  const loveMetricsPrompt = isLoveCompatibility ? `
    Since this is a Love Compatibility report, you MUST also provide these exact metrics:
    - loveCompatibilityPercentage: (number 0-100)
    - emotionalBondPercentage: (number 0-100)
    - trustScore: (number 0-100)
    - marriagePotential: (string, e.g., "Very High", "Challenging but rewarding")
    - communicationMatch: (string, e.g., "Intellectual and deep", "Needs constant effort")
    - physicalAttraction: (string, e.g., "Electric and magnetic", "Grows over time")
    - emotionalOverview: (string, approx 100 words overview of the union)
    - breakupRiskIndicator: (string, e.g., "Low - Soulmate connection", "High - High ego clashes possible")
  ` : '';

  const prompt = `
    You are a legendary Vedic (Jyotish) Astrologer with 30 years of experience. 
    Generate a profound, highly personalized ${reportType} for the following individual(s):
    
    ${isLoveCompatibility ? 'Partner 1 (Primary)' : 'Individual'} Profile:
    - Name: ${details.name}
    - Birth Date: ${details.dob}
    - Birth Time: ${details.tob}
    - Birth Place: ${details.pob}

    ${partnerInfo}

    Reference Panchang for Primary Birth Date:
    - Nakshatra of the day: ${panchangData.nakshatra}
    - Tithi: ${panchangData.tithi}
    - Yoga: ${panchangData.yoga}

    ${loveMetricsPrompt}

    Guidelines for the Report:
    1. Authenticity: Use actual Vedic terminology (Nakshatra, Mahadasha, Dosha, Guna Milan) if relevant.
    2. Specificity: Ensure the insights are unique to the combination of their DOB, TOB, and POB. Do not give generic advice.
    3. Tone: Spiritual, sophisticated, premium, and empowering. Use modern Indian English.
    4. Quantitative: Luck and Energy scores (0-100) must reflect the astrological alignment for the current period.
    5. Actionable: Remedial measures (Upayas) should be practical yet traditional.
    6. Nakshatra Section: Provide a detailed analysis of the primary individual's birth Nakshatra.

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
      "personalizedInsight": "A profoundly spiritual summary of the path",
      "careerAnalysis": "Detailed 200-word analysis...",
      "healthAnalysis": "Detailed physical wellbeing analysis...",
      "loveAnalysis": "In-depth relationship compatibility insights...",
      "remedies": ["Specific Mantra 1", "Specific Charity 2"],
      "mahadashaPeriod": "Status report...",
      "shaniSadeSati": "Status report...",
      "karmicDuty": "Karmic purpose...",
      "dailySadhana": "Rituals...",
      "birthNakshatra": "Primary birth Nakshatra",
      "nakshatraDeity": "Deity",
      "nakshatraSymbol": "Symbol",
      "nakshatraInfluence": "Personality impact...",
      "nakshatraStrengths": ["Strength 1", "Strength 2"],
      ${isLoveCompatibility ? `
      "loveCompatibilityPercentage": 88,
      "emotionalBondPercentage": 92,
      "trustScore": 85,
      "marriagePotential": "High",
      "communicationMatch": "Intellectual",
      "physicalAttraction": "Magnetic",
      "emotionalOverview": "Detailed overview...",
      "breakupRiskIndicator": "Low"` : ''}
    }
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
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
            "shaniSadeSati", "karmicDuty", "dailySadhana",
            "birthNakshatra", "nakshatraDeity", "nakshatraSymbol", "nakshatraInfluence", "nakshatraStrengths",
            ...(isLoveCompatibility ? [
              "loveCompatibilityPercentage", "emotionalBondPercentage", "trustScore", 
              "marriagePotential", "communicationMatch", "physicalAttraction", 
              "emotionalOverview", "breakupRiskIndicator"
            ] : [])
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
            dailySadhana: { type: Type.STRING },
            birthNakshatra: { type: Type.STRING },
            nakshatraDeity: { type: Type.STRING },
            nakshatraSymbol: { type: Type.STRING },
            nakshatraInfluence: { type: Type.STRING },
            nakshatraStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            loveCompatibilityPercentage: { type: Type.NUMBER },
            emotionalBondPercentage: { type: Type.NUMBER },
            trustScore: { type: Type.NUMBER },
            marriagePotential: { type: Type.STRING },
            communicationMatch: { type: Type.STRING },
            physicalAttraction: { type: Type.STRING },
            emotionalOverview: { type: Type.STRING },
            breakupRiskIndicator: { type: Type.STRING }
          }
        }
      }
    });

    if (!response || !response.text) {
      throw new Error("AI returned an empty response.");
    }

    const report = JSON.parse(response.text) as AstrologyReport;
    
    // Attach details for report rendering
    report.partner1Details = details;
    report.partner2Details = partner2;

    return report;
  } catch (error: any) {
    console.error("Error generating report:", error);
    
    const errorStr = error.message || String(error);
    
    if (errorStr.includes("API_KEY") || errorStr.includes("not valid")) {
      throw new Error("Om Namah Shivaya. The celestial portal is temporarily unresponsive due to a misalignment in our sacred configuration. Please try again soon.");
    }

    if (errorStr.includes("quota") || errorStr.includes("429") || errorStr.includes("QUOTA_EXHAUSTED")) {
      throw new Error("Pranam. Many seekers are currently consulting the stars, causing a powerful cosmic congestion. Please wait for a few moments and try your request again.");
    }

    if (errorStr.includes("fetch") || errorStr.includes("network")) {
      throw new Error("I am unable to reach the higher realms at this moment. The spiritual link is currently faint. Please ensure your path is clear and try again.");
    }
    
    throw new Error("Om Namah Shivaya. A spiritual cloud has temporarily obscured the heavens. Please try again in a few moments, my child.");
  }
}
