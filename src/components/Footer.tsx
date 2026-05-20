import React from "react";
import { motion } from "motion/react";
import { Sparkles, Instagram, Facebook, MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative z-10">
      {/* Immersive Trust Bar */}
      <div className="bg-black/50 border-t border-white/5 py-6 px-10 flex flex-col md:flex-row items-center justify-between backdrop-blur-xl gap-6">
        <div className="flex flex-wrap gap-8 items-center grayscale opacity-60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payments</span>
            <div className="flex gap-1 h-3">
              <div className="w-6 bg-white/20 rounded"></div>
              <div className="w-6 bg-white/20 rounded"></div>
              <div className="w-6 bg-white/20 rounded"></div>
            </div>
          </div>
          <div className="h-4 w-px bg-white/10 hidden md:block"></div>
          <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400">RAZORPAY • PHONEPE • PAYTM • UPI</div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="inline-block px-2 py-0.5 bg-red-500 text-white rounded text-[8px] font-bold">HOT</span>
            Today's Muhurat closes in 01h 42m
          </div>
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>
          <a href="#" className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-5 py-2.5 rounded-full text-xs font-bold border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all">
            <MessageCircle size={14} /> Get Free Rashifal on WhatsApp
          </a>
        </div>
      </div>

      <div className="py-20 px-6 bg-cosmic-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                 <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center font-bold text-black text-sm">ॐ</div>
                 <span className="text-xl font-bold tracking-tight uppercase leading-none">
                   Vedic<span className="text-amber-400">Pulse</span>
                 </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Merging ancient Vedic wisdom with modern technology to guide your life with precision and clarity.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-amber-200/50">Quick Links</h4>
              <ul className="space-y-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                <li><button onClick={() => document.getElementById('horoscope')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-amber-400 transition-colors">Daily Rashifal</button></li>
                <li><button onClick={() => document.getElementById('panjika')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-amber-400 transition-colors">Vedic Panjika</button></li>
                <li><button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-amber-400 transition-colors">Kundli Match</button></li>
                <li><button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-amber-400 transition-colors">Vastu Shastra</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-amber-200/50">Support</h4>
              <ul className="space-y-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                <li>
                  <button 
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("open-terms-popup", { detail: { tab: "terms" } }))} 
                    className="hover:text-amber-400 transition-colors text-left w-full cursor-pointer"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("open-terms-popup", { detail: { tab: "refund" } }))} 
                    className="hover:text-amber-400 transition-colors text-left w-full cursor-pointer"
                  >
                    Refund Policy
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("open-terms-popup", { detail: { tab: "terms" } }))} 
                    className="hover:text-amber-400 transition-colors text-left w-full cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("open-terms-popup", { detail: { tab: "privacy" } }))} 
                    className="hover:text-amber-400 transition-colors text-left w-full cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-6 text-amber-200/50">Social</h4>
              <div className="flex gap-4 justify-center md:justify-start">
                <SocialIcon icon={<Instagram size={18} />} />
                <SocialIcon icon={<Facebook size={18} />} />
                <SocialIcon icon={<MessageCircle size={18} />} />
              </div>
              <p className="mt-8 text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em]">
                Made with ❤️ in India.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em] mb-4">
              Disclaimer: Astrology is for guidance and entertainment purposes only.
            </p>
            <p className="text-[10px] text-gray-600 font-medium">
              &copy; 2026 VedicPulse Digital Services. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
  <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-cosmic-dark transition-all">
    {icon}
  </a>
);
