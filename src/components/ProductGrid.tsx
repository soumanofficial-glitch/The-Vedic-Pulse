import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CircleDollarSign, 
  Heart, 
  Briefcase, 
  Gem, 
  Search, 
  MapPin, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Clock,
  Star,
  Zap,
  Sparkles,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";

const PRODUCTS = [
  {
    id: "love-compatibility",
    icon: <Heart className="text-rose-500" />,
    title: "Love Compatibility (100% Accurate)",
    desc: "Discover emotional compatibility, attraction levels, and relationship energy.",
    price: 9,
    originalPrice: 85,
    time: "Instant"
  },
  {
    id: "daily-luck",
    icon: <Gem className="text-gold" />,
    title: "Dainik Shubh Muhurat",
    desc: "Find your luck score, lucky colors, and energy alignment for today.",
    price: 12,
    originalPrice: 49,
    time: "Instant"
  },
  {
    id: "business-success",
    icon: <TrendingUp className="text-cyan-400" />,
    title: "Business Success Timer",
    desc: "Know the best time to launch a business, sign deals, or start ventures.",
    price: 29,
    originalPrice: 99,
    time: "2 Mins"
  },
  {
    id: "numerology-destiny",
    icon: <CircleDollarSign className="text-emerald-400" />,
    title: "Numerology Destiny",
    desc: "Reveal your life path number, hidden strengths, and lucky dates.",
    price: 21,
    originalPrice: 69,
    time: "Instant"
  },
  {
    id: "marriage-muhurat",
    icon: <Calendar className="text-orange-400" />,
    title: "Vivah Muhurat Analysis",
    desc: "Favorable wedding dates based on deep Vedic star calculations.",
    price: 49,
    originalPrice: 199,
    time: "5 Mins"
  },
  {
    id: "vastu-energy",
    icon: <MapPin className="text-yellow-400" />,
    title: "Vastu Energy Scan",
    desc: "Check if your home energy alignment supports wealth and peace.",
    price: 39,
    originalPrice: 149,
    time: "3 Mins"
  }
];

export const ProductGrid = ({ onSelect }: { onSelect: (id: string, price: number) => void }) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const featuredReports = [
    {
      id: "complete-future",
      title: "Maha Kundli: 2026-2030 Vedic Future Report",
      subtitle: "Our Most Detailed Analysis Yet",
      desc: "An exhaustive 50-page breakdown of your karmic cycles, Mahadasha periods, and planetary transits for the next 5 years. Covers Wealth, Health, Marriage, and Career in forensic detail.",
      price: 9,
      originalPrice: 125,
      features: ["100% Accurate", "Best Seller", "Detailed PDF", "Karma Remedy"],
      icon: <Star className="text-amber-400 w-12 h-12" />
    }
  ];

  return (
    <section id="products" className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Big Slider / Featured Section */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-3xl font-bold text-amber-200">Premium Kundli Reports</h2>
           <div className="flex gap-2">
             <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-gold/50 transition-all">
               <ChevronLeft size={20} />
             </button>
             <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-gold/50 transition-all">
               <ChevronRight size={20} />
             </button>
           </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          onClick={() => onSelect(featuredReports[0].id, featuredReports[0].price)}
          className="relative group cursor-pointer"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-gold/20 to-amber-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-500" />
          <div className="relative bg-[#0a0f1d] border border-white/10 rounded-[2rem] p-8 md:p-12 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4 group-hover:bg-gold/10 transition-colors" />
            
            <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap gap-3">
                  <span className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    <Zap size={10} fill="currentColor" /> Best Seller 2024
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
                    100% Accurate Vedic Analysis
                  </span>
                  <span className="bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                    55+ Page Premium PDF
                  </span>
                </div>

                <h3 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                  {featuredReports[0].title}
                </h3>
                
                <div className="space-y-6">
                  <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
                    Get a forensic breakdown of your cosmic blueprint. Our senior Acharyas use advanced Bhrigu Nadi systems to calculate your path with surgical precision.
                  </p>
                  
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 max-w-2xl">
                    <h4 className="text-gold text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <ShieldCheck size={14} /> Comprehensive 5-Chapter Architecture
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      {[
                        { title: "Karmic Finance", desc: "Wealth peaks & risk periods" },
                        { title: "Dasha Timeline", desc: "Next 60 months breakdown" },
                        { title: "Graha Dosha", desc: "Specific planetary corrections" },
                        { title: "Lagna Shakti", desc: "Soul purpose & hidden strengths" },
                        { title: "Relationship Sync", desc: "Marriage & family harmony" },
                        { title: "Career Catalyst", desc: "Job vs Business navigation" }
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-white text-sm font-bold">{item.title}</span>
                          <span className="text-gray-500 text-[11px] leading-tight mt-0.5">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                  <div className="flex flex-col">
                    <span className="text-gray-500 line-through text-sm font-medium italic">Traditional Only!: ₹{featuredReports[0].originalPrice}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-amber-400 italic tracking-tighter">₹{featuredReports[0].price}</span>
                      <div className="flex flex-col">
                        <span className="text-amber-500/80 text-[10px] font-black uppercase tracking-widest">Divine Only!</span>
                        <div className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 mt-1">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">No Hidden Cost</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="bg-gold text-navy font-bold px-8 py-4 rounded-2xl hover:bg-white transition-all transform group-hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(251,191,36,0.3)] flex items-center gap-3">
                    Claim This Report <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="w-full lg:w-auto">
                <div className="relative">
                   <div className="absolute inset-0 bg-gold/20 rounded-full blur-[40px] animate-pulse" />
                   <div className="relative w-48 h-48 md:w-64 md:h-64 bg-white/5 border border-white/10 rounded-[3rem] flex items-center justify-center backdrop-blur-xl">
                      {featuredReports[0].icon}
                      <div className="absolute -bottom-4 -right-4 bg-emerald-500 p-4 rounded-2xl shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform">
                        <ShieldCheck className="text-white w-8 h-8" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div id="mini-reports">
           <h2 className="text-3xl font-bold text-amber-200">Mini Reports</h2>
           <p className="text-gray-400 mt-2">Personalized insights at pocket-friendly prices.</p>
        </div>
        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mr-2">
          Limited Time: ₹12 Offer
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTS.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelect(product.id, product.price)}
            className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {product.icon}
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 line-through italic">₹{product.originalPrice}</div>
                <div className="text-xl font-black text-amber-400 leading-none mt-1">₹{product.price} <span className="text-[10px] text-amber-500/50 uppercase tracking-tighter">Only!</span></div>
                <div className="flex items-center gap-1 mt-2 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10 self-end">
                   <div className="w-0.5 h-0.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[7px] text-emerald-500 font-black uppercase tracking-widest">No Hidden Cost</span>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-2 group-hover:text-amber-300 transition-colors">{product.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">{product.desc}</p>

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <Clock size={10} />
                  Delivery: {product.time}
               </div>
               <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-all">
                  <ChevronRight size={16} />
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-4 py-8 border-t border-white/5">
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            One-Time Payment
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            No Hidden Charges
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            No Subscriptions
          </div>
        </div>
        <p className="text-gray-600 text-[10px] italic">Strictly non-recurring. You only pay for what you buy.</p>
      </div>
    </section>
  );
};
