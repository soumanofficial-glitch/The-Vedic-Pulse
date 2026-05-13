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

  // Health check
  app.get("/pay-api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Debug route
  app.get("/pay-api/debug", (req, res) => {
    const key = process.env.RAZORPAY_KEY_ID || "";
    res.json({ 
      message: "Payment API routes are registered",
      env: process.env.NODE_ENV,
      keyHint: key ? `${key.substring(0, 8)}...` : "missing"
    });
  });

  // Create Razorpay Order
  app.all("/pay-api/create-order", async (req, res) => {
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
  app.post("/pay-api/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
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
