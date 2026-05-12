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
        
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            52,402 Reports Generated
          </div>
          <button 
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-secondary"
          >
            Daily Horoscope
          </button>
          <button 
             onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
             className="px-5 py-2 bg-amber-500 text-black font-bold rounded-full text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all"
          >
            Get Your Report
          </button>
        </div>
      </div>
    </nav>
  );
};
