import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import Razorpay from "razorpay";
import crypto from "crypto";

// Handle potential ESM/CJS default import discrepancies
const RazorpayConstructor = (Razorpay as any).default || Razorpay;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("[SERVER] Initializing server.ts...");

async function startServer() {
  const app = express();
  const PORT = 3000;

  // IMPORTANT: Middleware order matters
  app.use(cors());
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Razorpay instance
  const razorpay = new RazorpayConstructor({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });

  // Meta CAPI Helper
  const hash = (val: any) => {
    if (!val) return null;
    const clean = String(val).trim().toLowerCase();
    // Return SHA256 hashed value as recommended by Meta
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
      // Process user data - hash sensitive info if raw values are provided
      const processedUserData: any = {
        client_ip_address: req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        client_user_agent: req.headers["user-agent"],
        fbc: getFBCookie(req, "_fbc"),
        fbp: getFBCookie(req, "_fbp"),
      };

      // Fields that MUST be hashed according to Meta CAPI
      const fieldsToHash = ["em", "ph", "fn", "ln", "ge", "db", "ct", "st", "zp", "country", "external_id"];
      
      // Copy other fields from userData and hash if needed
      Object.keys(userData).forEach(key => {
        const val = userData[key];
        if (!val) return;

        if (fieldsToHash.includes(key)) {
          // If it's already an array, hash each element
          if (Array.isArray(val)) {
            processedUserData[key] = val.map(v => {
              const s = String(v);
              // Avoid double hashing if it looks like a SHA256
              return (s.length === 64 && /^[0-9a-f]+$/i.test(s)) ? s : hash(s);
            });
          } else {
            const s = String(val);
            // Avoid double hashing
            const hashedVal = (s.length === 64 && /^[0-9a-f]+$/i.test(s)) ? s : hash(s);
            processedUserData[key] = [hashedVal];
          }
        } else {
          // Pass through non-hashed fields (like client_ip_address, fbp, etc. if provided in userData)
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
      if (!response.ok) {
        console.error("[META] API Error Response:", result);
      }
    } catch (error) {
      console.error("[META] Request failed:", error);
    }
  };

  // Generic Tracking Endpoint
  app.post("/api/track", async (req, res) => {
    const { eventName, userData = {}, customData = {} } = req.body;
    if (!eventName) {
      return res.status(400).json({ error: "eventName is required" });
    }
    
    // We run tracking in background to not block response
    sendMetaEvent(eventName, userData, customData, req);
    res.json({ status: "queued" });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Debug route
  app.get("/api/debug", (req, res) => {
    const key = process.env.RAZORPAY_KEY_ID || "";
    res.json({ 
      message: "Payment API routes are registered",
      env: process.env.NODE_ENV,
      keyHint: key ? `${key.substring(0, 8)}...` : "missing"
    });
  });

  // Create Razorpay Order
  app.all("/api/create-order", async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed. Use POST." });
    }
    try {
      const { amount, currency = "INR" } = req.body;
      
      console.log(`[PAYMENT] Creating order for amount: ${amount}`);

      if (!amount || amount < 100) {
        return res.status(400).json({ error: "Amount must be at least 100 paise" });
      }

      const options = {
        amount: Math.round(amount), // amount in paise
        currency,
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("[PAYMENT] Create Order Error:", error);
      res.status(500).json({ error: "Failed to create Razorpay order", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Verify Razorpay Signature
  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userData = {} } = req.body;
      
      console.log(`[PAYMENT] Verifying payment for order: ${razorpay_order_id}`);

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: "Missing required payment fields" });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return res.status(500).json({ error: "Razorpay secret not configured" });
      }

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        // Meta Conversions API (CAPI) Tracking
        sendMetaEvent("Purchase", userData, {
          currency: "INR",
          value: 9, // Updated price from previous turn
          order_id: razorpay_order_id,
        }, req);

        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, message: "Invalid signature" });
      }
    } catch (error) {
      console.error("Razorpay Verification Error:", error);
      res.status(500).json({ error: "Internal server error during verification" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
