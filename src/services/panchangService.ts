import { PanchangData, MuhuratCategory } from "../types";

const TITHIS = [
  "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const COLORS = ["Yellow", "Saffron", "White", "Red", "Green", "Pink", "Blue"];

export function getPanchangForDate(dateStr: string): PanchangData {
  const date = new Date(dateStr);
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  
  // Deterministic "random" based on date for consistency
  const seed = date.getDate() + date.getMonth() * 31 + date.getFullYear();
  const pseudoRandom = (max: number) => (seed * 13 + 7) % max;
  
  const score = 60 + (pseudoRandom(40));
  const tithiIndex = (date.getDate() + date.getMonth() * 2) % 30;
  const nakshatraIndex = (date.getDate() + date.getMonth() * 3) % 27;
  
  const isMarriageAuspicious = pseudoRandom(100) > 70;
  const categories: string[] = ["Investment", "Puja"];
  if (isMarriageAuspicious) categories.push("Marriage");
  if (pseudoRandom(100) > 50) categories.push("Business Opening");
  if (pseudoRandom(100) > 60) categories.push("Vehicle Purchase");

  return {
    date: dateStr,
    day: dayName,
    auspiciousScore: score,
    bestFor: categories,
    avoid: ["Major conflicts", "South-direction travel"],
    muhuratTimings: ["6:15 AM - 8:02 AM", "10:45 AM - 12:20 PM", "7:10 PM - 9:00 PM"],
    tithi: `${pseudoRandom(100) > 50 ? 'Shukla' : 'Krishna'} Paksha ${TITHIS[tithiIndex]}`,
    nakshatra: NAKSHATRAS[nakshatraIndex],
    yoga: "Siddhi",
    karana: "Balava",
    sunrise: "5:42 AM",
    sunset: "6:12 PM",
    rahuKaal: "4:00 PM - 5:30 PM",
    moonSign: "Taurus",
    luckyColor: COLORS[pseudoRandom(COLORS.length)],
    luckyNumber: (pseudoRandom(9) + 1),
    planetaryNotes: [
      "Venus favorable for relationships",
      "Jupiter supports prosperity",
      "Moon aligned for emotional harmony"
    ],
    specialNote: score > 90 ? "This is considered a highly powerful celestial window." : "A stable day for routine spiritual practice."
  };
}

export function getMonthNames(): string[] {
  return [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
}

export function getAuspiciousDatesForYear(year: number, category: MuhuratCategory | "All" = "All") {
  // Mock function to return a list of dates for the year display
  const results = [];
  for (let m = 0; m < 12; m++) {
    for (let d = 1; d <= 28; d++) {
      const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const data = getPanchangForDate(dateStr);
      if (category === "All" || data.bestFor.includes(category)) {
        if (data.auspiciousScore > 80) {
          results.push(data);
        }
      }
    }
  }
  return results.slice(0, 20); // Return top 20 for the UI list
}
