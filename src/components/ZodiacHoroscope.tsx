import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Star, Moon, Sun, Info, Loader2 } from "lucide-react";
import { getDailyHoroscope } from "../services/aiAstrologyService";
import { DailyHoroscope as DailyHoroscopeType } from "../types";

const ZODIACS = [
  { name: "Aries", symbol: "♈", dates: "Mar 21 - Apr 19", element: "Fire" },
  { name: "Taurus", symbol: "♉", dates: "Apr 20 - May 20", element: "Earth" },
  { name: "Gemini", symbol: "♊", dates: "May 21 - Jun 20", element: "Air" },
  { name: "Cancer", symbol: "♋", dates: "Jun 21 - Jul 22", element: "Water" },
  { name: "Leo", symbol: "♌", dates: "Jul 23 - Aug 22", element: "Fire" },
  { name: "Virgo", symbol: "♍", dates: "Aug 23 - Sep 22", element: "Earth" },
  { name: "Libra", symbol: "♎", dates: "Sep 23 - Oct 22", element: "Air" },
  { name: "Scorpio", symbol: "♏", dates: "Oct 23 - Nov 21", element: "Water" },
  { name: "Sagittarius", symbol: "♐", dates: "Nov 22 - Dec 21", element: "Fire" },
  { name: "Capricorn", symbol: "♑", dates: "Dec 22 - Jan 19", element: "Earth" },
  { name: "Aquarius", symbol: "♒", dates: "Jan 20 - Feb 18", element: "Air" },
  { name: "Pisces", symbol: "♓", dates: "Feb 19 - Mar 20", element: "Water" },
];

export const ZodiacHoroscope = ({ onSelect }: { onSelect?: (id: string, price: number) => void }) => {
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<DailyHoroscopeType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedZodiac) {
      fetchHoroscope(selectedZodiac);
    }
  }, [selectedZodiac]);

  const fetchHoroscope = async (sign: string) => {
    setLoading(true);
    try {
      const data = await getDailyHoroscope(sign);
      setDailyData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="horoscope" className="py-24 px-4 bg-[#020617]/50 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-gold mb-4"
          >
            <Star className="w-4 h-4" />
            <span className="uppercase tracking-[0.4em] text-[10px] font-bold font-mono">Daily Guidance • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            <Star className="w-4 h-4" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Zodiac Daily Horoscopes</h1>
          <p className="text-gray-400 max-w-2xl mx-auto italic">
            Select your sun sign to uncover the celestial alignment for your love, career, and spiritual growth today.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
          {ZODIACS.map((zodiac) => (
            <motion.button
              key={zodiac.name}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedZodiac(zodiac.name)}
              className={`p-6 rounded-[2rem] border transition-all duration-500 flex flex-col items-center justify-center gap-2 group ${
                selectedZodiac === zodiac.name 
                ? "bg-gold border-gold shadow-[0_0_30px_rgba(251,191,36,0.3)]" 
                : "bg-white/5 border-white/10 hover:border-gold/50"
              }`}
            >
              <span className={`text-4xl mb-2 transition-transform duration-500 group-hover:rotate-12 ${selectedZodiac === zodiac.name ? "text-navy" : "text-gold"}`}>
                {zodiac.symbol}
              </span>
              <span className={`text-sm font-bold tracking-widest uppercase ${selectedZodiac === zodiac.name ? "text-navy" : "text-white"}`}>
                {zodiac.name}
              </span>
              <span className={`text-[10px] ${selectedZodiac === zodiac.name ? "text-navy/70" : "text-gray-500"}`}>
                {zodiac.dates}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedZodiac && (
            <motion.div
              key={selectedZodiac}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] -mr-32 -mt-32" />
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  <p className="text-gold font-mono text-[10px] uppercase tracking-widest">Consulting the Stars...</p>
                </div>
              ) : dailyData ? (
                <div className="flex flex-col md:flex-row gap-12 relative z-10">
                  <div className="md:w-1/3">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center text-4xl text-gold">
                        {ZODIACS.find(z => z.name === selectedZodiac)?.symbol}
                      </div>
                      <div>
                        <h3 className="text-3xl font-serif text-white capitalize">{selectedZodiac}</h3>
                        <p className="text-gold font-mono text-xs uppercase tracking-widest">
                          {ZODIACS.find(z => z.name === selectedZodiac)?.element} Element
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <EnergyBar label="Love & Relationships" value={dailyData.loveScore} />
                      <EnergyBar label="Career & Finance" value={dailyData.careerScore} />
                      <EnergyBar label="Health & Vitality" value={dailyData.healthScore} />
                    </div>
                  </div>

                  <div className="md:w-2/3 border-l border-white/10 md:pl-12">
                     <div className="flex items-center gap-2 text-gold mb-6">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-bold text-sm tracking-[0.2em] uppercase">Today's Cosmic Pulse</span>
                     </div>
                     <p className="text-gray-300 text-lg leading-relaxed italic font-serif mb-8">
                       "{dailyData.prediction}"
                     </p>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Power Color</div>
                          <div className="text-white font-serif text-lg">{dailyData.luckyColor}</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Lucky Number</div>
                          <div className="text-white font-serif text-lg">{dailyData.luckyNumber}</div>
                        </div>
                     </div>

                      <div className="mt-10 flex flex-wrap gap-4">
                        <button 
                          onClick={() => onSelect?.("complete-future", 9)}
                          className="px-8 py-4 bg-gold text-navy font-bold rounded-2xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-gold/20"
                        >
                          Get Full 55-Page Report
                        </button>
                        <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2">
                          Explore More Signs
                        </button>
                     </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const EnergyBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</span>
      <span className="text-xs text-gold font-mono">{value}%</span>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-gold rounded-full" 
      />
    </div>
  </div>
);
