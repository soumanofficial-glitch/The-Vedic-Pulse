import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What exactly is the 2026-2030 Future Prediction Report?",
    answer: "It is a comprehensive 5-year outlook based on your unique birth chart. It analyzes major planetary transits, Mahadasha periods, and provides specific predictions for career, wealth, health, and relationships from 2026 through 2030."
  },
  {
    question: "How accurate are these Vedic astrology reports?",
    answer: "Our reports use advanced algorithms based on traditional Bhrigu Samhita and Parashara principles. While astrology provides probabilistic insights based on cosmic alignments, thousands of users have found our 'Micro-Reports' to be remarkably resonant with their life experiences."
  },
  {
    question: "Is it possible to download a PDF of my report?",
    answer: "Yes! Every report generated on our platform comes with a 'Download PDF' option. You can save your personalized Karmic Blueprint to your device for offline reading and future reference at no extra cost."
  },
  {
    question: "Why are the reports priced so low (₹9 - ₹49)?",
    answer: "Our mission is to make Vedic wisdom accessible to everyone. By using AI-enhanced calculation engines, we remove the high costs of traditional consultations while maintaining high accuracy, passing those savings directly to you."
  },
  {
    question: "What if I don't know my exact birth time?",
    answer: "For the most accurate predictions, birth time is crucial. However, if you have an approximate time (e.g., 'early morning'), you can use that. For general luck scores, even a birth date is helpful, though the detailed houses change every 2 hours."
  },
  {
    question: "How do I access my report after payment?",
    answer: "Immediately after your Razorpay payment is successful, our system generates your report in seconds. You will be redirected to your personal dashboard where you can view, interact with, and download your report instantly."
  }
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left hover:text-amber-400 transition-colors group"
      >
        <span className="text-base md:text-lg font-medium pr-8">{question}</span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${isOpen ? 'bg-amber-400 border-amber-400 text-navy' : 'group-hover:border-amber-400/50'}`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-gray-400 leading-relaxed text-sm md:text-base italic">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <HelpCircle className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Knowledge Base</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Common Inquiries</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Everything you need to know about our reports, pricing structure, and the science of Vedic precision.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 md:p-8 backdrop-blur-xl">
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
            <p className="text-gray-500 text-xs uppercase tracking-widest">
                Still have questions? Reach out to support at <span className="text-amber-500/80">help@jyotishglow.com</span>
            </p>
        </div>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
    </section>
  );
};
