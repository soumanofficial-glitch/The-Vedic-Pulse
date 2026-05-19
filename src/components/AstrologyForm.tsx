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
  onSubmit: (details: BirthDetails, partner2?: BirthDetails) => void;
  productId: string;
}) => {
  const isLoveReport = productId === "love-compatibility";
  const [formData, setFormData] = useState<BirthDetails>({
    name: "",
    dob: "",
    tob: "",
    pob: ""
  });

  const [partner2Data, setPartner2Data] = useState<BirthDetails>({
    name: "",
    dob: "",
    tob: "",
    pob: ""
  });

  const [activePartner, setActivePartner] = useState<1 | 2>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoveReport && activePartner === 1) {
      setActivePartner(2);
      return;
    }

    // Split name for better Meta CAPI matching
    const nameParts = formData.name.trim().split(/\s+/);
    const fn = nameParts[0];
    const ln = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    trackMetaEvent("InitiateCheckout", {
      fn: fn,
      ln: ln,
    }, {
      content_ids: [productId],
      content_type: "product"
    });
    
    if (isLoveReport) {
      onSubmit(formData, partner2Data);
    } else {
      onSubmit(formData);
    }
  };

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

        <h2 className="text-3xl font-bold mb-2 text-amber-200">
          {isLoveReport ? "Compatibility Details" : "Janam Kundli Details"}
        </h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          {isLoveReport 
            ? "Enter birth details of both partners for a deep spiritual compatibility analysis."
            : "Exact birth details are essential for precise calculation of your Nakshatras, Grahas and Mahadashas."}
        </p>

        {isLoveReport && (
          <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/5">
            <button 
              onClick={() => setActivePartner(1)}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activePartner === 1 ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-white'}`}
            >
              Partner 1 (You)
            </button>
            <button 
              onClick={() => {
                if (formData.name && formData.dob) {
                  setActivePartner(2);
                }
              }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activePartner === 2 ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-gray-500 hover:text-white'}`}
            >
              Partner 2
            </button>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePartner}
              initial={{ opacity: 0, x: activePartner === 1 ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activePartner === 1 ? 10 : -10 }}
              className="space-y-4"
            >
              {activePartner === 1 ? (
                <>
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
                </>
              ) : (
                <>
                  <InputField 
                    icon={<User size={18} />} 
                    label="Partner's Name" 
                    placeholder="e.g. Simran Kaur"
                    value={partner2Data.name}
                    onChange={(v) => setPartner2Data({...partner2Data, name: v})}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField 
                      icon={<Calendar size={18} />} 
                      label="Birth Date" 
                      type="date"
                      value={partner2Data.dob}
                      onChange={(v) => setPartner2Data({...partner2Data, dob: v})}
                      required
                    />
                    <InputField 
                      icon={<Clock size={18} />} 
                      label="Birth Time" 
                      type="time"
                      value={partner2Data.tob}
                      onChange={(v) => setPartner2Data({...partner2Data, tob: v})}
                      required
                    />
                  </div>
                  <InputField 
                    icon={<MapPin size={18} />} 
                    label="Birth Place" 
                    placeholder="e.g. Delhi, India"
                    value={partner2Data.pob}
                    onChange={(v) => setPartner2Data({...partner2Data, pob: v})}
                    required
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <button 
            type="submit"
            className={`w-full py-4 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-xl active:scale-95 ${activePartner === 2 ? 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/20' : 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'}`}
          >
            {isLoveReport 
              ? (activePartner === 1 ? "Next: Partner Details" : "Match Our Souls") 
              : "Generate My Vedic Report"}
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
