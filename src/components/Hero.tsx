import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Star, Users, Zap } from "lucide-react";

export const Hero = () => {
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
               Discover Your <br/> Daily <span className="text-amber-400">Luck & Muhurat</span>
             </h1>
             <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
               Personalized Vedic insights based on your birth details, planetary positions, and numerology.
             </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StepCard step="01" label="Enter Details" />
            <StepCard step="02" label="AI Analysis" />
            <StepCard step="03" label="Instant PDF" />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 justify-center lg:justify-start">
             <div className="flex -space-x-3">
               {[1, 2, 3].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050508] bg-gray-600 flex items-center justify-center text-[10px] font-bold">
                   {i === 3 ? "1M+" : ""}
                 </div>
               ))}
             </div>
             <div className="text-xs text-gray-400 text-center lg:text-left">
               <div className="text-white font-bold">4.9/5 Star Rating</div>
               Trusted by 1.2M+ Seekers
             </div>
             <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
             <button 
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary px-10"
             >
                Get My Report
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
