import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, User, Sparkles, Clock, Lock, CreditCard, ChevronDown, Award, ShieldCheck, Users, Star, BookOpen, CheckCircle, Heart, Zap, Volume2, VolumeX } from "lucide-react";
// Using a high-quality, realistic portrait of a wise elderly Indian man for the astrologer
const astrologerImg = "https://images.unsplash.com/photo-1601054704854-1a2e79dac4d3?q=80&w=800&auto=format&fit=crop";

interface Message {
  id: string;
  role: "user" | "astrologer";
  text: string;
  timestamp: number;
}

const FREE_TRIAL_DURATION_MS = 60 * 1000;
const SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const PRICE_INR = 49;

export const ChatWithAstrologer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isQueueing, setIsQueueing] = useState(false);
  const [queuePos, setQueuePos] = useState(2);
  const [queueProgress, setQueueProgress] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(12); // Starting wait in seconds
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [freeTrialStartedAt, setFreeTrialStartedAt] = useState<number | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [soundVibe, setSoundVibe] = useState<"meditative" | "mantra" | "nature">("meditative");
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const bellRef = useRef<HTMLAudioElement | null>(null);

  const SOUND_TRACKS = {
    meditative: "https://assets.mixkit.co/music/preview/mixkit-meditation-atmosphere-593.mp3",
    mantra: "https://assets.mixkit.co/music/preview/mixkit-meditation-and-mindfulness-589.mp3", // Spiritual mindfulness
    nature: "https://assets.mixkit.co/music/preview/mixkit-morning-meditation-relax-618.mp3" // Airy/Nature
  };

  // Initialize and handle ambient audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(SOUND_TRACKS[soundVibe]);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Subtle volume
    } else {
      // Update track if vibe changes
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = SOUND_TRACKS[soundVibe];
      if (wasPlaying && isOpen && !isMuted) {
        audioRef.current.play().catch(() => {});
      }
    }

    if (!chimeRef.current) {
      chimeRef.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-magic-notification-ring-2359.mp3");
      chimeRef.current.volume = 0.5;
    }

    if (!bellRef.current) {
      bellRef.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-temple-bell-single-hit-1493.mp3");
      bellRef.current.volume = 0.4;
    }

    if (isOpen && !isMuted) {
      audioRef.current.play().catch(err => console.error("Audio play failed:", err));
    } else {
      audioRef.current.pause();
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [isOpen, isMuted, soundVibe]);

  // Load state from localStorage
  useEffect(() => {
    const handleOpenChat = () => {
      // Check if already open or has messages
      const savedMessages = localStorage.getItem("chat_messages");
      if (!savedMessages || JSON.parse(savedMessages).length <= 1) {
        setIsQueueing(true);
        setQueuePos(2);
      }
      setIsOpen(true);
      window.history.pushState({ chatOpen: true }, "");
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("open-astrologer-chat", handleOpenChat);
    window.addEventListener("popstate", handlePopState);

    const savedFreeTrialStartedAt = localStorage.getItem("chat_free_trial_start");
    if (savedFreeTrialStartedAt) setFreeTrialStartedAt(parseInt(savedFreeTrialStartedAt));

    const savedExpiry = localStorage.getItem("chat_session_expiry");
    if (savedExpiry) {
      const expiry = parseInt(savedExpiry);
      if (expiry > Date.now()) {
        setSessionExpiry(expiry);
      }
    }

    const savedMessages = localStorage.getItem("chat_messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Initial greeting - will be shown after queue
      setMessages([
        {
          id: "welcome",
          role: "astrologer",
          text: "Pranam! I am Acharya Shivanand. I have been studying the cosmic charts for over 18 years. I am here to guide you through the celestial alignments of your life. How can the stars help you today?",
          timestamp: Date.now(),
        }
      ]);
    }
    return () => {
      window.removeEventListener("open-astrologer-chat", handleOpenChat);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen]);

  // Queue logic
  useEffect(() => {
    if (isQueueing) {
      setQueueProgress(0);
      setEstimatedWait(12);
      
      const interval = setInterval(() => {
        setQueueProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const next = prev + 1;
          
          // Dynamic queue position updates based on progress
          if (next > 70) setQueuePos(1);
          
          // Update estimated wait
          setEstimatedWait(Math.max(1, Math.ceil((100 - next) / 8)));
          
          return next;
        });
      }, 100);

      const completionTimer = setTimeout(() => {
        setIsQueueing(false);
        // Start free trial exactly when chat becomes available if not already started
        if (!freeTrialStartedAt && !sessionExpiry) {
           const start = Date.now();
           setFreeTrialStartedAt(start);
           localStorage.setItem("chat_free_trial_start", start.toString());
        }
        if (!isMuted && bellRef.current) {
          bellRef.current.play().catch(() => {});
        }
      }, 11000); // 11 second total wait

      return () => {
        clearInterval(interval);
        clearTimeout(completionTimer);
      };
    }
  }, [isQueueing]);

  // Save state to localStorage
  useEffect(() => {
    if (freeTrialStartedAt) {
      localStorage.setItem("chat_free_trial_start", freeTrialStartedAt.toString());
    }
    if (sessionExpiry) {
      localStorage.setItem("chat_session_expiry", sessionExpiry.toString());
    }
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [freeTrialStartedAt, sessionExpiry, messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isQueueing]);

  // Play chime on new astrologer messages or queue completion
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "astrologer" && !isMuted && chimeRef.current) {
      chimeRef.current.play().catch(() => {});
    }
  }, [messages, isMuted, isQueueing]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Check if session is valid or if we are within 30s free trial
    const now = Date.now();
    const hasActiveSession = sessionExpiry && sessionExpiry > now;
    const isWithinFreeTrial = freeTrialStartedAt && (now - freeTrialStartedAt < FREE_TRIAL_DURATION_MS);

    if (!hasActiveSession && !isWithinFreeTrial) {
      setIsPaymentRequired(true);
      return;
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: inputText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText("");
    setIsTyping(true);
    
    try {
      const systemInstruction = `
        You are Acharya Shivanand, a senior Vedic Astrologer with 18+ years of experience.
        Your style is deeply human, warm, and traditional. You are NOT an AI assistant. You are a real person who cares.
        
        CRITICAL FORMATTING RULES:
        - NEVER use asterisks (*) for bolding or lists.
        - NEVER use markdown formatting (no #, -, etc).
        - Write like a person would text on WhatsApp. Use natural capitalization.
        - Use simple sentences. Avoid "As an AI..." or "I am here to help...".
        - Do not structure your answers like a report. Speak in a flow.
        
        Personality Guidelines:
        - Start with a natural warm blessing like 'Pranam beta' or 'Kalyan ho'.
        - Use emotional intelligence. If someone asks about marriage or money, understand the anxiety behind it.
        - Use words like 'Beta', 'Seeker', 'Mitra', 'Child'.
        - Refer to traditional concepts (Karma, Grahas, Doshas) as a wise elder would, not as a textbook.
        - Suggest simple, earthy remedies: "Light a sesame oil lamp on Saturday evening," or "Keep a small bowl of rice for birds on your roof."
        - Keep responses concise but meaningful. Don't ramble.
        
        You are talking on 'The Vedic Pulse'. You represent the peak of spiritual guidance.
      `;

      // Build contents array, ensuring it starts with 'user'
      const contents = [];
      const chatMessages = [...messages, newUserMessage];
      
      for (let i = 0; i < chatMessages.length; i++) {
        const msg = chatMessages[i];
        const role = msg.role === "user" ? "user" : "model";
        
        // Ensure valid sequence for Gemini [user, model, user, model...]
        if (contents.length === 0 && role === "model") continue;
        
        // Skip duplicate roles if any exist by mistake
        if (contents.length > 0 && contents[contents.length-1].role === role) continue;

        contents.push({
          role,
          parts: [{ text: msg.text }]
        });
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents, systemInstruction }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to get AI response");
      }

      const data = await response.json();
      const responseText = data.text || "The stars are a bit cloudy today. Please ask your question again, my child.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "astrologer",
        text: responseText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      
      let userMessage = "Om Namah Shivaya! I am sensing a temporary cosmic misalignment in the celestial currents. Please give it a few moments and try again, my child.";
      
      const errorStr = error instanceof Error ? error.message : String(error);
      
      // Handle the specific Quota Exceeded error (429)
      if (errorStr.includes("429") || errorStr.includes("QUOTA_EXHAUSTED") || errorStr.includes("quota")) {
        userMessage = "Pranam beta. Many seekers are reaching out to the stars right now and the cosmic energies are very intense. My spiritual focus needs a brief moment to recharge. Please try again in 20-30 seconds, or check back a bit later. Kalyan ho!";
        console.warn("DEVELOPER HINT: Quota limits reached. Enable billing in AI Studio to increase limits.");
      } else if (errorStr.includes("API key")) {
        userMessage = "Om Namah Shivaya. It seems some sacred configuration (API Key) is missing for our cosmic connection on this platform. Please ensure your host environment (Vercel) has the GEMINI_API_KEY set correctly. Kalyan ho!";
      } else if (errorStr.includes("fetch")) {
        userMessage = "I am unable to reach the celestial heavens. Please check your internet connection or try again later. The cosmic network is currently unstable.";
      } else {
        // Fallback with a bit more detail if it's a specific recognized error
        if (errorStr && errorStr.length < 100 && !errorStr.includes("[object Object]")) {
           userMessage = `Om Namah Shivaya. The stars whisper an obstacle: "${errorStr}". Please try again in a moment, my child.`;
        }
      }

      const errorMessage: Message = {
        id: "error-" + Date.now(),
        role: "astrologer",
        text: userMessage,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Free Trial & Session Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      
      // Check Premium Session Expiry
      if (sessionExpiry && now >= sessionExpiry) {
        setSessionExpiry(null);
        setIsPaymentRequired(true);
      }
      
      // Check Free Trial Expiry (only if no active premium session)
      if (!sessionExpiry && freeTrialStartedAt) {
        const timeElapsed = now - freeTrialStartedAt;
        if (timeElapsed >= FREE_TRIAL_DURATION_MS) {
          setIsPaymentRequired(true);
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [sessionExpiry, freeTrialStartedAt]);

  const handlePayment = async () => {
    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: PRICE_INR * 100 }), // Paisa
      });
      const order = await response.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SoobLWVqBYsa0K",
        amount: order.amount,
        currency: "INR",
        name: "The Vedic Pulse",
        description: "Premium Astrologer Chat Session",
        order_id: order.id,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              amount: PRICE_INR * 100,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setSessionExpiry(Date.now() + SESSION_DURATION_MS);
            setIsPaymentRequired(false);
          }
        },
        prefill: {
          name: "Seeker",
          email: "seeker@example.com",
        },
        theme: {
          color: "#f59e0b",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
    }
  };

  const timeLeft = sessionExpiry ? Math.max(0, Math.floor((sessionExpiry - currentTime) / 1000)) : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      <button
        onClick={() => {
          if (!isOpen) {
            const savedMessages = localStorage.getItem("chat_messages");
            if (!savedMessages || JSON.parse(savedMessages).length <= 1) {
              setIsQueueing(true);
              setQueuePos(2);
            }
          }
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-amber-500 text-black rounded-full shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce border-2 border-[#050508]">
          1
        </span>
        <div className="absolute right-full mr-4 bg-white text-black px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
           Free Chat (FIRST 1 MIN FREE)
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#0c0c14] border-l border-white/10 z-[60] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/gold-dust.png')] opacity-20 pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 rounded-full flex items-center justify-center p-1 shadow-2xl shadow-amber-500/30">
                      <div className="w-full h-full rounded-full overflow-hidden border border-[#0c0c14] flex items-center justify-center bg-amber-500/10">
                        {imgError ? (
                          <User className="w-8 h-8 text-amber-500" />
                        ) : (
                          <img 
                            src={astrologerImg} 
                            alt="Acharya Shivanand"
                            className="w-full h-full object-cover scale-110"
                            onError={() => setImgError(true)}
                          />
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[#0c0c14] rounded-full animate-pulse shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      Acharya Shivanand
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 rounded-md text-[10px] text-amber-500 font-bold uppercase tracking-widest border border-amber-500/20">
                        <Award className="w-3 h-3" />
                        <span>18+ Years Exp.</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 relative z-10">
                  <div className="flex flex-col items-center mr-2">
                    <button 
                      onClick={() => {
                        const newMuted = !isMuted;
                        setIsMuted(newMuted);
                        if (!newMuted && bellRef.current) {
                          bellRef.current.play().catch(() => {});
                        }
                      }}
                      className={`p-3 rounded-2xl transition-all border border-white/5 hover:border-white/20 active:scale-95 flex flex-col items-center gap-1 ${isMuted ? 'text-gray-500' : 'text-amber-500 bg-amber-500/10'}`}
                      title={isMuted ? "Unmute Ambient Sound" : "Mute Ambient Sound"}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
                      <span className="text-[7px] font-black uppercase tracking-tighter">{isMuted ? "Muted" : "Spiritual"}</span>
                    </button>
                    {!isMuted && (
                      <div className="flex gap-1 mt-1">
                        {(["meditative", "mantra", "nature"] as const).map(v => (
                          <button
                            key={v}
                            onClick={() => setSoundVibe(v)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${soundVibe === v ? 'bg-amber-500 scale-125' : 'bg-white/20 hover:bg-white/40'}`}
                            title={`Switch to ${v} vibe`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowFullProfile(true)}
                    className="p-3 hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white border border-white/5 hover:border-white/20 active:scale-95 flex flex-col items-center gap-1"
                    title="View Qualifications"
                  >
                    <Award className="w-6 h-6 text-amber-500" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Bio</span>
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-3 hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white border border-white/5 hover:border-white/20 active:scale-95"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Full Profile Overlay */}
              <AnimatePresence>
                {showFullProfile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-[70] bg-[#0c0c14] flex flex-col"
                  >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-br from-amber-500/10 to-transparent">
                      <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-amber-500" />
                        <h3 className="text-lg font-black text-white uppercase tracking-wider">Expert Credentials</h3>
                      </div>
                      <button 
                        onClick={() => setShowFullProfile(false)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                      {/* Hero Info */}
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto rounded-[2.5rem] overflow-hidden border-4 border-amber-500/20 shadow-2xl mb-4 p-1 flex items-center justify-center bg-amber-500/5">
                          {imgError ? (
                            <User className="w-16 h-16 text-amber-500" />
                          ) : (
                            <img 
                              src={astrologerImg} 
                              alt="Acharya Shivanand"
                              className="w-full h-full object-cover rounded-[2rem]"
                              onError={() => setImgError(true)}
                            />
                          )}
                        </div>
                        <h4 className="text-2xl font-black text-white mb-1">Acharya Shivanand</h4>
                        <p className="text-amber-500 font-bold text-xs uppercase tracking-[0.3em]">Vedanta Sahitya Acharya</p>
                      </div>

                      {/* Stats Bento */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                          <h5 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Qualifications</h5>
                          <ul className="space-y-2">
                             <li className="flex items-start gap-2 text-xs text-white leading-tight">
                               <CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                               Ph.D in Vedic Astrology (BHU)
                             </li>
                             <li className="flex items-start gap-2 text-xs text-white leading-tight">
                               <CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                               Gold Medalist - Jyotish Visharad
                             </li>
                             <li className="flex items-start gap-2 text-xs text-white leading-tight">
                               <CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                               Certified Nadi Expert
                             </li>
                          </ul>
                        </div>
                        <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                          <h5 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Experience</h5>
                          <div className="space-y-3">
                            <div>
                               <div className="text-lg font-black text-white">18+</div>
                               <div className="text-[10px] text-amber-500 uppercase font-bold">Years Practice</div>
                            </div>
                            <div>
                               <div className="text-lg font-black text-white">50k+</div>
                               <div className="text-[10px] text-amber-500 uppercase font-bold">Readings Done</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expertise Section */}
                      <div className="space-y-4">
                        <h5 className="text-xs text-white uppercase font-black tracking-widest flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          Specializations
                        </h5>
                        <div className="grid grid-cols-1 gap-3">
                          {[
                            { title: "Kundli Analysis", desc: "Detailed breakdown of Janam Patri and planetary positions." },
                            { title: "Matchmaking", desc: "Ashtakoot Guna Milan for successful marriages." },
                            { title: "Career Guidance", desc: "Timing of career shifts based on Dashas." },
                            { title: "Modern Vastu", desc: "Earthy remedies for living spaces." }
                          ].map(spec => (
                            <div key={spec.title} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex gap-4">
                              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
                                <Sparkles className="w-5 h-5" />
                              </div>
                              <div>
                                <h6 className="text-white font-bold text-sm tracking-tight">{spec.title}</h6>
                                <p className="text-xs text-gray-500 mt-1">{spec.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Language & Trust */}
                      <div className="p-6 bg-amber-500 rounded-3xl text-black">
                        <div className="flex items-center gap-3 mb-4">
                          <ShieldCheck className="w-6 h-6" />
                          <h5 className="font-black text-xs uppercase tracking-widest">Verified Spiritual Guide</h5>
                        </div>
                        <p className="text-xs font-bold leading-relaxed opacity-80 mb-4">
                          Acharya Shivanand is a verified expert on The Vedic Pulse. All consultations follow tradition and privacy standards.
                        </p>
                        <div className="flex gap-2">
                          {["Hindi", "English", "Sanskrit"].map(lang => (
                            <span key={lang} className="px-3 py-1 bg-black/10 rounded-full text-[10px] font-black uppercase">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 border-t border-white/10">
                      <button 
                         onClick={() => setShowFullProfile(false)}
                         className="w-full py-4 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-xs uppercase tracking-[0.2em]"
                      >
                        Back to Consultation
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Bar */}
              <div className={`px-5 py-2.5 border-b border-white/5 flex items-center justify-between transition-colors ${
                sessionExpiry && sessionExpiry > Date.now() 
                  ? "bg-amber-500/10" 
                  : "bg-amber-500/[0.03]"
              }`}>
                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                  {sessionExpiry && sessionExpiry > Date.now() ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-black rounded-full text-[12px] font-black shadow-lg shadow-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
                      </div>
                      <span className="text-amber-500 font-bold hidden sm:inline">Premium Session Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                       <span>{freeTrialStartedAt ? Math.max(0, Math.ceil((FREE_TRIAL_DURATION_MS - (currentTime - freeTrialStartedAt)) / 1000)) : 30}s FREE TRIAL LEFT</span>
                    </div>
                  )}
                </div>
                {sessionExpiry && sessionExpiry > Date.now() && (
                  <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-amber-500"
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / (SESSION_DURATION_MS / 1000)) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                )}
              </div>

              {/* Chat Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]"
              >
                {isQueueing ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-8">
                    <div className="relative">
                      {/* Outer Ring */}
                      <svg className="w-32 h-32 -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="transparent"
                          stroke="rgba(245, 158, 11, 0.1)"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-amber-500"
                          strokeDasharray="364.4"
                          initial={{ strokeDashoffset: 364.4 }}
                          animate={{ strokeDashoffset: 364.4 - (364.4 * queueProgress) / 100 }}
                          transition={{ duration: 0.1, ease: "linear" }}
                        />
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span 
                          key={queuePos}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl font-black text-amber-500"
                        >
                          #{queuePos}
                        </motion.span>
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">In Queue</span>
                      </div>
                    </div>

                    <div className="space-y-4 w-full">
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-white tracking-tight italic">Acharya is completing a ritual...</h4>
                        <p className="text-sm text-gray-400 font-medium px-4">
                          Your chart is being fetched from the celestial archives.
                        </p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] text-amber-500 uppercase font-black tracking-widest flex items-center gap-2">
                             <Clock className="w-3 h-3" /> Est. Wait Time
                          </span>
                          <span className="text-xs text-white font-bold">~{estimatedWait}s</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                             className="h-full bg-gradient-to-r from-amber-600 to-amber-300"
                             initial={{ width: "0%" }}
                             animate={{ width: `${queueProgress}%` }}
                             transition={{ duration: 0.1, ease: "linear" }}
                          />
                        </div>
                        
                        <div className="mt-2 text-[8px] text-gray-600 uppercase font-black tracking-[0.2em]">
                           Synchronizing with Shani & Brihaspati...
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-5 pt-4">
                      <div className="flex flex-col items-center gap-1.5 opacity-50">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">End-to-End Encrypted</span>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="flex flex-col items-center gap-1.5 opacity-50">
                        <Users className="w-5 h-5 text-amber-500" />
                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">50+ Global Users</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Professional Profile Card */}
                    <motion.div 
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-8 shadow-2xl relative"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Award className="w-20 h-20 text-amber-500" />
                      </div>
                      
                      <div className="bg-gradient-to-br from-amber-500/20 via-transparent to-transparent p-6 flex flex-col sm:flex-row gap-6">
                        <div className="relative group mx-auto sm:mx-0">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-xl relative z-10 flex items-center justify-center bg-amber-500/5">
                            {imgError ? (
                              <User className="w-12 h-12 text-amber-500" />
                            ) : (
                              <img 
                                src={astrologerImg} 
                                alt="Acharya Shivanand"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={() => setImgError(true)}
                              />
                            )}
                          </div>
                          <div className="absolute -inset-2 bg-amber-500/10 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left pt-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h4 className="text-white font-black text-2xl tracking-tight">Acharya Shivanand</h4>
                            <ShieldCheck className="w-5 h-5 text-amber-500 hidden sm:block" />
                          </div>
                          <p className="text-xs text-amber-500 font-bold uppercase tracking-[0.2em] mb-4">Vedanta Sahitya Acharya</p>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                              <div className="text-amber-500/70 text-[9px] uppercase font-black mb-0.5">Rating</div>
                              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                                <span className="text-white font-bold text-sm">4.9/5</span>
                                <div className="flex">
                                  {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />)}
                                </div>
                              </div>
                            </div>
                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                              <div className="text-amber-500/70 text-[9px] uppercase font-black mb-0.5">Experience</div>
                              <div className="text-white font-bold text-sm">18+ Years</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-5 border-t border-white/10 bg-white/[0.02] space-y-5">
                        {/* Summary */}
                        <p className="text-[13px] text-gray-300 leading-relaxed font-medium italic relative pl-6">
                          <span className="text-3xl text-amber-500 absolute -top-1 -left-1 opacity-20 serif leading-none">"</span>
                          Bridging the gap between ancient Vedic wisdom and modern life challenges through precise Mahadasha and planetary analysis.
                        </p>

                        {/* Structured Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-2 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-amber-500 font-black text-xs">50K+</div>
                            <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Consultations</div>
                          </div>
                          <div className="text-center p-2 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-amber-500 font-black text-xs">Ph.D</div>
                            <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Vedic Studies</div>
                          </div>
                          <div className="text-center p-2 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-amber-500 font-black text-xs">Gold</div>
                            <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Medalist</div>
                          </div>
                        </div>

                        {/* Expertise List */}
                        <div className="space-y-3">
                          <h5 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                             <Zap className="w-3 h-3 text-amber-500" /> Key Specializations
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: "Janam Kundli", icon: <BookOpen className="w-3 h-3" /> },
                              { label: "Vivah Match", icon: <Heart className="w-3 h-3" /> },
                              { label: "Nadi Jyotish", icon: <CheckCircle className="w-3 h-3" /> },
                              { label: "Vastu Shastra", icon: <Users className="w-3 h-3" /> }
                            ].map(item => (
                              <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full text-[11px] text-amber-500 font-bold border border-amber-500/20">
                                {item.icon}
                                {item.label}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Credentials */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Certified Vedic Expert</span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            Language: <span className="text-gray-300">Hindi, English, Sanskrit</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[88%] rounded-2xl px-5 py-4 text-[14px] leading-relaxed shadow-lg ${
                          msg.role === "user" 
                            ? "bg-amber-500 text-black font-semibold rounded-br-none" 
                            : "bg-white/[0.05] border border-white/10 text-white rounded-bl-none backdrop-blur-md"
                        }`}>
                          {msg.text}
                          <div className={`text-[10px] mt-2 opacity-40 font-medium ${msg.role === "user" ? "text-black text-right" : "text-gray-400 text-left"}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Required Overlay */}
              {isPaymentRequired && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="px-6 py-8 bg-gradient-to-b from-[#1a1a2e] to-[#0c0c14] border-t border-amber-500/30 mx-4 mb-6 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                  
                  {/* Decorative glow */}
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

                  <div className="flex justify-center relative">
                    <div className="w-20 h-20 bg-gradient-to-tr from-amber-600 to-amber-300 text-black rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/40 ring-4 ring-amber-500/20">
                      <Sparkles className="w-10 h-10 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-2 relative">
                    <h4 className="text-2xl font-black text-white tracking-tight">Cosmic Guidance Awaits</h4>
                    <p className="text-sm text-gray-400 px-4 leading-relaxed font-medium">
                      Acharya Shivanand is ready to reveal your destiny. Connect now for a deep personal consultation.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative">
                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 group hover:border-amber-500/30 transition-colors">
                      <div className="flex items-baseline gap-2">
                        <div className="text-amber-500 font-black text-2xl">₹49</div>
                        <div className="text-sm text-gray-500 line-through font-bold opacity-50">₹75</div>
                      </div>
                      <div className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mt-1">Limited Time Offer!</div>
                    </div>
                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 group hover:border-amber-500/30 transition-colors">
                      <div className="text-white font-black text-2xl">5 <span className="text-xs">min</span></div>
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Full Access</div>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    className="w-full py-5 bg-amber-500 text-black font-black rounded-2xl hover:bg-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-[0.25em] shadow-[0_0_40px_rgba(245,158,11,0.3)] relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <CreditCard className="w-5 h-5" />
                    Unlock Live Session
                  </button>
                  
                  <div className="flex items-center justify-center gap-6 pt-2">
                    <div className="flex items-center gap-1.5 grayscale opacity-50">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Verified</span>
                    </div>
                    <div className="flex items-center gap-1.5 grayscale opacity-50">
                       <Lock className="w-4 h-4 text-green-500" />
                       <span className="text-[10px] font-bold uppercase tracking-tighter">Razorpay</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Input Area */}
              {!isPaymentRequired && !isQueueing && (
                <div className="p-5 border-t border-white/10 bg-[#0c0c14] relative">
                  <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="relative flex items-center gap-3">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Ask your life question..."
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-[14px] text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-all focus:ring-4 focus:ring-amber-500/5"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() || isTyping}
                      className="p-4 bg-amber-500 text-black rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] group"
                    >
                      <Send className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-600 mt-3 text-center uppercase tracking-[0.15em] font-bold">
                    English • Hindi • Hinglish
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
