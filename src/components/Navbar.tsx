import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-10 py-6 border-b border-white/5 backdrop-blur-md bg-cosmic-dark/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-amber-700 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            <span className="text-2xl">ॐ</span>
          </div>
          <span className="text-xl font-bold tracking-tight uppercase leading-none">
            Vedic<span className="text-amber-400">Pulse</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <button 
            onClick={() => document.getElementById('panjika')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gold transition-all"
          >
            Auspicious Panjika
          </button>
          <button 
            onClick={() => document.getElementById('horoscope')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gold transition-all"
          >
            Daily Horoscope
          </button>
          <button 
             onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
             className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-full text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all"
          >
            Get Expert Report
          </button>
        </div>
      </div>
    </nav>
  );
};
