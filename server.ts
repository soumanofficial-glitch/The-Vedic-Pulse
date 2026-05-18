import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import Razorpay from "razorpay";
import crypto from "crypto";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Handle potential ESM/CJS default import discrepancies
const RazorpayConstructor = (Razorpay as any).default || Razorpay;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini - Using the official @google/generative-ai SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

console.log("[SERVER] Starting server initialization...");

async function startServer() {
  const app = express();
  const PORT = 3000;

  // IMPORTANT: Middleware order matters
  app.use(cors());
  app.use(express.json());

  // Request logging middleware - helpful for debugging 404s
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });

  // Razorpay instance
  let razorpay: any = null;
  try {
    const rzpKeyId = process.env.RAZORPAY_KEY_ID || "";
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET || "";
    
    if (rzpKeyId && rzpSecret) {
      razorpay = new RazorpayConstructor({
        key_id: rzpKeyId,
        key_secret: rzpSecret,
      });
      console.log("[SERVER] Razorpay initialized");
    } else {
      console.warn("[SERVER] Razorpay credentials missing from environment");
    }
  } catch (err) {
    console.error("[SERVER] Razorpay initialization failed:", err);
  }

  // Meta CAPI Helper
  const hash = (val: any) => {
    if (!val) return null;
    const clean = String(val).trim().toLowerCase();
    return crypto.createHash("sha256").update(clean).digest("hex");
  };

  const getFBCookie = (req: express.Request, name: string) => {
    const cookies = req.headers.cookie || "";
    const match = cookies.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
  };

  const sendMetaEvent = async (eventName: string, userData: any, customData: any = {}, req: express.Request) => {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      console.warn("[META] Pixel ID or Access Token missing. Skipping event:", eventName);
      return;
    }

    try {
      const processedUserData: any = {
        client_ip_address: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        client_user_agent: req.headers["user-agent"],
        fbc: getFBCookie(req, "_fbc"),
        fbp: getFBCookie(req, "_fbp"),
      };

      const fieldsToHash = ["em", "ph", "fn", "ln", "ge", "db", "ct", "st", "zp", "country", "external_id"];
      
      Object.keys(userData).forEach(key => {
        const val = userData[key];
        if (!val) return;
        if (fieldsToHash.includes(key)) {
          if (Array.isArray(val)) {
            processedUserData[key] = val.map(v => {
              const s = String(v);
              return (s.length === 64 && /^[0-9a-f]+$/i.test(s)) ? s : hash(s);
            });
          } else {
            const s = String(val);
            const hashedVal = (s.length === 64 && /^[0-9a-f]+$/i.test(s)) ? s : hash(s);
            processedUserData[key] = [hashedVal];
          }
        } else {
          processedUserData[key] = val;
        }
      });

      const payload = {
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
          user_data: processedUserData,
          custom_data: customData,
        }],
      };

      console.log(`[META] Sending event: ${eventName}`);

      const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) console.error("[META] API Error Response:", result);
    } catch (error) {
      console.error("[META] Request failed:", error);
    }
  };

  // API Routes directly on app to avoid router nesting issues
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", node_env: process.env.NODE_ENV });
  });

  // Gemini Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    console.log(`[SERVER] Handling POST /api/chat`);
    try {
      const { contents, systemInstruction } = req.body;
      
      if (!contents || !Array.isArray(contents)) {
        console.error("[SERVER] Invalid contents:", contents);
        return res.status(400).json({ error: "Invalid contents provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("[GEMINI] Missing GEMINI_API_KEY in environment");
        return res.status(500).json({ error: "Gemini API key not configured in AI Studio Secrets." });
      }

      console.log("[GEMINI] Generating content with model: gemini-1.5-flash");
      
      // Initialize the model inside the handler to ensure it uses the latest env vars
      const genAIClient = new GoogleGenerativeAI(apiKey);
      const model = genAIClient.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction || "You are a helpful assistant."
      });

      // Format contents for @google/generative-ai
      const history = contents.slice(0, -1).map(c => ({
        role: c.role === "model" ? "model" : "user",
        parts: [{ text: c.parts[0].text }]
      }));
      
      const lastMessage = contents[contents.length - 1].parts[0].text;

      const chat = model.startChat({
        history,
        generationConfig: {
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(lastMessage);
      const geminiResponse = await result.response;
      const text = geminiResponse.text();

      res.json({ text });
    } catch (error: any) {
      console.error("[GEMINI] Chat Error:", error);
      res.status(500).json({ 
        error: "Failed to generate content", 
        details: error.message || String(error) 
      });
    }
  });

  // Razorpay Order Creation
  app.post("/api/create-order", async (req, res) => {
    console.log("[SERVER] Handling POST /api/create-order");
    try {
      const { amount, currency = "INR" } = req.body;
      if (!razorpay) return res.status(500).json({ error: "Razorpay not initialized." });

      const options = {
        amount: Math.round(amount),
        currency,
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("[PAYMENT] Order Error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Razorpay Payment Verification
  app.post("/api/verify-payment", async (req, res) => {
    console.log("[SERVER] Handling POST /api/verify-payment");
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) return res.status(500).json({ error: "Missing secret" });

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        const { userData = {}, amount = 4900 } = req.body;
        const purchaseValue = Math.round(amount / 100);
        sendMetaEvent("Purchase", userData, {
          currency: "INR",
          value: purchaseValue,
          order_id: razorpay_order_id,
        }, req);
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false });
      }
    } catch (error) {
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Generic Tracking Endpoint
  app.post("/api/track", (req, res) => {
    const { eventName, userData = {}, customData = {} } = req.body;
    if (!eventName) return res.status(400).json({ error: "eventName is required" });
    sendMetaEvent(eventName, userData, customData, req);
    res.json({ status: "queued" });
  });

  // Serve static files or Vite middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[SERVER] Running in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Final catch-all for anything missed (not index.html or /api)
  app.use((req, res) => {
    console.warn(`[SERVER 404] No route matched for ${req.method} ${req.url}`);
    res.status(404).send("Reality not found");
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[SERVER] Startup failed:", err);
});

