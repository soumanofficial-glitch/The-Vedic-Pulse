import { BirthDetails, AstrologyReport } from "../types";

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
    const response = await fetch("/api/generate-astrology", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate report");
    }

    const result = await response.json();
    return result as AstrologyReport;
  } catch (error: any) {
    console.error("Error generating report:", error);
    
    if (error.message?.includes("API_KEY")) {
      throw new Error("The AI service is currently unavailable. Please ensure the server is properly configured.");
    }
    
    throw error;
  }
}
