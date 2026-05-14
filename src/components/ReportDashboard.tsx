import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  TrendingUp, 
  Zap, 
  Heart, 
  CircleDollarSign,
  Star,
  ShieldCheck,
  Compass,
  Briefcase,
  Activity,
  Flame,
  CheckCircle2,
  Calendar,
  Layers
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
  const [activeTab, setActiveTab] = useState<"overview" | "planetary" | "life" | "remedies">("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "sharing" | "shared">("idle");
  const [shareUrl, setShareUrl] = useState<string>("");
  const reportRef = React.useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (shareStatus === "sharing") return;
    
    // If already shared, just use the URL
    if (shareUrl) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Karmic Blueprint for ${details.name}`,
            text: `Check out my Vedic Astrology Report from JyotishGlow!`,
            url: shareUrl,
          });
          return;
        } catch (err) {
          console.log("Share failed", err);
        }
      }
      
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      return;
    }

    setShareStatus("sharing");
    try {
      const docRef = await addDoc(collection(db, "shared_reports"), {
        reportData: report,
        birthDetails: details,
        createdAt: serverTimestamp(),
      });
      
      const newShareUrl = `${window.location.origin}?shared=${docRef.id}`;
      setShareUrl(newShareUrl);
      setShareStatus("shared");
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Karmic Blueprint for ${details.name}`,
            text: `Check out my Vedic Astrology Report from JyotishGlow!`,
            url: newShareUrl,
          });
        } catch (err) {
          console.log("Native share failed, maybe cancelled", err);
          await navigator.clipboard.writeText(newShareUrl);
        }
      } else {
        await navigator.clipboard.writeText(newShareUrl);
      }
    } catch (err) {
      console.error("Sharing failed", err);
      setShareStatus("idle");
    }
  };

  const handleDownloadPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      const element = reportRef.current;
      if (!element) return;

      // Temporary show the hidden comprehensive report
      element.style.display = "block";
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#05070a",
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Karmic_Blueprint_${details.name.replace(/\s+/g, "_")}.pdf`);
      
      // Hide back
      element.style.display = "none";
    } catch (error) {
      console.error("PDF Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed inset-0 z-[200] bg-[#05070a] overflow-y-auto pb-20 selection:bg-gold/30"
    >
      {/* Premium Header */}
      <div className="sticky top-0 z-50 bg-[#05070a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Exit Portal</span>
          </button>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Verified System</span>
             </div>
             <button 
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gold text-navy rounded-full text-xs font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="w-3 h-3 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={14} />
                )} 
                {isGenerating ? "Preparing..." : "Download PDF"}
             </button>

             <button 
                onClick={handleShare}
                disabled={shareStatus === "sharing"}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  shareStatus === "shared" 
                  ? "bg-emerald-500 text-white" 
                  : "bg-white/10 text-white hover:bg-white/20"
                } disabled:opacity-50`}
              >
                {shareStatus === "sharing" ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : shareStatus === "shared" ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Share2 size={14} />
                )}
                {shareStatus === "sharing" ? "Saving..." : shareStatus === "shared" ? "Link Copied" : "Share"}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 pt-12">
        {/* Report Title Section */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center mb-6"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-full h-full border border-gold/30 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-xl">
                <Star className="text-gold w-8 h-8" />
              </div>
            </div>
          </motion.div>
          <h1 className="font-serif text-5xl md:text-6xl text-white mb-4 italic">The Bhrigu Samhita Analysis</h1>
          <p className="text-gold/60 font-mono text-sm tracking-[0.4em] uppercase mb-8">Detailed Karmic Blueprint for {details.name}</p>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <div className="flex items-center gap-2 border-r border-white/10 pr-6"><span>DOB: {details.dob}</span></div>
            <div className="flex items-center gap-2 border-r border-white/10 pr-6"><span>TOB: {details.tob}</span></div>
            <div className="flex items-center gap-2"><span>POB: {details.pob}</span></div>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           <div className="glass-card p-8 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent">
              <div className="flex justify-between items-start mb-6">
                <Compass className="text-amber-500 w-6 h-6" />
                <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest">Alignment</span>
              </div>
              <div className="text-4xl font-black text-white mb-2 italic">#{report.luckyNumber}</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{report.luckyColor} Energy</div>
           </div>

           <div className="glass-card p-8 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent">
              <div className="flex justify-between items-start mb-6">
                <Flame className="text-indigo-400 w-6 h-6" />
                <span className="text-[10px] font-black text-indigo-400/50 uppercase tracking-widest">Luck Quotient</span>
              </div>
              <div className="text-4xl font-black text-white mb-2 italic">{report.luckScore}%</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Auspicious Transit</div>
           </div>

           <div className="glass-card p-8 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent">
              <div className="flex justify-between items-start mb-6">
                <Zap className="text-emerald-400 w-6 h-6" />
                <span className="text-[10px] font-black text-emerald-400/50 uppercase tracking-widest">Prana Level</span>
              </div>
              <div className="text-4xl font-black text-white mb-2 italic">{report.energyScore}%</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Vitality Index</div>
           </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-white/5 pb-4">
          {[
            { id: "overview", label: "Executive Summary", icon: <Star size={14} /> },
            { id: "planetary", label: "Planetary Transits", icon: <Layers size={14} /> },
            { id: "life", label: "Life Chapters", icon: <Compass size={14} /> },
            { id: "remedies", label: "Remedial Sadhana", icon: <ShieldCheck size={14} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? "bg-gold text-navy shadow-[0_0_20px_rgba(251,191,36,0.2)]" 
                : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            {activeTab === "overview" && (
              <div className="space-y-12">
                <Section title="Soul Purpose (Karmic Duty)" icon={<Compass className="text-gold" />}>
                  <p className="text-xl text-gray-300 font-serif italic border-l-2 border-gold/30 pl-8 leading-relaxed">
                    {report.karmicDuty}
                  </p>
                </Section>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <Section title="Spiritual Insight" variant="mini">
                    <p className="text-gray-400 leading-relaxed text-sm">{report.personalizedInsight}</p>
                  </Section>
                  <Section title="Favorable Muhurats" variant="mini">
                    <div className="bg-gold/5 p-6 rounded-2xl border border-gold/10">
                      <p className="text-gold font-mono text-lg tracking-tighter uppercase">{report.favorableTimings}</p>
                    </div>
                  </Section>
                </div>
              </div>
            )}

            {activeTab === "planetary" && (
              <div className="space-y-12">
                <Section title="Current Mahadasha Influence" icon={<Layers className="text-indigo-400" />}>
                  <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                     <p className="text-gray-300 leading-relaxed">{report.mahadashaPeriod}</p>
                  </div>
                </Section>

                <Section title="Shani Sade Sati Status" icon={<ShieldCheck className="text-rose-500" />}>
                  <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl">
                     <p className="text-gray-300 leading-relaxed">{report.shaniSadeSati}</p>
                  </div>
                </Section>

                <Section title="Planetary Positions" icon={<Star className="text-amber-500" />}>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{report.planetaryAlignment}</p>
                </Section>
              </div>
            )}

            {activeTab === "life" && (
              <div className="space-y-12">
                <LifeFeature 
                  title="Career & Wealth Architecture" 
                  content={report.careerAnalysis} 
                  subContent={report.financialEnergy}
                  icon={<Briefcase className="text-cyan-400" />}
                />
                <LifeFeature 
                  title="Love & Relationship Sync" 
                  content={report.loveAnalysis} 
                  subContent={report.relationshipEnergy}
                  icon={<Heart className="text-rose-400" />}
                />
                <LifeFeature 
                  title="Health & Vitality Map" 
                  content={report.healthAnalysis} 
                  icon={<Activity className="text-emerald-400" />}
                />
              </div>
            )}

            {activeTab === "remedies" && (
              <div className="space-y-12">
                <Section title="Daily Sadhana Protocol" icon={<Flame className="text-orange-500" />}>
                   <div className="bg-[#0f141e] p-8 rounded-3xl border border-white/5">
                      <p className="text-gray-300 italic mb-8">"{report.dailySadhana}"</p>
                      <h4 className="text-xs font-black uppercase tracking-widest text-gold mb-6">Prescribed Remedies (Upayas)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.remedies.map((remedy, i) => (
                          <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                            <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                            <span className="text-sm text-gray-300">{remedy}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </Section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center">
           <div className="flex items-center gap-3 mb-8 opacity-40">
             <div className="w-10 h-px bg-white/20" />
             <Star className="text-gold w-4 h-4" />
             <div className="w-10 h-px bg-white/20" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 text-center leading-loose">
             Authentic Vedic Analysis • Certified Jyotish Standards<br />
             Document Ref: JG-{Math.random().toString(36).substring(7).toUpperCase()}
           </p>
        </div>
      </div>

      {/* Hidden PDF Printable Version */}
      <div 
        ref={reportRef} 
        style={{ display: "none", width: "794px", padding: "40px", backgroundColor: "#05070a", color: "white" }}
        className="font-sans"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 border border-gold/30 rounded-full flex items-center justify-center bg-white/5 mx-auto mb-4">
            <Star className="text-gold w-6 h-6" />
          </div>
          <h1 className="font-serif text-4xl text-white italic mb-2">The Bhrigu Samhita Analysis</h1>
          <p className="text-gold/60 font-mono text-[10px] tracking-widest uppercase">Verified Karmic Blueprint for {details.name}</p>
          <div className="flex justify-center gap-4 text-[8px] font-black uppercase tracking-widest text-gray-500 mt-4">
            <span>DOB: {details.dob}</span>
            <span>TOB: {details.tob}</span>
            <span>POB: {details.pob}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="border border-white/10 p-4 rounded-xl bg-white/5">
            <div className="text-[8px] font-black text-amber-500/50 uppercase mb-2">Lucky Number</div>
            <div className="text-2xl font-black text-white italic">#{report.luckyNumber}</div>
          </div>
          <div className="border border-white/10 p-4 rounded-xl bg-white/5">
            <div className="text-[8px] font-black text-indigo-400/50 uppercase mb-2">Luck Score</div>
            <div className="text-2xl font-black text-white italic">{report.luckScore}%</div>
          </div>
          <div className="border border-white/10 p-4 rounded-xl bg-white/5">
            <div className="text-[8px] font-black text-emerald-400/50 uppercase mb-2">Vitality Index</div>
            <div className="text-2xl font-black text-white italic">{report.energyScore}%</div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <h3 className="text-gold text-[10px] uppercase font-black tracking-widest">Soul Purpose</h3>
            <p className="text-sm text-gray-300 italic leading-relaxed border-l border-gold/30 pl-4">{report.karmicDuty}</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
               <h3 className="text-gold text-[10px] uppercase font-black tracking-widest">Spiritual Insight</h3>
               <p className="text-xs text-gray-400 leading-relaxed">{report.personalizedInsight}</p>
            </div>
            <div className="space-y-4">
               <h3 className="text-gold text-[10px] uppercase font-black tracking-widest">Favorable Muhurats</h3>
               <p className="text-xs text-amber-400 font-mono leading-relaxed">{report.favorableTimings}</p>
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-indigo-400 text-[10px] uppercase font-black tracking-widest">Mahadasha Period</h3>
             <p className="text-xs text-gray-400 leading-relaxed italic">"{report.mahadashaPeriod}"</p>
          </div>

          <div className="space-y-4">
             <h3 className="text-cyan-400 text-[10px] uppercase font-black tracking-widest">Career & Wealth</h3>
             <p className="text-xs text-gray-400 leading-relaxed italic">"{report.careerAnalysis}"</p>
          </div>

          <div className="space-y-4">
             <h3 className="text-rose-400 text-[10px] uppercase font-black tracking-widest">Love & Relationships</h3>
             <p className="text-xs text-gray-400 leading-relaxed italic">"{report.loveAnalysis}"</p>
          </div>

          <div className="space-y-4">
             <h3 className="text-orange-500 text-[10px] uppercase font-black tracking-widest">Daily Sadhana & Remedies</h3>
             <p className="text-xs text-gray-300 italic mb-4">"{report.dailySadhana}"</p>
             <div className="grid grid-cols-2 gap-2">
                {report.remedies.map((r: string, i: number) => (
                  <div key={i} className="text-[10px] text-gray-400 flex items-center gap-2">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full" /> {r}
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600">
            Certified Vedic Jyotish Document • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const Section = ({ title, children, icon, variant = "full" }: { title: string; children: React.ReactNode; icon?: React.ReactNode; variant?: "full" | "mini" }) => (
  <div className="space-y-6">
    <h3 className={`font-black uppercase tracking-[0.2em] flex items-center gap-3 ${variant === "mini" ? "text-[10px] text-gray-500" : "text-xs text-gold"}`}>
      {icon} {title}
    </h3>
    {children}
  </div>
);

const LifeFeature = ({ title, content, subContent, icon }: { title: string; content: string; subContent?: string; icon: React.ReactNode }) => (
  <div className="glass-card p-8 md:p-12 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
       {React.cloneElement(icon as React.ReactElement, { size: 120 })}
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 italic">
          {icon}
        </div>
        <h3 className="text-2xl font-serif text-white italic">{title}</h3>
      </div>
      <div className="space-y-6">
        <p className="text-gray-400 leading-relaxed text-lg italic font-serif">
          {content}
        </p>
        {subContent && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
             <CheckCircle2 size={12} className="text-gold" />
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{subContent}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

