import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MapPin, 
  Heart, 
  Home, 
  Car, 
  Briefcase, 
  X,
  Share2,
  Download,
  Calendar as CalendarIcon,
  Sparkles,
  Info
} from "lucide-react";
import { getPanchangForDate, getMonthNames } from "../../services/panchangService";
import { PanchangData, MuhuratCategory } from "../../types";

const CATEGORIES: { label: MuhuratCategory; icon: any }[] = [
  { label: "Marriage", icon: Heart },
  { label: "Griha Pravesh", icon: Home },
  { label: "Vehicle Purchase", icon: Car },
  { label: "Business Opening", icon: Briefcase },
  { label: "Investment", icon: Briefcase },
  { label: "Puja", icon: Sparkles },
];

export const PanjikaSection = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(2026);
  const [selectedCategory, setSelectedCategory] = useState<MuhuratCategory | "All">("All");
  const [selectedDate, setSelectedDate] = useState<PanchangData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [isCalculating, setIsCalculating] = useState(false);

  const monthNames = getMonthNames();

  const handleCityChange = (newCity: string) => {
    setIsCalculating(true);
    setCity(newCity);
    // Simulate complex astronomical calculation delay
    setTimeout(() => setIsCalculating(false), 800);
  };

  const daysInMonth = useMemo(() => {
    const days = new Date(currentYear, currentMonth + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
      return getPanchangForDate(dateStr);
    });
  }, [currentMonth, currentYear]);

  const filteredDays = useMemo(() => {
    return daysInMonth.map(day => {
      const matchesCategory = selectedCategory === "All" || day.bestFor.includes(selectedCategory);
      
      // Intelligent Search: checks category, tithi, nakshatra, and even score-based keywords
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" || 
        day.bestFor.some(cat => cat.toLowerCase().includes(searchLower)) ||
        day.tithi.toLowerCase().includes(searchLower) ||
        day.nakshatra.toLowerCase().includes(searchLower) ||
        (searchLower === "auspicious" && day.auspiciousScore >= 90) ||
        (searchLower === "wedding" && day.bestFor.includes("Marriage"));
      
      return { ...day, isVisible: matchesCategory && matchesSearch };
    });
  }, [daysInMonth, selectedCategory, searchQuery]);

  const handlePrevMonth = () => setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
  const handleNextMonth = () => setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));

  return (
    <section id="panjika" className="relative py-24 px-4 overflow-hidden bg-[#020617]">
      {/* Background Mandala & Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-saffron/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/sacred-geometry.png')] opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-gold mb-4"
          >
            <Sparkles className="w-5 h-5" />
            <span className="uppercase tracking-[0.4em] text-xs font-bold font-mono">Spiritual Planner</span>
            <Sparkles className="w-5 h-5" />
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">Panjika & Shubh Muhurat</h2>
          <p className="text-gray-400 max-w-2xl mx-auto italic font-serif text-lg">
            "Align your actions with the cosmic rhythm. Find auspicious timings for the most significant chapters of your life."
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <span className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-green-400 font-bold">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Today's Energy: HIGH
            </span>
            <span className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-gold font-bold">
              Next Marriage Muhurat: 3 Days
            </span>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="flex flex-col lg:flex-row items-center gap-6 mb-12">
          <div className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setSelectedCategory("All")}
              className={`whitespace-nowrap px-6 py-3 rounded-xl text-sm font-bold transition-all ${selectedCategory === "All" ? "bg-gold text-navy shadow-lg shadow-gold/20" : "text-gray-400 hover:text-white"}`}
            >
              Show All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`whitespace-nowrap px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${selectedCategory === cat.label ? "bg-gold text-navy shadow-lg shadow-gold/20" : "text-gray-400 hover:text-white"}`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search dates, tithi, or events..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-gold outline-none transition-all"
                />
             </div>
             <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                <select 
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-sm text-white focus:border-gold outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi">Delhi</option>
                </select>
                {isCalculating && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -top-8 right-0 text-[10px] text-gold font-bold italic"
                  >
                    Syncing Coordinates...
                  </motion.div>
                )}
             </div>
          </div>
        </div>

        {/* Calendar Box */}
        <div className={`bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 ${isCalculating ? 'opacity-50 blur-sm scale-[0.99]' : ''}`}>
          {/* Calendar Nav */}
          <div className="flex items-center justify-between p-8 border-b border-white/10 bg-white/5">
            <h3 className="text-2xl font-serif text-white flex items-center gap-4 uppercase tracking-widest">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-3 hover:bg-gold hover:text-navy rounded-xl transition-all text-gold border border-gold/20 mr-2">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={handleNextMonth} className="p-3 hover:bg-gold hover:text-navy rounded-xl transition-all text-gold border border-gold/20">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 border-collapse">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="p-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 border-b border-r border-white/5 bg-white/[0.01]">
                {d}
              </div>
            ))}
            {filteredDays.map((day, idx) => {
              const isHighlyAuspicious = day.auspiciousScore >= 90;
              const isFilteredIn = day.isVisible;
              
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02, zIndex: 20 }}
                  onClick={() => setSelectedDate(day)}
                  className={`relative min-h-[140px] p-4 border-b border-r border-white/5 cursor-pointer transition-all duration-500 group
                    ${!isFilteredIn ? 'opacity-20 grayscale' : 'hover:bg-gold/5'}
                    ${isHighlyAuspicious ? 'ring-inset ring-1 ring-gold/20' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-xl font-serif ${isHighlyAuspicious ? 'text-gold' : 'text-white'}`}>
                      {idx + 1}
                    </span>
                    {isHighlyAuspicious && <Sparkles className="w-4 h-4 text-gold animate-pulse" />}
                  </div>

                  <div className="mt-4 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {day.bestFor.slice(0, 2).map((cat, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 border border-white/5 truncate">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <div className="text-[9px] text-gray-500 font-mono italic">
                      {day.tithi.split(' ').slice(2).join(' ')}
                    </div>
                  </div>

                  {/* Auspicious Indicator */}
                  <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${day.auspiciousScore >= 90 ? 'bg-gold' : day.auspiciousScore >= 80 ? 'bg-green-500' : 'bg-saffron'}`} 
                      style={{ width: `${day.auspiciousScore}%` }} 
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Marriage Spotlight */}
        <MarriageSpotlight />
      </div>

      {/* Date Detail Modal */}
      <AnimatePresence>
        {selectedDate && (
          <MuhuratModal data={selectedDate} onClose={() => setSelectedDate(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

const MarriageSpotlight = () => {
    return (
        <div className="mt-24">
            <div className="flex items-end justify-between mb-12">
                <div>
                    <h3 className="text-3xl font-serif text-white mb-2">Marriage Muhurat Showcase</h3>
                    <p className="text-gray-400">Handpicked premium wedding dates with maximum cosmic compatibility.</p>
                </div>
                <button className="text-gold border-b border-gold/50 pb-1 text-sm font-bold hover:text-white transition-all">
                    View 2026 Wedding Planner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { date: "24 Nov 2026", score: 94, nakshatra: "Rohini", compatibility: "High" },
                    { date: "12 Dec 2026", score: 91, nakshatra: "Pushya", compatibility: "Very High" },
                    { date: "18 Dec 2026", score: 88, nakshatra: "Hasta", compatibility: "Moderate" },
                ].map((m, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -10 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-gold/10 transition-all" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-xs font-bold text-gold uppercase tracking-widest font-mono">Wedding Lagna</span>
                                <div className="px-3 py-1 bg-gold/20 rounded-full text-gold text-[10px] font-bold">
                                    {m.score}% Cosmic Power
                                </div>
                            </div>
                            <h4 className="text-2xl font-serif text-white mb-1">{m.date}</h4>
                            <p className="text-gray-500 mb-6 font-mono text-xs uppercase tracking-wider">Tuesday • 07:15 PM – 08:40 PM</p>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Nakshatra</div>
                                    <div className="text-white font-serif">{m.nakshatra}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Strength</div>
                                    <div className="text-gold font-serif">{m.compatibility}</div>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-gradient-to-r from-gold to-saffron text-navy font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-gold/20">
                                Check Kundli Match
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const MuhuratModal = ({ data, onClose }: { data: PanchangData; onClose: () => void }) => {
    const handleShareWhatsApp = () => {
        const text = `Auspicious Muhurat for ${data.date}: ${data.tithi}. Energy Score: ${data.auspiciousScore}%. Best for: ${data.bestFor.join(", ")}. Check your Panjika at ${window.location.origin}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    };

    const handleDownloadPDF = () => {
        window.alert("Generating premium Panjika report for your location... This feature will be available once you link your account.");
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-navy/90 backdrop-blur-xl" 
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl bg-[#0a0f1e] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full text-gray-400 z-50">
                    <X />
                </button>

                {/* Left Panel: Aesthetic Heading */}
                <div className="w-full md:w-2/5 p-8 md:p-12 bg-gradient-to-b from-navy/50 to-gold/5 flex flex-col justify-between border-r border-white/10">
                    <div>
                        <div className="flex items-center gap-3 text-gold mb-8">
                            <CalendarIcon className="w-6 h-6" />
                            <span className="font-mono text-sm tracking-widest font-bold">SACRED DATE</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif text-white mb-2">{data.date.split('-')[2]} Nov 2026</h2>
                        <p className="text-xl text-gold font-serif italic mb-8">{data.day}</p>
                        
                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 text-center">
                            <div className="text-5xl font-serif text-gold mb-2">{data.auspiciousScore}%</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Positive Energy Score</div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <button 
                            onClick={handleShareWhatsApp}
                            className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10 text-gold hover:bg-gold hover:text-navy transition-all flex items-center justify-center gap-2"
                        >
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                        <button 
                            onClick={handleDownloadPDF}
                            className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10 text-gold hover:bg-gold hover:text-navy transition-all flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" /> PDF
                        </button>
                    </div>
                </div>

                {/* Right Panel: Data Grid */}
                <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto max-h-[80vh] no-scrollbar">
                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <DataCard label="Tithi" value={data.tithi} />
                        <DataCard label="Nakshatra" value={data.nakshatra} />
                        <DataCard label="Yoga" value={data.yoga} />
                        <DataCard label="Karana" value={data.karana} />
                    </div>

                    <div className="mb-12">
                         <h4 className="flex items-center gap-2 text-gold text-sm font-bold uppercase tracking-widest mb-6">
                            <Info className="w-4 h-4" /> Best Timings Today
                         </h4>
                         <div className="space-y-3">
                            {data.muhuratTimings.map((t, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-white font-serif">{t}</span>
                                    <span className="text-[10px] text-green-500 font-bold px-2 py-1 bg-green-500/10 rounded-full">Auspicious</span>
                                </div>
                            ))}
                         </div>
                    </div>

                    <div className="mb-12">
                         <h4 className="flex items-center gap-2 text-gold text-sm font-bold uppercase tracking-widest mb-6">
                            Planetary Insights
                         </h4>
                         <div className="space-y-4">
                            {data.planetaryNotes.map((note, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-2 h-2 rounded-full bg-gold mt-1.5" />
                                    <p className="text-gray-400 text-sm italic">{note}</p>
                                </div>
                            ))}
                         </div>
                    </div>

                    <p className="text-gold bg-gold/5 p-6 rounded-2xl border border-gold/10 text-sm italic leading-relaxed mb-6">
                        "{data.specialNote}"
                    </p>

                    {/* Premium Section */}
                    <div className="relative p-8 border border-gold/30 rounded-3xl overflow-hidden bg-gold/[0.02]">
                        <div className="absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center z-10">
                            <Sparkles className="text-gold w-8 h-8 mb-4" />
                            <h5 className="text-white font-serif text-lg mb-2">Personalized Insights Locked</h5>
                            <button className="px-6 py-2 bg-gold text-navy font-bold rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-all">
                                Unlock with Premium
                            </button>
                        </div>
                        <div className="opacity-20 select-none">
                            <h4 className="text-gold text-xs font-bold uppercase mb-4">Detailed Kundli Analysis</h4>
                            <p className="text-white text-sm mb-2">Your moon sign alignment with {data.nakshatra} creates a unique window for...</p>
                            <p className="text-white text-sm">Recommended rituals for maximum prosperity during this muhurat include...</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const DataCard = ({ label, value }: { label: string; value: string }) => (
    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 font-mono">{label}</div>
        <div className="text-white font-serif text-lg">{value}</div>
    </div>
);

export const FloatingToday = () => {
    const today = useMemo(() => getPanchangForDate(new Date().toISOString().split('T')[0]), []);
    
    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed right-6 bottom-32 z-[100] hidden xl:block"
        >
            <div className="w-64 bg-navy/80 backdrop-blur-xl border border-gold/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.1)] p-6">
                <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-bold text-gold uppercase tracking-tighter">Cosmic Pulse</span>
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="text-xs text-gray-400 mb-1">Today: 12 May 2026</div>
                <div className="text-lg font-serif text-white mb-4">Pushya Nakshatra</div>
                
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                        <span>Abhijit Muhurat:</span>
                        <span className="text-gold">11:30 AM</span>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                        <span>Rahu Kaal:</span>
                        <span className="text-red-500">04:00 PM</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <p className="text-[11px] text-gray-400 italic mb-4 leading-relaxed">
                        “Favorable day for financial discussions and spiritual activities.”
                    </p>
                    <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gold font-bold hover:bg-gold hover:text-navy transition-all">
                        View Full Details
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
