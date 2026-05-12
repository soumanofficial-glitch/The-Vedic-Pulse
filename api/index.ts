import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Since this is for Vercel, we export the app
export default app;
