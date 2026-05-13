import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Copy, CheckCircle, ShieldCheck, X, AlertCircle, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { functions } from "../lib/firebase";
import { httpsCallable } from "firebase/functions";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PaymentFlow = ({ 
  price, 
  onSuccess, 
  onClose 
}: { 
  price: number; 
  onSuccess: () => void;
  onClose: () => void;
}) => {
  const [step, setStep] = useState<"options" | "processing" | "success" | "error">("options");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const upiId = "7003235589@jupiteraxis";
  const payeeName = "Souman Bera";

  // UPI URL format: upi://pay?pa=address&pn=name&am=amount&cu=currency
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${price}&cu=INR`;

  const handleRazorpayCheckout = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Step 1: Create Order on Backend
      console.log("Fetching /pay-api/create-order with amount:", price * 100);
      const response = await fetch("/pay-api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price * 100 }), // amount in paise
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error Response:", text);
        try {
          const errData = JSON.parse(text);
          throw new Error(errData.error || "Failed to create payment order");
        } catch (e) {
          throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
        }
      }

      const order = await response.json();

      // Step 2: Open Razorpay Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SoobLWVqBYsa0K",
        amount: order.amount,
        currency: order.currency,
        name: "JyotishGlow",
        description: "Vedic Predictions Premium Report",
        order_id: order.id,
        handler: async (response: any) => {
          // Step 3: Verify Payment Signature
          setStep("processing");
          try {
            const verificationResponse = await fetch("/pay-api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verificationResult = await verificationResponse.json();

            if (verificationResult.success) {
              setStep("success");
              setTimeout(onSuccess, 2000);
            } else {
              setStep("error");
              setErrorMessage(verificationResult.message || "Payment verification failed");
            }
          } catch (error) {
            console.error("Verification Error:", error);
            setStep("error");
            setErrorMessage("An error occurred during verification");
          }
        },
        prefill: {
          name: "", 
          email: "",
          contact: "",
        },
        theme: {
          color: "#fbbf24",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setStep("error");
        setErrorMessage(response.error.description || "Payment failed");
      });
      rzp.open();
    } catch (error: any) {
      console.error("Checkout Error:", error);
      setErrorMessage(error.message || "Could not initialize payment");
      setLoading(false);
    }
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
              <ShieldCheck className="text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Secure Payment Gateway</span>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                 <span className="bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20">
                   Limited Time Offer
                 </span>
              </div>
              <h2 className="text-4xl font-black mb-1 text-white flex items-center justify-center gap-2">
                ₹{price}
                <span className="text-gray-600 text-sm line-through font-medium">₹125</span>
              </h2>
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black italic">Activate Your Destiny</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-4">
                <div className="flex justify-center mb-2">
                   <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-gray-700" />
                      ))}
                   </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Join <span className="text-white font-bold">12,400+ Seekers</span> who unlocked their karmic blueprints today.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2 text-rose-400 text-xs">
                  <AlertCircle size={14} />
                  {errorMessage}
                </div>
              )}

              <button 
                onClick={handleRazorpayCheckout}
                disabled={loading}
                className="btn-primary w-full py-4 text-xs tracking-[0.2em] flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                {loading ? "Initializing..." : "Pay Securely with Razorpay"}
              </button>

              <div className="flex items-center justify-between pt-6 mt-4 border-t border-white/5">
                 <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-widest">
                   <ShieldCheck className="w-3 h-3 text-emerald-500" />
                   100% Secure
                 </div>
                 <div className="text-white/30 text-[9px] font-black uppercase tracking-widest">
                   UPI • Cards • NetBanking
                 </div>
              </div>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-20 flex flex-col items-center text-center space-y-6">
            <div className="relative">
               <div className="w-20 h-20 border-4 border-gold/10 border-t-gold rounded-full animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-gold/50" />
               </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-white">Verifying Payment</h3>
              <p className="text-gray-400 text-xs px-8 uppercase tracking-widest leading-relaxed">
                Our servers are confirming your payment signature with Razorpay...
              </p>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="py-20 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.2)]">
              <AlertCircle size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-rose-500">Payment Failed</h3>
              <p className="text-white text-xs uppercase font-bold tracking-[0.2em] mb-4">
                {errorMessage}
              </p>
              <button 
                onClick={() => setStep("options")}
                className="text-gold font-black uppercase tracking-widest text-[10px] border-b border-gold/30 pb-1"
              >
                Try Again
              </button>
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

