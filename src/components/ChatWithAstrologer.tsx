import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, User, Sparkles, Clock, Lock, CreditCard, ChevronDown, Award, ShieldCheck, Users, Star, BookOpen, CheckCircle, Heart, Zap, Volume2, VolumeX } from "lucide-react";
import { ASTROLOGERS, AstrologerProfile } from "./astrologersData";

interface Message {
  id: string;
  role: "user" | "astrologer";
  text: string;
  timestamp: number;
}

const FREE_TRIAL_DURATION_MS = 30 * 1000;
const SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const PRICE_INR = 7;

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
  
  // Choose astrologer states
  const [selectedAstrologer, setSelectedAstrologer] = useState<AstrologerProfile>(() => {
    const savedId = localStorage.getItem("selected_astrologer_id");
    const found = ASTROLOGERS.find(a => a.id === savedId);
    return found || ASTROLOGERS[0];
  });
  
  const [showSelector, setShowSelector] = useState(() => {
    const key = `chat_messages_${localStorage.getItem("selected_astrologer_id") || ASTROLOGERS[0].id}`;
    return !localStorage.getItem(key);
  });
  
  const [filter, setFilter] = useState("All");
  const [avatarErrors, setAvatarErrors] = useState<Record<string, boolean>>({});
  const [soundVibe, setSoundVibe] = useState<"meditative" | "mantra" | "nature">("meditative");
  
  // Busy astrologers state
  const [busyAstrologers, setBusyAstrologers] = useState<Record<string, { waitMin: number }>>({});
  const [isBusyWaiting, setIsBusyWaiting] = useState(false);
  const [busyWaitSeconds, setBusyWaitSeconds] = useState(0);

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

  // Load and listen for open event
  useEffect(() => {
    const handleOpenChat = () => {
      const savedId = localStorage.getItem("selected_astrologer_id") || ASTROLOGERS[0].id;
      const key = `chat_messages_${savedId}`;
      const savedMessages = localStorage.getItem(key);
      
      if (!savedMessages) {
        setShowSelector(true);
      } else {
        const parsed = JSON.parse(savedMessages);
        const hasUserSentMessage = parsed && parsed.some((m: any) => m.role === "user");
        if (!hasUserSentMessage) {
          setShowSelector(true);
        } else {
          setShowSelector(false);
        }
      }
      setIsOpen(true);
      window.history.pushState({ chatOpen: true }, "");
    };

    const handlePopState = () => {
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

    return () => {
      window.removeEventListener("open-astrologer-chat", handleOpenChat);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, selectedAstrologer]);

  // Load and store messages based on selectedAstrologer
  useEffect(() => {
    const savedKey = `chat_messages_${selectedAstrologer.id}`;
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        {
          id: `${selectedAstrologer.id}-welcome`,
          role: "astrologer",
          text: selectedAstrologer.greetingMsg,
          timestamp: Date.now()
        }
      ]);
    }
    localStorage.setItem("selected_astrologer_id", selectedAstrologer.id);
  }, [selectedAstrologer]);

  // Queue simulation logic
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
          
          if (next > 70) setQueuePos(1);
          setEstimatedWait(Math.max(1, Math.ceil((100 - next) / 8)));
          return next;
        });
      }, 100);

      const completionTimer = setTimeout(() => {
        setIsQueueing(false);
        if (!freeTrialStartedAt && !sessionExpiry) {
           const start = Date.now();
           setFreeTrialStartedAt(start);
           localStorage.setItem("chat_free_trial_start", start.toString());
        }
        if (!isMuted && bellRef.current) {
          bellRef.current.play().catch(() => {});
        }
      }, 11000); // 11 seconds total wait

      return () => {
        clearInterval(interval);
        clearTimeout(completionTimer);
      };
    }
  }, [isQueueing]);

  // Busy astrologers initialization and active wait countdown tracker
  useEffect(() => {
    const busyRecords: Record<string, { waitMin: number }> = {};
    const defaultId = localStorage.getItem("selected_astrologer_id") || ASTROLOGERS[0].id;
    const possibleIds = ASTROLOGERS.map(a => a.id).filter(id => id !== defaultId);
    
    // Pick 3 random astrologers to be busy
    const shuffled = [...possibleIds].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 3);
    
    picked.forEach(id => {
      busyRecords[id] = {
        waitMin: Math.floor(Math.random() * 11) + 5 // 5 to 15 minutes of randomized wait
      };
    });
    setBusyAstrologers(busyRecords);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBusyWaiting && busyWaitSeconds > 0) {
      timer = setInterval(() => {
        setBusyWaitSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Once wait timer completes, transfer priority smoothly to instant loader connection
            setIsBusyWaiting(false);
            setIsQueueing(true);
            setQueuePos(1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isBusyWaiting, busyWaitSeconds]);

  // Save changes to local history
  useEffect(() => {
    if (freeTrialStartedAt) {
      localStorage.setItem("chat_free_trial_start", freeTrialStartedAt.toString());
    }
    if (sessionExpiry) {
      localStorage.setItem("chat_session_expiry", sessionExpiry.toString());
    }
    if (messages.length > 0) {
      localStorage.setItem(`chat_messages_${selectedAstrologer.id}`, JSON.stringify(messages));
    }
  }, [freeTrialStartedAt, sessionExpiry, messages, selectedAstrologer]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isTyping, isQueueing, showSelector, isBusyWaiting]);

  // Play micro chime on new messages
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "astrologer" && !isMuted && chimeRef.current) {
      chimeRef.current.play().catch(() => {});
    }
  }, [messages, isMuted, isQueueing]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

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
      const systemInstruction = selectedAstrologer.systemPrompt;

      // Build valid structures for Gemini backend
      const contents = [];
      const chatMessages = [...messages, newUserMessage];
      
      for (let i = 0; i < chatMessages.length; i++) {
        const msg = chatMessages[i];
        const role = msg.role === "user" ? "user" : "model";
        
        if (contents.length === 0 && role === "model") continue;
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

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("The celestial connection returned an unexpected format. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data?.details || data?.error || "Failed to get AI response");
      }

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
      
      if (errorStr.includes("429") || errorStr.includes("QUOTA_EXHAUSTED") || errorStr.includes("quota")) {
        userMessage = "Pranam beta. Many seekers are reaching out to the stars right now and the cosmic energies are very intense. My spiritual focus needs a brief moment to recharge. Please try again in 20-30 seconds, or check back a bit later. Kalyan ho!";
      } else if (errorStr.includes("API key")) {
        userMessage = "Om Namah Shivaya. It seems some sacred configuration is missing. Our cosmic gateway is temporarily closed. Please check back soon. Kalyan ho!";
      } else if (errorStr.includes("fetch") || errorStr.includes("Failed to fetch")) {
        userMessage = "I am unable to reach the celestial heavens at this moment. The spiritual pathways are temporarily clouded. Please try again after a brief meditation.";
      } else if (errorStr.includes("SAFETY") || errorStr.includes("blocked")) {
        userMessage = "Beta, the stars are silent on this specific matter. The cosmic balance prevents me from providing guidance here. Please ask something else. Kalyan ho!";
      } else {
        userMessage = "Om Namah Shivaya. A spiritual cloud is passing over our connection. Let us wait for a moment and try again. Kalyan ho!";
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

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      
      if (sessionExpiry && now >= sessionExpiry) {
        setSessionExpiry(null);
        setIsPaymentRequired(true);
      }
      
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
        description: `Premium Consultation with ${selectedAstrologer.name}`,
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

  // Filter calculation
  const filteredAstrologers = ASTROLOGERS.filter(item => {
    if (filter === "All") return true;
    if (filter === "Kundli") {
      return item.specializations.some(s => s.title.toLowerCase().includes("kundli") || s.title.toLowerCase().includes("kp") || s.title.toLowerCase().includes("panchang"));
    }
    if (filter === "Relationship") {
      return item.specializations.some(s => s.title.toLowerCase().includes("marriage") || s.title.toLowerCase().includes("milan") || s.title.toLowerCase().includes("relationship") || s.title.toLowerCase().includes("harmony"));
    }
    if (filter === "Career") {
      return item.specializations.some(s => s.title.toLowerCase().includes("career") || s.title.toLowerCase().includes("business") || s.title.toLowerCase().includes("corporate") || s.title.toLowerCase().includes("financial") || s.title.toLowerCase().includes("investment"));
    }
    if (filter === "Remedies") {
      return item.specializations.some(s => s.title.toLowerCase().includes("rem") || s.title.toLowerCase().includes("mantra") || s.title.toLowerCase().includes("rit") || s.title.toLowerCase().includes("pooja") || s.title.toLowerCase().includes("sadhana") || s.title.toLowerCase().includes("totka"));
    }
    return true;
  });

  return (
    <>
      <button
        onClick={() => {
          if (!isOpen) {
            const savedId = localStorage.getItem("selected_astrologer_id") || ASTROLOGERS[0].id;
            const savedMessages = localStorage.getItem(`chat_messages_${savedId}`);
            if (!savedMessages || JSON.parse(savedMessages).length <= 1) {
              setShowSelector(true);
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
           Free Chat (FIRST 30 SEC FREE)
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
              className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#0c0c14] border-l border-white/10 z-[60] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-between relative overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/gold-dust.png')] opacity-20 pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10 min-w-0">
                  <div className="relative shrink-0 cursor-pointer" onClick={() => setShowSelector(true)}>
                    <div className="w-12 h-12 bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 rounded-full flex items-center justify-center p-0.5 shadow-xl shadow-amber-500/20">
                      <div className="w-full h-full rounded-full overflow-hidden border border-[#0c0c14] flex items-center justify-center bg-amber-500/10">
                        {avatarErrors[selectedAstrologer.id] ? (
                          <User className="w-6 h-6 text-amber-500" />
                        ) : (
                          <img 
                            src={selectedAstrologer.avatar} 
                            alt={selectedAstrologer.name}
                            className="w-full h-full object-cover scale-110"
                            onError={() => setAvatarErrors(prev => ({ ...prev, [selectedAstrologer.id]: true }))}
                          />
                        )}
                      </div>
                    </div>
                    {busyAstrologers[selectedAstrologer.id] && isBusyWaiting ? (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-[#0c0c14] rounded-full animate-pulse shadow-md" />
                    ) : (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0c0c14] rounded-full animate-pulse shadow-md" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 
                      onClick={() => setShowSelector(true)}
                      className="text-md font-black text-white tracking-tight flex items-center gap-1 cursor-pointer hover:text-amber-400 transition-colors truncate"
                    >
                      {selectedAstrologer.name}
                      <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 rounded text-[9px] text-amber-500 font-bold uppercase tracking-widest border border-amber-500/10 whitespace-nowrap">
                        <Award className="w-2.5 h-2.5" />
                        <span>{selectedAstrologer.experience}+ Years Exp.</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 relative z-10 shrink-0">
                  <div className="flex flex-col items-center mr-1">
                    <button 
                      onClick={() => {
                        const newMuted = !isMuted;
                        setIsMuted(newMuted);
                        if (!newMuted && bellRef.current) {
                          bellRef.current.play().catch(() => {});
                        }
                      }}
                      className={`p-2.5 rounded-xl transition-all border border-white/5 hover:border-white/20 active:scale-95 flex flex-col items-center gap-0.5 ${isMuted ? 'text-gray-500' : 'text-amber-500 bg-amber-500/10'}`}
                      title={isMuted ? "Unmute Ambient Sound" : "Mute Ambient Sound"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
                      <span className="text-[6px] font-black uppercase tracking-tighter">{isMuted ? "Muted" : "Spiritual"}</span>
                    </button>
                    {!isMuted && (
                      <div className="flex gap-1 mt-0.5">
                        {(["meditative", "mantra", "nature"] as const).map(v => (
                          <button
                            key={v}
                            onClick={() => setSoundVibe(v)}
                            className={`w-1 h-1 rounded-full transition-all ${soundVibe === v ? 'bg-amber-500 scale-125' : 'bg-white/20 hover:bg-white/40'}`}
                            title={`Switch to ${v} vibe`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Select alternate master */}
                  <button 
                    onClick={() => setShowSelector(true)}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white border border-white/5 hover:border-white/20 active:scale-95 flex flex-col items-center gap-0.5"
                    title="Switch Guide (20 Experts)"
                  >
                    <Users className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="text-[6px] font-black uppercase tracking-tighter">Masters</span>
                  </button>

                  <button 
                    onClick={() => setShowFullProfile(true)}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white border border-white/5 hover:border-white/20 active:scale-95 flex flex-col items-center gap-0.5"
                    title="View Qualifications"
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-[6px] font-black uppercase tracking-tighter">Bio</span>
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white border border-white/5 hover:border-white/20 active:scale-95"
                  >
                    <X className="w-4 h-4" />
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
                    className="absolute inset-0 z-[70] bg-[#0c0c14] flex flex-col font-sans"
                  >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-br from-amber-500/10 to-transparent">
                      <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-amber-500" />
                        <h3 className="text-md font-black text-white uppercase tracking-wider">Expert Credentials</h3>
                      </div>
                      <button 
                        onClick={() => setShowFullProfile(false)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                      {/* Hero Info */}
                      <div className="text-center">
                        <div className="w-28 h-28 mx-auto rounded-[2rem] overflow-hidden border-4 border-amber-500/20 shadow-2xl mb-3 p-0.5 flex items-center justify-center bg-amber-500/5">
                          {avatarErrors[selectedAstrologer.id] ? (
                            <User className="w-12 h-12 text-amber-500" />
                          ) : (
                            <img 
                              src={selectedAstrologer.avatar} 
                              alt={selectedAstrologer.name}
                              className="w-full h-full object-cover rounded-[1.8rem] scale-110"
                              onError={() => setAvatarErrors(prev => ({ ...prev, [selectedAstrologer.id]: true }))}
                            />
                          )}
                        </div>
                        <h4 className="text-xl font-black text-white mb-0.5">{selectedAstrologer.name}</h4>
                        <p className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.25em]">{selectedAstrologer.title}</p>
                      </div>

                      {/* Stats bento */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <h5 className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2">Qualifications</h5>
                          <ul className="space-y-1.5">
                             {selectedAstrologer.qualifications.map((qual, idx) => (
                               <li key={idx} className="flex items-start gap-1.5 text-[11px] text-white leading-tight">
                                 <CheckCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                 {qual}
                               </li>
                             ))}
                          </ul>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                          <h5 className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2">Experience</h5>
                          <div className="space-y-2">
                            <div>
                               <div className="text-lg font-black text-white">{selectedAstrologer.experience}+</div>
                               <div className="text-[9px] text-amber-500 uppercase font-black">Years Practice</div>
                            </div>
                            <div>
                               <div className="text-lg font-black text-white">{selectedAstrologer.consultations}</div>
                               <div className="text-[9px] text-amber-500 uppercase font-black">Readings Done</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expertise Section */}
                      <div className="space-y-3">
                        <h5 className="text-[10px] text-white uppercase font-black tracking-widest flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Specializations
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedAstrologer.specializations.map((spec, idx) => (
                            <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3 items-center">
                              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 flex-shrink-0">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <div>
                                <h6 className="text-white font-bold text-xs tracking-tight leading-none">{spec.title}</h6>
                                <p className="text-[10px] text-gray-500 mt-1 lines-clamp-1 leading-normal">{spec.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Language & Trust */}
                      <div className="p-4 bg-amber-500 rounded-2xl text-black">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-5 h-5" />
                          <h5 className="font-black text-[10px] uppercase tracking-widest leading-none">Verified Spiritual Guide</h5>
                        </div>
                        <p className="text-[11px] font-bold leading-relaxed opacity-80 mb-3">
                          {selectedAstrologer.name} is a verified spiritual counselor on The Vedic Pulse. All consultations follow traditional standards.
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          {selectedAstrologer.languages.map(lang => (
                            <span key={lang} className="px-2.5 py-0.5 bg-black/15 rounded-full text-[9px] font-black uppercase">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border-t border-white/10 shrink-0">
                      <button 
                         onClick={() => setShowFullProfile(false)}
                         className="w-full py-3.5 bg-white/5 text-white font-black rounded-xl border border-white/10 hover:bg-white/10 transition-all text-[11px] uppercase tracking-[0.2em]"
                      >
                        Back to Consultation
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Astrologers Selector Overlay (20 Profiles) */}
              <AnimatePresence>
                {showSelector && (
                  <motion.div
                    initial={{ opacity: 0, x: "100%" }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute inset-0 z-[80] bg-[#0c0c14] flex flex-col font-sans"
                  >
                    <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-br from-[#1c121e] to-[#0c0c14] shrink-0">
                      <div className="flex items-center gap-2.5">
                        <Users className="w-5 h-5 text-amber-500" />
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-wider leading-none">Vedic Masters</h3>
                          <p className="text-[9px] text-amber-500/70 font-semibold uppercase tracking-widest mt-1">20 Verified Sages Available</p>
                        </div>
                      </div>
                      {messages.length > 0 && (
                        <button 
                          onClick={() => setShowSelector(false)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Filters bar */}
                    <div className="flex px-4 py-2.5 gap-1 border-b border-white/5 bg-black/30 overflow-x-auto scrollbar-none shrink-0 m-0">
                      {["All", "Kundli", "Relationship", "Career", "Remedies"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFilter(cat)}
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border whitespace-nowrap transition-all ${
                            filter === cat
                              ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/10"
                              : "text-gray-400 hover:text-white border-white/5 hover:bg-white/5"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Selector List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {filteredAstrologers.map((astro) => (
                        <div 
                          key={astro.id}
                          onClick={() => {
                            setSelectedAstrologer(astro);
                            setShowSelector(false);
                            if (busyAstrologers[astro.id]) {
                              setIsBusyWaiting(true);
                              setIsQueueing(false);
                              setBusyWaitSeconds(busyAstrologers[astro.id].waitMin * 60);
                            } else {
                              setIsBusyWaiting(false);
                              setIsQueueing(true);
                              // Set dynamic randomized queue number
                              setQueuePos(Math.floor(Math.random() * 2) + 2);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-3 relative group ${
                            selectedAstrologer.id === astro.id
                              ? "bg-amber-500/5 border-amber-500/40"
                              : "bg-white/[0.01] border-white/5 hover:border-white/20 hover:bg-white/[0.03]"
                          }`}
                        >
                          {/* Photo + status indicator */}
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 p-0.5 flex items-center justify-center bg-amber-500/5">
                              {avatarErrors[astro.id] ? (
                                <User className="w-6 h-6 text-amber-500" />
                              ) : (
                                <img 
                                  src={astro.avatar} 
                                  alt={astro.name}
                                  className="w-full h-full object-cover rounded-lg scale-110"
                                  onError={() => setAvatarErrors(prev => ({ ...prev, [astro.id]: true }))}
                                />
                              )}
                            </div>
                            {busyAstrologers[astro.id] ? (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-[#09090f] rounded-full animate-pulse shadow" />
                            ) : (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#09090f] rounded-full animate-pulse shadow" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-1 min-w-0">
                                <h4 className="text-[13px] font-black text-white truncate group-hover:text-amber-400 transition-colors">
                                  {astro.name}
                                </h4>
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              </div>
                              {busyAstrologers[astro.id] ? (
                                <span className="shrink-0 px-2 py-0.5 bg-red-500/15 border border-red-500/30 text-red-400 font-extrabold rounded text-[8px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-red-505 animate-ping" />
                                  <span>Busy • {busyAstrologers[astro.id].waitMin}m</span>
                                </span>
                              ) : (
                                <span className="shrink-0 px-2 py-0.5 bg-green-500/15 border border-green-500/30 text-green-400 font-extrabold rounded text-[8px] uppercase tracking-wider flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                  <span>Available</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[8px] text-amber-500/80 font-bold uppercase tracking-widest mt-0.5">
                              {astro.title}
                            </p>

                            <div className="flex items-center gap-1.5 mt-1 text-[9px] text-gray-500 font-semibold">
                              <span className="text-amber-500 font-bold">★ {astro.rating}</span>
                              <span className="text-gray-700">•</span>
                              <span>{astro.experience}+ Yrs Exp</span>
                              <span className="text-gray-700">•</span>
                              <span className="text-gray-400">{astro.consultations} readings</span>
                            </div>

                            <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-1 leading-normal italic">
                              "{astro.summary}"
                            </p>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {astro.specializations.map((spec) => (
                                <span 
                                  key={spec.title}
                                  className="px-1.5 py-0.5 bg-white/5 border border-white/5 text-[8px] text-gray-400 rounded-md font-bold uppercase tracking-wide"
                                >
                                  {spec.title}
                                </span>
                              ))}
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500">
                              <span>Speaks: {astro.languages.join(", ")}</span>
                              {busyAstrologers[astro.id] ? (
                                <span className="text-red-400 group-hover:underline flex items-center gap-0.5 uppercase tracking-widest text-[8px] font-black">
                                  Queue Up ({busyAstrologers[astro.id].waitMin}m wait) &rarr;
                                </span>
                              ) : (
                                <span className="text-amber-500 group-hover:underline flex items-center gap-0.5 uppercase tracking-widest text-[8px] font-black">
                                  Chat Now &rarr;
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Selector cancel footer */}
                    {messages.length > 0 && (
                      <div className="p-4 border-t border-white/10 shrink-0">
                        <button 
                          onClick={() => setShowSelector(false)}
                          className="w-full py-3.5 bg-white/5 text-white font-black rounded-xl border border-white/10 hover:bg-white/10 transition-all text-[11px] uppercase tracking-[0.2em]"
                        >
                          Cancel and Return
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Bar */}
              <div className={`px-5 py-2.5 border-b border-white/5 flex items-center justify-between transition-colors shrink-0 ${
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
                {isBusyWaiting ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    key="busy-waiting-room"
                    className="h-full flex flex-col justify-between py-2 space-y-6 font-sans"
                  >
                    {/* Header profile alert */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5 text-center space-y-3 relative overflow-hidden shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.03] to-amber-500/[0.03]" />
                      <div className="flex items-center justify-center gap-2 text-red-400 font-extrabold text-xs uppercase tracking-widest relative z-10">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span>Live Consultation In Progress</span>
                      </div>
                      <p className="text-[13px] text-gray-300 leading-relaxed max-w-sm mx-auto relative z-10 font-bold">
                        {selectedAstrologer.name} is currently reading planetary charts and performing remedies for another seeker.
                      </p>
                    </div>

                    {/* Central Countdown Timer & Ring */}
                    <div className="flex flex-col items-center justify-center space-y-4 flex-1">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full border border-red-500/10 scale-125 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border border-amber-500/5 scale-150 animate-ping [animation-duration:3s]" />
                        
                        <div className="w-40 h-40 rounded-full bg-gradient-to-b from-[#14121e] to-[#0c0c14] border-2 border-amber-500/20 shadow-2xl shadow-red-500/5 flex flex-col items-center justify-center relative z-10">
                          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Est. Wait</span>
                          <span className="text-3xl font-mono font-black text-amber-500 my-1 animate-pulse">
                            {Math.floor(busyWaitSeconds / 60).toString().padStart(2, '0')}:{(busyWaitSeconds % 60).toString().padStart(2, '0')}
                          </span>
                          <span className="text-[9px] text-red-400/80 font-bold uppercase tracking-wider">Queue Active</span>
                        </div>
                      </div>

                      <div className="text-center space-y-1">
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                          Your priority place in line is locked
                        </p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-[0.15em] font-medium">
                          Do not minimize this window to retain your turn.
                        </p>
                      </div>
                    </div>

                    {/* Spiritual Breathing Focus Box */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-4 relative overflow-hidden shrink-0">
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                      
                      <div className="flex items-center gap-2 text-[11px] text-amber-500 uppercase font-black tracking-widest">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        <span>Cosmic Alignment Ritual</span>
                      </div>
                      
                      <p className="text-[11px] text-gray-400 leading-normal">
                        Vedic guides recommend calming your mind. Synchronize your breathing to align your energies for an highly accurate session.
                      </p>

                      {/* Animated breath controller */}
                      <div className="flex flex-col items-center py-2">
                        {(() => {
                          const cycleSec = Math.floor(currentTime / 1000) % 10;
                          let breathState = "Breathe In";
                          let breathPulse = 1;
                          
                          if (cycleSec < 4) {
                            breathState = "Breathe In (Soham)";
                            breathPulse = 1 + (cycleSec / 4) * 0.3; // 1 to 1.3
                          } else if (cycleSec < 6) {
                            breathState = "Hold Cosmic Aura";
                            breathPulse = 1.3;
                          } else {
                            breathState = "Breathe Out (Shivoham)";
                            breathPulse = 1.3 - ((cycleSec - 6) / 4) * 0.3; // 1.3 to 1
                          }
                          return (
                            <>
                              <div className="h-32 flex items-center justify-center">
                                <motion.div
                                  animate={{
                                    scale: breathPulse,
                                  }}
                                  transition={{
                                    duration: 0.5,
                                    ease: "easeInOut"
                                  }}
                                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500/10 via-amber-500/20 to-amber-500/5 border border-amber-500/30 flex flex-col items-center justify-center text-center shadow-lg shadow-amber-500/5"
                                >
                                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest max-w-[80px] leading-tight">
                                    {cycleSec < 4 ? "Inhale" : cycleSec < 6 ? "Hold" : "Exhale"}
                                  </span>
                                  <span className="text-[7px] text-gray-500 font-bold uppercase tracking-tighter mt-1">
                                    {cycleSec < 4 ? "Soham" : cycleSec < 6 ? "Peace" : "Shivoham"}
                                  </span>
                                </motion.div>
                              </div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] text-center mt-2">
                                {breathState}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Switch / Exit buttons footer */}
                    <div className="space-y-3 pt-3 border-t border-white/5 shrink-0">
                      <button 
                        onClick={() => setShowSelector(true)}
                        className="w-full py-3.5 bg-amber-500 text-black font-black rounded-2xl flex items-center justify-center gap-2 uppercase text-[11px] tracking-[0.15em] hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                      >
                        <Users className="w-4 h-4" />
                        Choose Another Available Guru
                      </button>
                      <p className="text-[9px] text-gray-600 text-center uppercase tracking-[0.2em] font-bold">
                        17 other verified guides are online & available right now
                      </p>
                    </div>
                  </motion.div>
                ) : isQueueing ? (
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
                        <h4 className="text-lg font-black text-white tracking-tight italic">{selectedAstrologer.name} is preparing...</h4>
                        <p className="text-xs text-gray-400 font-medium px-4">
                          Connecting your energy coordinates with the cosmic alignment.
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
                        
                        <div className="mt-2 text-[8px] text-gray-600 uppercase font-black tracking-[0.2em] whitespace-nowrap overflow-hidden">
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
                    {/* Choose Guide Alert Banner before chat starts */}
                    {!messages.some(m => m.role === "user") && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 mb-6 text-center space-y-3 font-sans relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.03] to-purple-500/[0.03]" />
                        <div className="flex items-center justify-center gap-2 text-amber-500 font-extrabold text-xs uppercase tracking-widest relative z-10">
                          <Sparkles className="w-4 h-4 animate-pulse" />
                          <span>Select Your Preferred Astrologer</span>
                        </div>
                        <p className="text-[12px] text-gray-300 leading-relaxed max-w-sm mx-auto relative z-10">
                          Choose from our predefined list of 20 verified Vedic Astrologers specializing in Kundli, MATCHMAKING, Career, and Remedies before beginning your chat.
                        </p>
                        <div className="pt-1 relative z-10">
                          <button
                            onClick={() => setShowSelector(true)}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
                          >
                            <Users className="w-4 h-4" />
                            Choose Your Personal Guide
                          </button>
                        </div>
                      </div>
                    )}

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
                        <div className="relative group mx-auto sm:mx-0 shrink-0">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-xl relative z-10 flex items-center justify-center bg-amber-500/5">
                            {avatarErrors[selectedAstrologer.id] ? (
                              <User className="w-12 h-12 text-amber-500" />
                            ) : (
                              <img 
                                src={selectedAstrologer.avatar} 
                                alt={selectedAstrologer.name}
                                className="w-full h-full object-cover rounded-xl scale-110 group-hover:scale-115 transition-transform duration-700"
                                onError={() => setAvatarErrors(prev => ({ ...prev, [selectedAstrologer.id]: true }))}
                              />
                            )}
                          </div>
                          <div className="absolute -inset-2 bg-amber-500/10 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left pt-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h4 className="text-white font-black text-2xl tracking-tight leading-none">{selectedAstrologer.name}</h4>
                            <ShieldCheck className="w-5 h-5 text-amber-500 hidden sm:block shrink-0" />
                          </div>
                          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] mb-4">{selectedAstrologer.title}</p>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                              <div className="text-amber-500/70 text-[9px] uppercase font-black mb-0.5 whitespace-nowrap">Rating</div>
                              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                                <span className="text-white font-bold text-sm">{selectedAstrologer.rating}/5</span>
                                <div className="flex">
                                  {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />)}
                                </div>
                              </div>
                            </div>
                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                              <div className="text-amber-500/70 text-[9px] uppercase font-black mb-0.5 whitespace-nowrap">Experience</div>
                              <div className="text-white font-bold text-sm">{selectedAstrologer.experience}+ Years</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-5 border-t border-white/10 bg-white/[0.02] space-y-5">
                        <p className="text-[13px] text-gray-300 leading-relaxed font-medium italic relative pl-6">
                          <span className="text-3xl text-amber-500 absolute -top-1 -left-1 opacity-20 serif leading-none">"</span>
                          {selectedAstrologer.summary}
                        </p>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-2 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-amber-500 font-black text-xs">{selectedAstrologer.consultations}</div>
                            <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Consultations</div>
                          </div>
                          <div className="text-center p-2 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-amber-500 font-black text-xs">Vedic</div>
                            <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Lineage</div>
                          </div>
                          <div className="text-center p-2 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-amber-500 font-black text-xs">Ph.D</div>
                            <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Verified</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                             <Zap className="w-3 h-3 text-amber-500" /> Key Specializations
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedAstrologer.specializations.map(item => (
                              <div key={item.title} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-full text-[11px] text-amber-500 font-bold border border-amber-500/20 whitespace-nowrap">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                {item.title}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Certified Vedic Expert</span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            Language: <span className="text-gray-300">{selectedAstrologer.languages.join(", ")}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[88%] rounded-3xl px-5 py-4 text-[14px] leading-relaxed shadow-lg ${
                          msg.role === "user" 
                            ? "bg-amber-500 text-black font-semibold rounded-br-none" 
                            : "bg-white/[0.05] border border-white/10 text-white rounded-bl-none backdrop-blur-md animate-fade-in"
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
                  className="px-6 py-6 bg-gradient-to-b from-[#1a1a2e] to-[#0c0c14] border-t border-amber-500/30 mx-4 mb-4 rounded-3xl text-center space-y-5 shadow-2xl relative overflow-hidden shrink-0 font-sans"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

                  <div className="flex justify-center relative">
                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-600 to-amber-300 text-black rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/40 ring-4 ring-amber-500/20">
                      <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-1 relative">
                    <h4 className="text-xl font-black text-white tracking-tight">Cosmic Guidance Awaits</h4>
                    <p className="text-xs text-gray-400 px-4 leading-relaxed font-medium">
                      {selectedAstrologer.name} is ready to read your destiny charts. Unlock direct access.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 relative">
                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                      <div className="flex items-baseline gap-1.5 justify-center">
                        <div className="text-amber-500 font-black text-xl">₹{PRICE_INR}</div>
                        <div className="text-xs text-gray-500 line-through font-bold opacity-50">₹75</div>
                      </div>
                      <div className="text-[8px] text-emerald-500 uppercase font-black tracking-widest mt-1">Limited Time Offer!</div>
                    </div>
                    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                      <div className="text-white font-black text-xl">5 <span className="text-xs">min</span></div>
                      <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-1">Full Consultation</div>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    className="w-full py-4.5 bg-amber-500 text-black font-black rounded-xl hover:bg-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase text-[11px] tracking-[0.2em] shadow-[0_0_40px_rgba(245,158,11,0.3)] relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <CreditCard className="w-4 h-4" />
                    Unlock Live Session
                  </button>
                  
                  <div className="flex items-center justify-center gap-6 pt-1 text-gray-500">
                    <div className="flex items-center gap-1.5 grayscale opacity-50">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-bold uppercase tracking-tighter">Verified</span>
                    </div>
                    <div className="flex items-center gap-1.5 grayscale opacity-50">
                       <Lock className="w-3.5 h-3.5 text-green-500" />
                       <span className="text-[8px] font-bold uppercase tracking-tighter">Razorpay Protection</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Input Area */}
              {!isPaymentRequired && !isQueueing && !isBusyWaiting && (
                <div className="p-5 border-t border-white/10 bg-[#0c0c14] relative shrink-0">
                  <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="relative flex items-center gap-3">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={`Ask ${selectedAstrologer.name.split(" ").slice(-1)[0]} a question...`}
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-[14px] text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-all focus:ring-4 focus:ring-amber-500/5"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() || isTyping}
                      className="p-4 bg-amber-500 text-black rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] group shrink-0"
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
