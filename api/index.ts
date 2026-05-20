import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import Razorpay from "razorpay";
import crypto from "crypto";

// Handle potential ESM/CJS default import discrepancies
const RazorpayConstructor = (Razorpay as any).default || Razorpay;

const app = express();

app.use(express.json());
app.use(cors());

// Lazy-loaded Razorpay helper to prevent startup crash if keys are missing
let razorpayInstance: any = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are missing.");
    }
    razorpayInstance = new RazorpayConstructor({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
};

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Payment API Routes (Vercel)
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    if (!amount || amount < 100) {
      return res.status(400).json({ error: "Amount must be at least 100 paise" });
    }

    const options = {
      amount: Math.round(amount),
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await getRazorpay().orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ error: "Failed to create Razorpay order", details: error instanceof Error ? error.message : String(error) });
  }
});

app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
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
      // Optional: Meta Conversions API (CAPI) Tracking
      const pixelId = process.env.META_PIXEL_ID;
      const accessToken = process.env.META_ACCESS_TOKEN;
      
      if (pixelId && accessToken) {
        try {
          // Fire and forget (don't block the response)
          fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: [{
                event_name: 'Purchase',
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                user_data: {
                  client_ip_address: req.ip,
                  client_user_agent: req.headers['user-agent'],
                },
                custom_data: {
                  currency: 'INR',
                  value: 99, // Adjust standard value if needed or pass in body
                  order_id: razorpay_order_id,
                },
              }],
            }),
          }).catch(err => console.error("Meta CAPI Error:", err));
        } catch (e) {
          console.error("Meta CAPI trigger error:", e);
        }
      }

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    res.status(500).json({ error: "Internal server error during verification" });
  }
});

// Chat API Route (Vercel)
app.post("/api/chat", async (req, res) => {
  try {
    const { contents, systemInstruction } = req.body;
    
    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: "contents is required and must be an array" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[CHAT] Missing GEMINI_API_KEY");
      return res.status(500).json({ 
        error: "Gemini API key is not configured.",
        details: "Please add GEMINI_API_KEY to your environment variables." 
      });
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    res.json({ text: result.text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ 
      error: "Failed to generate AI response", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Since this is for Vercel, we export the app
export default app;
