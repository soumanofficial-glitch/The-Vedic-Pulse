import React from "react";
import { motion } from "motion/react";
import { Star, MessageCircle } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sunita Verma",
    location: "Mumbai",
    text: "The business success timing report was spot on! I signed my biggest contract during the recommended Muhurat.",
    rating: 5
  },
  {
    name: "Rahul K.",
    location: "Delhi",
    text: "Amazing accuracy for just ₹12. The daily luck score helps me plan my high-stakes meetings with confidence.",
    rating: 5
  },
  {
    name: "Priyanka S.",
    location: "Bangalore",
    text: "Vedic insights that actually make sense. The Love Compatibility snapshot was surprisingly deep and accurate.",
    rating: 4
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-amber-500/[0.02] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent italic">Trusted by Seekers</h2>
          <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-[10px]">Over 1.2M+ Vedic reports generated globally</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="glass-card p-8 flex flex-col bg-white/[0.02] border-white/5 hover:border-amber-500/20 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={12} className="fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-gray-300 italic mb-8 leading-relaxed font-serif">"{t.text}"</p>
              <div className="mt-auto flex items-center gap-3 pt-6 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/20">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-bold text-sm text-amber-100">{t.name}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
