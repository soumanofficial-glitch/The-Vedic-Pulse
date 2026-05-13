export interface BirthDetails {
  name: string;
  dob: string;
  tob: string;
  pob: string;
}

export interface AstrologyReport {
  luckScore: number;
  energyScore: number;
  luckyColor: string;
  luckyNumber: number;
  favorableTimings: string;
  planetaryAlignment: string;
  relationshipEnergy: string;
  financialEnergy: string;
  personalizedInsight: string;
  // Expanded fields for 55+ page equivalent report
  careerAnalysis: string;
  healthAnalysis: string;
  loveAnalysis: string;
  remedies: string[];
  mahadashaPeriod: string;
  shaniSadeSati: string;
  karmicDuty: string;
  dailySadhana: string;
}

export interface DailyHoroscope {
  prediction: string;
  loveScore: number;
  careerScore: number;
  healthScore: number;
  luckyNumber: number;
  luckyColor: string;
}

export interface PanchangData {
  date: string;
  day: string;
  auspiciousScore: number;
  bestFor: string[];
  avoid: string[];
  muhuratTimings: string[];
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  rahuKaal: string;
  moonSign: string;
  luckyColor: string;
  luckyNumber: number;
  planetaryNotes: string[];
  specialNote: string;
}

export type MuhuratCategory = 
  | "Marriage" 
  | "Griha Pravesh" 
  | "Vehicle Purchase" 
  | "Business Opening" 
  | "Property Registration" 
  | "Naming Ceremony" 
  | "Investment" 
  | "Puja" 
  | "Travel" 
  | "Education";
