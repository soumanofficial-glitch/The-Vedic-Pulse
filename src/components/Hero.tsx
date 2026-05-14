import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Star, Users, Zap, Sparkles, MessageCircle } from "lucide-react";

// Import user avatars
import user1 from "../assets/images/regenerated_image_1778676739185.png";
import user2 from "../assets/images/regenerated_image_1778676827261.png";
import user3 from "../assets/images/regenerated_image_1778676830093.png";

export const Hero = ({ onSelect }: { onSelect?: (id: string, price: number) => void }) => {
  return (
    <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-screen flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
      >
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
             <span className="badge-amber">Instant Vedic Insights</span>
             <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent">
               Complete 2026-2030 <br/> <span className="text-amber-400">Future Prediction Report</span>
             </h1>
             <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
               Personalized Vedic insights based on your birth details, planetary positions, and numerology.
             </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <button 
              onClick={() => onSelect ? onSelect("present-life", 3) : document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-5 bg-amber-500 text-black font-black rounded-2xl hover:bg-white active:scale-95 transition-all text-[11px] sm:text-xs uppercase tracking-[0.15em] flex flex-col items-center justify-center min-w-[200px] shadow-[0_0_30px_rgba(245,158,11,0.4)] group"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse text-black" />
                <span>Present Life Reading</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="opacity-40 line-through text-[10px]">₹29</span>
                 <span className="text-lg">₹3 Only</span>
              </div>
            </button>
            <button 
              onClick={() => onSelect ? onSelect("complete-future", 9) : document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-5 bg-white text-black font-black rounded-2xl hover:bg-amber-400 active:scale-95 transition-all text-[11px] sm:text-xs uppercase tracking-[0.15em] flex flex-col items-center justify-center min-w-[200px] shadow-[0_0_30px_rgba(255,255,255,0.2)] group"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-amber-600" />
                <span>2026-2030 Future Report</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="opacity-40 line-through text-[10px]">₹125</span>
                 <span className="text-lg">₹9 Only</span>
              </div>
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("open-astrologer-chat"))}
              className="px-6 py-5 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-500 active:scale-95 transition-all text-[11px] sm:text-xs uppercase tracking-[0.15em] flex flex-col items-center justify-center min-w-[200px] shadow-[0_0_30px_rgba(147,51,234,0.4)] group"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Chat with Astrologer</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-purple-200">3 FREE CHATS</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StepCard step="01" label="Enter Details" />
            <StepCard step="02" label="AI Analysis" />
            <StepCard step="03" label="Instant PDF" />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 justify-center lg:justify-start">
             <div className="flex -space-x-3">
               {[user1, user2, user3].map((src, i) => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050508] overflow-hidden bg-gray-600 flex items-center justify-center text-[10px] font-bold">
                   <img 
                    src={src} 
                    alt={`User ${i+1}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                   />
                 </div>
               ))}
             </div>
             <div className="text-xs text-gray-400 text-center lg:text-left">
               <div className="text-white font-bold">4.9/5 Star Rating</div>
               Trusted by 1.2M+ Seekers
             </div>
             <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
             <button 
              onClick={() => document.getElementById('mini-reports')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-4 bg-white/5 border border-white/10 text-white text-[10px] uppercase font-bold rounded-xl hover:bg-white/10 transition-all tracking-widest"
            >
                More Mini Reports
            </button>
          </div>
        </div>

        {/* Visual Column */}
        <div className="lg:col-span-5 flex justify-center items-center relative">
          <div className="w-full max-w-md aspect-square relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-amber-500/10 animate-[spin_60s_linear_infinite]"></div>
            <div className="absolute inset-8 rounded-full border border-amber-500/5 animate-[spin_40s_linear_infinite_reverse]"></div>
            <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-purple-900/20 to-blue-900/20 border border-white/10 flex items-center justify-center shadow-[0_0_60px_rgba(88,28,135,0.2)] backdrop-blur-xl">
              <div className="text-center">
                <div className="text-6xl mb-2">♈</div>
                <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Current Muhurat</div>
                <div className="text-2xl font-bold">Shubh</div>
              </div>
            </div>
            {/* Pulsing particles */}
            <div className="absolute top-0 w-3 h-3 bg-amber-400 rounded-full blur-[2px] shadow-[0_0_10px_#f59e0b] animate-pulse"></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const StepCard = ({ step, label }: { step: string; label: string }) => (
  <div className={`p-4 glass-card backdrop-blur-sm border-white/5 ${step === '03' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5'}`}>
    <div className="text-amber-500 text-xs font-bold mb-1 uppercase tracking-wider">Step {step}</div>
    <div className="text-sm font-medium">{label}</div>
  </div>
);
