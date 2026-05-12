import React from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  TrendingUp, 
  Zap, 
  Heart, 
  CircleDollarSign,
  Star
} from "lucide-react";
import { AstrologyReport, BirthDetails } from "../types";

export const ReportDashboard = ({ 
  report, 
  details,
  onClose 
}: { 
  report: AstrologyReport;
  details: BirthDetails;
  onClose: () => void;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed inset-0 z-[200] bg-cosmic-dark overflow-y-auto pb-20"
    >
      <div className="max-w-3xl mx-auto p-6 pt-24">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span>Dashboard</span>
          </button>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10"><Download size={20} /></button>
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10"><Share2 size={20} /></button>
          </div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card overflow-hidden mb-8 border-white/5 shadow-2xl"
        >
          <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-8 border-b border-white/5">
            <h1 className="font-serif text-3xl italic mb-2 tracking-tight text-amber-100">Cosmic Alignment Report</h1>
            <p className="text-gray-400 font-medium">Prepared for <span className="text-amber-400">{details.name}</span></p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="badge-amber text-[9px]">Personalized Reading</span>
              <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded font-bold uppercase text-gray-400 tracking-tighter">Vedic Insights</span>
            </div>
          </div>

          <div className="p-8 space-y-12 bg-white/[0.01]">
            {/* Top Scores */}
            <div className="grid grid-cols-2 gap-8">
              <ScoreGauge label="Luck Score" value={report.luckScore} color="#f59e0b" />
              <ScoreGauge label="Energy Score" value={report.energyScore} color="#ff4e00" />
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoCard icon={<Star className="text-amber-400" />} label="Lucky Number" value={(report.luckyNumber ?? '-').toString()} />
              <InfoCard icon={<Zap className="text-amber-500" />} label="Lucky Color" value={report.luckyColor || 'Not specified'} />
              <InfoCard icon={<TrendingUp className="text-cyan-400" />} label="Financial" value={report.financialEnergy || 'N/A'} />
              <InfoCard icon={<Heart className="text-rose-500" />} label="Relationship" value={report.relationshipEnergy || 'N/A'} />
            </div>

            {/* Detailed Insight */}
            <div className="space-y-4">
               <h3 className="text-[10px] font-bold text-amber-500/50 uppercase tracking-[0.3em]">The Universe Speaks</h3>
               <div className="glass-card p-8 bg-white/[0.03] border-amber-500/10 leading-relaxed text-gray-200 italic font-serif text-xl shadow-inner">
                 "{report.personalizedInsight}"
               </div>
            </div>

            {/* Favorable Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-cyan-500/10 hover:border-cyan-500/30 transition-colors">
                <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp size={12} /> Planetary Alignment
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">{report.planetaryAlignment}</p>
              </div>
              <div className="glass-card p-6 border-amber-500/10 hover:border-amber-500/30 transition-colors">
                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Star size={12} /> Favorable Muhurat
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed font-mono uppercase tracking-tighter">{report.favorableTimings}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="text-center opacity-30 text-[10px] uppercase tracking-[0.3em] font-bold">
          JyotishGlow Digital Certification • Verified Vedic Logic
        </div>
      </div>
    </motion.div>
  );
};

const ScoreGauge = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex flex-col items-center gap-4">
    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle 
          cx="50%" cy="50%" r="45%" 
          fill="none" 
          stroke={color} 
          strokeWidth="6"
          strokeDasharray="100 100"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 100 - value }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl sm:text-3xl font-bold">{value}</span>
      </div>
    </div>
    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span>
  </div>
);

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="glass-card p-4 flex flex-col items-center gap-2 text-center">
    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">{icon}</div>
    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
    <div className="text-sm font-semibold">{value}</div>
  </div>
);
