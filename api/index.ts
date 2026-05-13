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

// Razorpay instance
const razorpay = new RazorpayConstructor({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

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

    const order = await razorpay.orders.create(options);
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
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    res.status(500).json({ error: "Internal server error during verification" });
  }
});

// Since this is for Vercel, we export the app
export default app;
