import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, User, Sparkles, Clock, Lock, CreditCard, ChevronDown } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load state from localStorage
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-astrologer-chat", handleOpenChat);

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
      // Initial greeting
      setMessages([
        {
          id: "welcome",
          role: "astrologer",
          text: "Pranam! I am Acharya Shivanand. I am here to guide you through the celestial alignments of your life. You can ask me anything about your career, health, relationships, or future in English, Hindi, or Hinglish. How can the stars help you today?",
          timestamp: Date.now(),
        }
      ]);
    }
    return () => {
      window.removeEventListener("open-astrologer-chat", handleOpenChat);
    };
  }, []);

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
  }, [messages, isTyping]);

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
        You are a highly experienced Vedic Astrologer named 'Acharya Shivanand'. 
        Your tone is wise, empathetic, calm, and traditional yet practical.
        You communicate like a real human astrologer, showing genuine care for the user's concerns.
        You can communicate in English, Hindi, or Hinglish (Hindi written in English script) based on the user's preference.
        
        Guidelines for your personality:
        - Start by greeting the user warmly (e.g., "Pranam", "Namaste", "Blessings").
        - Use traditional Vedic concepts naturally: Karma, Dharma, Grahas (Planets), Dashas, and Yogas.
        - If someone is worried, reassure them that planetary movements are temporary and life is a series of cycles.
        - Provide remedies like specific mantras, acts of charity (daan), or gemstone suggestions if appropriate.
        - Be concise but profound. Do not sound like a robot or a generic AI.
        - Always frame challenges as opportunities for growth and caution rather than inevitable disasters.
        - Never give definitive medical or legal advice; suggest professionals for those while providing spiritual context.
        - If the user uses Hinglish, you respond in Hinglish or English as per the flow.
        
        Context: You are the lead astrologer for 'The Vedic Pulse', a trusted platform for millions.
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
        name: "VedicAI Chat",
        description: "5 Minutes Astrologer Chat Session",
        order_id: order.id,
        handler: async (response: any) => {
          // Verify on backend
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              amount: PRICE_INR * 100, // Pass amount for tracking
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

  const clearChat = () => {
    if (window.confirm("Do you want to clear your chat history?")) {
      setMessages([{
        id: "welcome",
        role: "astrologer",
        text: "Pranam! I am Acharya Shivanand. I am here to guide you through the celestial alignments of your life. How can the stars help you today?",
        timestamp: Date.now(),
      }]);
      setMessageCount(0);
      setSessionExpiry(null);
      setIsPaymentRequired(false);
      localStorage.removeItem("chat_msg_count");
      localStorage.removeItem("chat_session_expiry");
      localStorage.removeItem("chat_messages");
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
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

      {/* Chat Sidebar/Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
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
              className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-[#0c0c14] border-l border-white/10 z-[60] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-bottom border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Acharya Shivanand</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-gray-400">Consulting Live</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status Bar */}
              <div className="px-4 py-2 bg-amber-500/10 border-bottom border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  {sessionExpiry && sessionExpiry > Date.now() ? (
                    <>
                      <Clock className="w-3 h-3" />
                      <span>Session: {minutes}:{seconds.toString().padStart(2, '0')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>{Math.max(0, FREE_MESSAGE_LIMIT - messageCount)} Free Chats Left</span>
                    </>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
              >
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user" 
                        ? "bg-amber-500 text-black font-medium" 
                        : "bg-white/5 border border-white/10 text-white"
                    }`}>
                      {msg.text}
                      <div className={`text-[10px] mt-1 opacity-50 ${msg.role === "user" ? "text-black" : "text-gray-400"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Required Overlay */}
              {isPaymentRequired && (
                <div className="px-4 py-6 bg-amber-500/10 border-t border-amber-500/20 m-4 rounded-2xl text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-amber-500 text-black rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-bold">Free Limit Reached</h4>
                    <p className="text-xs text-gray-400 px-4">Continue your session for 5 minutes of premium guidance.</p>
                  </div>
                  <button
                    onClick={handlePayment}
                    className="w-full py-3 bg-amber-500 text-black font-black rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay ₹{PRICE_INR} to Continue
                  </button>
                </div>
              )}

              {/* Input Area */}
              {!isPaymentRequired && (
                <div className="p-4 border-t border-white/10 bg-[#0c0c14]">
                  <div className="relative flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Ask anything..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() || isTyping}
                      className="p-3 bg-amber-500 text-black rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
