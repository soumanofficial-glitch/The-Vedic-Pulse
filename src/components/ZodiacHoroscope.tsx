import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Star, Moon, Sun, Info, Loader2 } from "lucide-react";
import { getDailyHoroscope } from "../services/aiAstrologyService";
import { DailyHoroscope as DailyHoroscopeType } from "../types";

const RASHIS = [
  { name: "Mesh", western: "Aries", symbol: "♈", dates: "Apr 14 - May 14", element: "Agni (Fire)" },
  { name: "Vrishabh", western: "Taurus", symbol: "♉", dates: "May 15 - Jun 14", element: "Prithvi (Earth)" },
  { name: "Mithun", western: "Gemini", symbol: "♊", dates: "Jun 15 - Jul 15", element: "Vayu (Air)" },
  { name: "Kark", western: "Cancer", symbol: "♋", dates: "Jul 16 - Aug 16", element: "Jal (Water)" },
  { name: "Simha", western: "Leo", symbol: "♌", dates: "Aug 17 - Sep 16", element: "Agni (Fire)" },
  { name: "Kanya", western: "Virgo", symbol: "♍", dates: "Sep 17 - Oct 16", element: "Prithvi (Earth)" },
  { name: "Tula", western: "Libra", symbol: "♎", dates: "Oct 17 - Nov 15", element: "Vayu (Air)" },
  { name: "Vrishchik", western: "Scorpio", symbol: "♏", dates: "Nov 16 - Dec 15", element: "Jal (Water)" },
  { name: "Dhanu", western: "Sagittarius", symbol: "♐", dates: "Dec 16 - Jan 13", element: "Agni (Fire)" },
  { name: "Makar", western: "Capricorn", symbol: "♑", dates: "Jan 14 - Feb 12", element: "Prithvi (Earth)" },
  { name: "Kumbh", western: "Aquarius", symbol: "♒", dates: "Feb 13 - Mar 13", element: "Vayu (Air)" },
  { name: "Meen", western: "Pisces", symbol: "♓", dates: "Mar 14 - Apr 13", element: "Jal (Water)" },
];

export const ZodiacHoroscope = ({ onSelect }: { onSelect?: (id: string, price: number) => void }) => {
  const [selectedRashi, setSelectedRashi] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<DailyHoroscopeType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRashi) {
      fetchHoroscope(selectedRashi);
    }
  }, [selectedRashi]);

  const fetchHoroscope = async (signName: string) => {
    setLoading(true);
    try {
      const rashi = RASHIS.find(r => r.name === signName);
      const data = await getDailyHoroscope(rashi?.western || signName);
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
            <span className="uppercase tracking-[0.4em] text-[10px] font-bold font-mono">Dainik Rashifal • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            <Star className="w-4 h-4" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Daily Vedic Rashi Guidance</h1>
          <p className="text-gray-400 max-w-2xl mx-auto italic">
            Select your Rashi (Moon Sign) to uncover the celestial alignment for your Karma, Artha, and Dharma today.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
          {RASHIS.map((rashi) => (
            <motion.button
              key={rashi.name}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRashi(rashi.name)}
              className={`p-6 rounded-[2rem] border transition-all duration-500 flex flex-col items-center justify-center gap-1 group ${
                selectedRashi === rashi.name 
                ? "bg-gold border-gold shadow-[0_0_30px_rgba(251,191,36,0.3)]" 
                : "bg-white/5 border-white/10 hover:border-gold/50"
              }`}
            >
              <span className={`text-4xl mb-1 transition-transform duration-500 group-hover:rotate-12 ${selectedRashi === rashi.name ? "text-navy" : "text-gold"}`}>
                {rashi.symbol}
              </span>
              <span className={`text-base font-black tracking-tight ${selectedRashi === rashi.name ? "text-navy" : "text-white"}`}>
                {rashi.name}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${selectedRashi === rashi.name ? "text-navy/60" : "text-amber-500/60"}`}>
                {rashi.western}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedRashi && (
            <motion.div
              key={selectedRashi}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] -mr-32 -mt-32" />
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  <p className="text-gold font-mono text-[10px] uppercase tracking-widest">Consulting Panchang...</p>
                </div>
              ) : dailyData ? (
                <div className="flex flex-col md:flex-row gap-12 relative z-10">
                  <div className="md:w-1/3">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center text-4xl text-gold">
                        {RASHIS.find(r => r.name === selectedRashi)?.symbol}
                      </div>
                      <div>
                        <h3 className="text-3xl font-serif text-white capitalize">{selectedRashi}</h3>
                        <p className="text-gold font-mono text-xs uppercase tracking-widest">
                          {RASHIS.find(r => r.name === selectedRashi)?.element}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <EnergyBar label="Karma & Career" value={dailyData.careerScore} />
                      <EnergyBar label="Artha (Finance)" value={dailyData.loveScore} />
                      <EnergyBar label="Health & Vitality" value={dailyData.healthScore} />
                    </div>
                  </div>

                  <div className="md:w-2/3 border-l border-white/10 md:pl-12">
                     <div className="flex items-center gap-2 text-gold mb-6">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-bold text-sm tracking-[0.2em] uppercase">Today's Drishti</span>
                     </div>
                     <p className="text-gray-300 text-lg leading-relaxed italic font-serif mb-8">
                       "{dailyData.prediction}"
                     </p>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[10px] text-amber-500 uppercase font-black tracking-widest mb-2">Shubh Color</div>
                          <div className="text-white font-serif text-lg">{dailyData.luckyColor}</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                          <div className="text-[10px] text-amber-500 uppercase font-black tracking-widest mb-2">Shubh Number</div>
                          <div className="text-white font-serif text-lg">{dailyData.luckyNumber}</div>
                        </div>
                     </div>

                      <div className="mt-10 flex flex-wrap gap-4">
                        <button 
                          onClick={() => onSelect?.("complete-future", 9)}
                          className="px-8 py-4 bg-gold text-navy font-bold rounded-2xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-gold/20"
                        >
                          Detailed Janam Kundli Analysis
                        </button>
                        <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2">
                          View Panchang
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
