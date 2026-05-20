import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, FileText, RefreshCw, Lock } from "lucide-react";

export const TermsPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "refund">("terms");

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: "terms" | "privacy" | "refund" }>;
      if (customEvent.detail && customEvent.detail.tab) {
        setActiveTab(customEvent.detail.tab);
      }
      setIsOpen(true);
    };

    window.addEventListener("open-terms-popup", handleOpen);
    return () => {
      window.removeEventListener("open-terms-popup", handleOpen);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl"
        onClick={() => setIsOpen(false)}
        id="terms-popup-overlay"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-[#0a0f1e] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
          id="terms-popup-dialog"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
                ॐ
              </div>
              <div>
                <h3 className="font-bold text-white text-lg tracking-tight uppercase leading-none">
                  Legal Documents
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  The Vedic Pulse
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              id="terms-popup-close-btn"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/5 px-6 py-2 bg-black/20 gap-2 overflow-x-auto scrollbar-none">
            <TabButton
              active={activeTab === "terms"}
              onClick={() => setActiveTab("terms")}
              icon={<FileText size={14} />}
              label="Terms & Conditions"
              id="terms-tab-btn"
            />
            <TabButton
              active={activeTab === "privacy"}
              onClick={() => setActiveTab("privacy")}
              icon={<Lock size={14} />}
              label="Privacy Policy"
              id="privacy-tab-btn"
            />
            <TabButton
              active={activeTab === "refund"}
              onClick={() => setActiveTab("refund")}
              icon={<RefreshCw size={14} />}
              label="Refund Policy"
              id="refund-tab-btn"
            />
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-gray-400 leading-relaxed font-sans">
            {activeTab === "terms" && (
              <div className="space-y-4" id="terms-content">
                <h4 className="text-white font-black uppercase text-xs tracking-widest text-amber-400">
                  1. Acceptance of Terms
                </h4>
                <p>
                  By accessing or using{" "}
                  <a href="https://thevedicpulse.in?utm_source=chatgpt.com" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-white">
                    The Vedic Pulse
                  </a>
                  , you agree to comply with and be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use the platform or purchase any services.
                </p>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-amber-400">
                  2. AI-Generated Services Only
                </h4>
                <p>
                  All reports, predictions, chats, recommendations, spiritual guidance, astrology readings, compatibility reports, numerology outputs, tarot interpretations, and related content provided on this platform are fully generated using Artificial Intelligence (AI) systems.
                </p>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="font-bold text-gray-300 uppercase text-[10px] tracking-wider mb-2">
                    Please Note:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>No human astrologer involved</li>
                    <li>No manual review</li>
                    <li>No personal consultation by any expert</li>
                    <li>No guaranteed accuracy</li>
                  </ul>
                </div>
                <p>
                  Users acknowledge that all outputs are automated AI-generated responses and may contain technical inaccuracies, misinterpretations, incomplete information, delays, and system-generated errors. The platform is intended for entertainment, informational, and experimental purposes only.
                </p>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-amber-400">
                  3. No Refund Policy
                </h4>
                <p>
                  All payments made on{" "}
                  <a href="https://thevedicpulse.in?utm_source=chatgpt.com" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-white">
                    The Vedic Pulse
                  </a>{" "}
                  are final and non-refundable. By purchasing any report, recharge, subscription, or AI chat service, you agree that no refunds will be issued under any circumstances. Details are outlined in the Refund Policy tab.
                </p>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-amber-400">
                  4. Technical Limitations Disclaimer
                </h4>
                <p>
                  As the platform operates using AI technologies and automated systems, occasional issues may occur, including but not limited to: server downtime, payment delays, incomplete reports, chat interruptions, incorrect calculations, delayed responses, and system or API failures. Users understand and accept these risks before using the platform. If you believe technical issues may affect your experience, you are advised not to proceed with payment or usage.
                </p>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-amber-400">
                  5. No Professional Advice
                </h4>
                <p>
                  The content generated on this platform should not be considered medical advice, legal advice, financial advice, psychological counseling, or professional consultation. Users should not make critical life decisions solely based on AI-generated responses from the platform.
                </p>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-amber-400">
                  6. User Responsibility
                </h4>
                <p>
                  Users are solely responsible for their decisions and actions, interpretation of AI-generated outputs, maintaining confidentiality of their account, and ensuring payments are made voluntarily.
                </p>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-amber-400">
                  7. Service Modifications
                </h4>
                <p>
                  <a href="https://thevedicpulse.in?utm_source=chatgpt.com" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-white">
                    The Vedic Pulse
                  </a>{" "}
                  reserves the right to modify services, change pricing, remove features, suspend access, update AI systems, and update these Terms & Conditions at any time without prior notice.
                </p>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-amber-400">
                  8. Limitation of Liability
                </h4>
                <p>
                  Under no circumstances shall{" "}
                  <a href="https://thevedicpulse.in?utm_source=chatgpt.com" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-white">
                    The Vedic Pulse
                  </a>
                  , its owners, developers, affiliates, or partners be liable for: emotional distress, financial loss, relationship decisions, business losses, data loss, or any direct or indirect damages arising from use of the platform. Use of the platform is entirely at the user's own risk.
                </p>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-amber-400">
                  9. Consent
                </h4>
                <p>
                  By using this website, you confirm that you understand the services are AI-generated, you agree to the no-refund policy, you accept possible technical inaccuracies, and you voluntarily use the platform at your own discretion.
                </p>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-amber-400">
                  10. Contact
                </h4>
                <p>
                  For general support or technical queries, users may contact the platform through the official contact details provided on the website or via email at{" "}
                  <a href="mailto:info.vedicpulse@gmail.com" className="text-amber-400 underline hover:text-white">
                    info.vedicpulse@gmail.com
                  </a>
                  .
                </p>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-4" id="privacy-content">
                <h4 className="text-white font-black uppercase text-xs tracking-widest text-emerald-400">
                  1. Information We Collect
                </h4>
                <p>
                  We respect your cosmic and digital privacy. To generate personalized Vedic charts and reports, we acquire and temporarily process basic astronomic requirements, specifically:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Full Name</strong> (for personalization of data outputs and Astro-linguistic parameters).</li>
                  <li><strong>Exact Date of Birth & Time of Birth</strong> (essential for building correct planetary coordinates and ascendants).</li>
                  <li><strong>Place of Birth</strong> (crucial to determine latitude, longitude, and timezone offsets to secure optimal accuracy).</li>
                </ul>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-emerald-400">
                  2. Use & Storage of Data
                </h4>
                <p>
                  Your birth information is primarily processed client-side or sent over secure TLS encryption to our server API endpoints to construct calculations. We only store reports when you explicitly trigger "Share Report", which uploads the completed chart data to our secure Google Cloud Firestore instance to generate a shareable web reference.
                </p>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-emerald-400">
                  3. Cookies & Tracking
                </h4>
                <p>
                  Our server may initialize functional cookies to preserve active sessions and preferences. We may utilize conversion API services (such as the Meta Pixel) to track successful page views and product orders to evaluate campaign performance.
                </p>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-emerald-400">
                  4. Security Standards
                </h4>
                <p>
                  We coordinate with modern security standards to safeguard your data. All transactions are encrypted, and we strictly enforce authorized access policies across all cloud databases. Under no circumstances do we sell, lease, or distribute private details to external advertising networks.
                </p>
              </div>
            )}

            {activeTab === "refund" && (
              <div className="space-y-4" id="refund-content">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-200 flex gap-3">
                  <ShieldCheck size={20} className="shrink-0 text-red-400" />
                  <div>
                    <span className="font-bold block mb-1 uppercase tracking-wider text-red-400">No Refund Policy</span>
                    Please read carefully before proceeding. All purchases on out platform are final.
                  </div>
                </div>

                <h4 className="text-white font-black uppercase text-xs tracking-widest text-red-400">
                  3. No Refund Policy
                </h4>
                <p>
                  All payments made on{" "}
                  <a href="https://thevedicpulse.in?utm_source=chatgpt.com" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-white font-bold">
                    The Vedic Pulse
                  </a>{" "}
                  are final and non-refundable.
                </p>
                <p className="font-bold text-gray-300">
                  By purchasing any report, recharge, subscription, or AI chat service, you agree that:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-400">
                  <li>No refunds will be issued under any circumstances</li>
                  <li>Dissatisfaction with responses is not eligible for refunds</li>
                  <li>Incorrect or unexpected AI outputs are not grounds for refund</li>
                  <li>Partial usage or non-usage of services will not qualify for refund</li>
                  <li>Technical glitches, delays, or AI-generated inconsistencies do not qualify for refund claims</li>
                </ul>
                <p className="italic text-gray-400">
                  Please do not make any payment if you are unsure about using AI-generated services.
                </p>
              </div>
            )}
          </div>

          {/* Footer of popup */}
          <div className="p-6 border-t border-white/5 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-emerald-500 animate-pulse" />
              128-Bit Encryption Secure
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="py-2.5 px-6 bg-gold text-black hover:bg-white transition-all font-black uppercase text-[10px] tracking-widest rounded-full"
              id="terms-popup-accept-btn"
            >
              Close and Accept
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  id?: string;
}

const TabButton = ({ active, onClick, icon, label, id }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
      active
        ? "bg-white/10 text-white border-white/10 shadow-lg"
        : "text-gray-500 hover:text-white border-transparent hover:bg-white/5"
    }`}
    id={id}
  >
    {icon}
    {label}
  </button>
);
