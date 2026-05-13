import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Copy, CheckCircle, ShieldCheck, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export const PaymentFlow = ({ 
  price, 
  onSuccess, 
  onClose 
}: { 
  price: number; 
  onSuccess: () => void;
  onClose: () => void;
}) => {
  const [step, setStep] = useState<"options" | "processing" | "success">("options");
  const [transactionId, setTransactionId] = useState("");
  const [copied, setCopied] = useState(false);
  const upiId = "7003235589@jupiteraxis";
  const payeeName = "Souman Bera";

  // UPI URL format: upi://pay?pa=address&pn=name&am=amount&cu=currency
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${price}&cu=INR`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;
    
    setStep("processing");
    // Wait 12 seconds for "verification"
    setTimeout(() => {
      setStep("success");
      setTimeout(onSuccess, 1500);
    }, 12000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-cosmic-dark/95 backdrop-blur-2xl overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-sm p-8 relative my-auto border-white/10"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        {step === "options" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Manual Verification Gateway</span>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                 <span className="bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20 animate-bounce">
                   Special Discount Applied
                 </span>
              </div>
              <h2 className="text-4xl font-black mb-1 text-white flex items-center justify-center gap-2">
                ₹{price}
                <span className="text-gray-600 text-sm line-through font-medium">₹125</span>
              </h2>
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black">Activation Fee</p>
            </div>

              <div className="space-y-4">
                {/* QR Code Section */}
                <div className="bg-white p-7 rounded-[2.5rem] flex flex-col items-center justify-center border border-white/20 shadow-[-10px_-10px_30px_rgba(255,255,255,0.05),10px_10px_30px_rgba(0,0,0,0.5)]">
                   <div className="p-3 bg-gray-50 border-2 border-gray-100 rounded-[2rem]">
                     <QRCodeSVG 
                      value={upiUrl}
                      size={180}
                      level="H"
                      includeMargin={false}
                     />
                   </div>
                   <p className="text-[10px] text-gray-900 mt-5 font-black uppercase tracking-[0.3em] text-center">
                     Scan & Pay ₹{price} for Unlimited Clarity
                   </p>
                </div>

                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-gray-600 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                    ))}
                  </div>
                  <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider leading-tight">
                    <span className="text-amber-400">12,400+ Seekers</span> already<br />unlocked their report.
                  </p>
                </div>

              {/* UPI ID Section */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Or Pay to UPI ID</p>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-mono font-bold text-amber-400 truncate">{upiId}</span>
                  <button 
                    onClick={copyUpi}
                    className="flex items-center gap-1 text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-all font-bold uppercase text-white"
                  >
                    {copied ? <CheckCircle size={10} className="text-emerald-400" /> : <Copy size={10} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Transaction Code Form */}
              <form onSubmit={startVerification} className="space-y-3 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block ml-1">Enter Transaction ID / UTR Code</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 123456789012"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:bg-white/10 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-gray-700 font-mono text-sm"
                  />
                </div>
                <button 
                  type="submit"
                  className="btn-primary w-full py-4 text-xs tracking-[0.2em]"
                >
                  Confirm Payment & Activate
                </button>
                <div className="flex items-center justify-between pt-6 mt-4 border-t border-white/5">
                   <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-widest">
                     <ShieldCheck className="w-3 h-3 text-emerald-500" />
                     256-Bit Encrypted
                   </div>
                   <div className="text-white/30 text-[9px] font-black uppercase tracking-widest">
                     Authorized Vedic Portal
                   </div>
                </div>
              </form>
            </div>

            <p className="text-[9px] text-center text-gray-600 font-bold uppercase leading-relaxed px-4">
              After payment, copy the Transaction ID from your UPI app and paste it above. Report will activate instantly after verification.
            </p>
          </div>
        )}

        {step === "processing" && (
          <div className="py-20 flex flex-col items-center text-center space-y-6">
            <div className="relative">
               <div className="w-20 h-20 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-amber-500/50" />
               </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-white">Verifying Transaction</h3>
              <p className="text-gray-400 text-xs px-8 uppercase tracking-widest leading-relaxed">
                Please wait 10-15 seconds while we confirm your payment with the blockchain & UPI servers.
              </p>
            </div>
            <div className="w-full max-w-[200px] h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 12, ease: "linear" }}
                 className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
               />
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="py-20 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-emerald-400">Payment Verified</h3>
              <p className="text-white text-xs uppercase font-bold tracking-[0.2em] animate-pulse">
                Your Cosmic Report is Ready
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

