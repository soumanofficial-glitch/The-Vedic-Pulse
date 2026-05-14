import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Calendar, Clock, User } from "lucide-react";
import { BirthDetails } from "../types";
import { trackMetaEvent } from "../lib/metaTracking";

export const AstrologyForm = ({ 
  onClose, 
  onSubmit,
  productId 
}: { 
  onClose: () => void; 
  onSubmit: (details: BirthDetails) => void;
  productId: string;
}) => {
  const [formData, setFormData] = useState<BirthDetails>({
    name: "",
    dob: "",
    tob: "",
    pob: ""
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-cosmic-dark/80 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 relative overflow-hidden bg-white/5 border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold mb-2 text-amber-200">Enter Birth Details</h2>
        <p className="text-gray-400 text-sm mb-8">Guided by 5,000 year old Vedic manuscripts.</p>

        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          trackMetaEvent("InitiateCheckout", {
            em: formData.name, // Not actually an email, but we use it as name search data
          }, {
            content_ids: [productId],
            content_type: "product"
          });
          onSubmit(formData);
        }}>
          <div className="space-y-4">
            <InputField 
              icon={<User size={18} />} 
              label="Full Name" 
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(v) => setFormData({...formData, name: v})}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField 
                icon={<Calendar size={18} />} 
                label="Birth Date" 
                type="date"
                value={formData.dob}
                onChange={(v) => setFormData({...formData, dob: v})}
                required
              />
              <InputField 
                icon={<Clock size={18} />} 
                label="Birth Time" 
                type="time"
                value={formData.tob}
                onChange={(v) => setFormData({...formData, tob: v})}
                required
              />
            </div>
            <InputField 
              icon={<MapPin size={18} />} 
              label="Birth Place" 
              placeholder="e.g. Mumbai, India"
              value={formData.pob}
              onChange={(v) => setFormData({...formData, pob: v})}
              required
            />
          </div>

          <button 
            type="submit"
            className="btn-primary w-full text-sm mt-4 flex items-center justify-center gap-2"
          >
            Calculate Report Insights
          </button>
          
          <p className="text-[10px] text-center text-gray-500 italic uppercase tracking-[0.2em] font-bold">
            SECURE PROCESSING • VEDIC ALIGNMENT
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
};

const InputField = ({ 
  icon, 
  label, 
  placeholder, 
  type = "text",
  value,
  onChange,
  required
}: { 
  icon: React.ReactNode; 
  label: string; 
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold opacity-50 group-focus-within:opacity-100 transition-opacity">
        {icon}
      </div>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:bg-white/10 focus:border-gold/50 outline-none transition-all text-white placeholder:text-gray-600"
      />
    </div>
  </div>
);
