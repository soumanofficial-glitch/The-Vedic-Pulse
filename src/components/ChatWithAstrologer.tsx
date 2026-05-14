import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, User, Sparkles, Clock, Lock, CreditCard, ChevronDown, Award, ShieldCheck, Users, Star } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
// Using a high-quality clip art character illustration of an elderly Indian man for the astrologer
const astrologerImg = "https://img.freepik.com/free-vector/portrait-wise-old-man-with-turban_23-2148761141.jpg?t=st=1715707531~exp=1715711131~hmac=a4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Message {
  id: string;
  role: "user" | "astrologer";
  text: string;
  timestamp: number;
}

const FREE_MESSAGE_LIMIT = 3;
const SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const PRICE_INR = 39;

export const ChatWithAstrologer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isQueueing, setIsQueueing] = useState(false);
  const [queuePos, setQueuePos] = useState(2);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    const savedMsgCount = localStorage.getItem("chat_msg_count");
    if (savedMsgCount) setMessageCount(parseInt(savedMsgCount));

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
      const timer1 = setTimeout(() => setQueuePos(1), 2500);
      const timer2 = setTimeout(() => setIsQueueing(false), 5500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isQueueing]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("chat_msg_count", messageCount.toString());
    if (sessionExpiry) {
      localStorage.setItem("chat_session_expiry", sessionExpiry.toString());
    }
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messageCount, sessionExpiry, messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isQueueing]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Check if session is valid or if we have free messages
    const now = Date.now();
    const hasActiveSession = sessionExpiry && sessionExpiry > now;
    const hasFreeMessages = messageCount < FREE_MESSAGE_LIMIT;

    if (!hasActiveSession && !hasFreeMessages) {
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
    setMessageCount(prev => prev + 1);
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

      const history = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction,
        },
        history,
      });

      const result = await chat.sendMessage({ message: inputText });
      const responseText = result.text || "The stars are silent right now. Please try again later.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "astrologer",
        text: responseText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: "error",
        role: "astrologer",
        text: "The cosmic signals are a bit weak right now. Please try asking again in a moment.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionExpiry && sessionExpiry > Date.now()) {
      timer = setInterval(() => {
        if (Date.now() >= sessionExpiry) {
          setSessionExpiry(null);
          setIsPaymentRequired(true);
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionExpiry]);

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

  const timeLeft = sessionExpiry ? Math.max(0, Math.floor((sessionExpiry - Date.now()) / 1000)) : 0;
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
           Chat with an Astrologer (3 FREE)
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
                      <div className="w-full h-full rounded-full overflow-hidden border border-[#0c0c14]">
                        <img 
                          src={astrologerImg} 
                          alt="Acharya Shivanand"
                          className="w-full h-full object-cover scale-110"
                        />
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
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-3 hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white border border-white/5 hover:border-white/20 active:scale-95"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

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
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{Math.max(0, FREE_MESSAGE_LIMIT - messageCount)} Free Messages Available</span>
                    </>
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
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-black text-amber-500">#{queuePos}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-white">Connecting to Astrologer...</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Acharya Shivanand is currently finishing a live consultation. You are next in queue.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                      <div className="flex flex-col items-center gap-1">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Secure</span>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="flex flex-col items-center gap-1">
                        <Users className="w-5 h-5 text-amber-500" />
                        <span className="text-[9px] text-gray-500 uppercase font-bold">1.2k+ Active</span>
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
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                         <Sparkles className="w-16 h-16 text-amber-500" />
                      </div>
                      <div className="bg-gradient-to-r from-amber-500/20 via-transparent to-transparent p-5 flex gap-5">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500/30 flex-shrink-0 shadow-xl group">
                          <img 
                            src={astrologerImg} 
                            alt="Acharya Shivanand"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className="text-white font-black text-xl tracking-tight">Acharya Shivanand</h4>
                          <p className="text-[11px] text-amber-500 uppercase font-black tracking-widest mt-1">Vedanta Sahitya Acharya</p>
                          <div className="flex items-center gap-4 mt-3">
                             <div className="flex items-center gap-1.5">
                               <div className="flex">
                                 {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />)}
                               </div>
                               <span className="text-[11px] text-white font-bold">4.9/5</span>
                             </div>
                             <div className="w-px h-3 bg-white/20" />
                             <div className="text-[11px] text-gray-300 font-bold uppercase tracking-tighter">18+ Years Exp.</div>
                          </div>
                        </div>
                      </div>
                      <div className="px-5 py-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
                        <p className="text-[12px] text-gray-400 leading-relaxed font-medium italic relative">
                          <span className="text-2xl text-amber-500/20 absolute -top-2 -left-2 overflow-hidden leading-none">"</span>
                          Guiding souls towards their dharma through the precise movement of planets. Trust the stars, for they never lie.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {["Nadi Jyotish", "Vedic Remedy", "Marriage Expert", "Career Guide"].map(tag => (
                            <span key={tag} className="px-3 py-1 bg-amber-500/10 rounded-lg text-[10px] text-amber-500 font-bold border border-amber-500/10 uppercase tracking-tight">
                              {tag}
                            </span>
                          ))}
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
                      <div className="text-amber-500 font-black text-2xl">₹39</div>
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Special Dakshina</div>
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
