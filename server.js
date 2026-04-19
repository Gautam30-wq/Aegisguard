import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { Firewall } from "./firewall/Firewall.js";
import { RegexScanner } from "./firewall/scanners/RegexScanner.js";
import { LLMScanner } from "./firewall/scanners/LLMScanner.js";
import { createFirewallMiddleware } from "./firewall/middleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── FIREWALL ──
const firewallInstance = new Firewall()
  .use(new RegexScanner())
  .use(new LLMScanner());

const firewallMiddleware = createFirewallMiddleware(firewallInstance);


// ── GEMINI CALL ──
async function callLLM(text) {
  try {
    console.log("👉 Sending to Gemini:", text);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(text);

    console.log("👉 Gemini raw result received");

    const response = await result.response;

    const output = response.text();

    console.log("✅ Gemini output OK");

    return output;

  } catch (err) {
    console.log("🔥 GEMINI ERROR FULL:");
    console.dir(err, { depth: null });

    return `GEMINI ERROR: ${err?.message || "unknown"}`;
  }
}

// ── ROUTE ──
app.post("/api/chat", firewallMiddleware, async (req, res) => {
  try {
    const userInput = req.body.message; // already sanitized if suspicious
    
    console.log("🤖 Calling AI with input:", userInput);

    const reply = await callLLM(userInput);

    console.log("✅ AI RESPONSE:", reply);

    return res.json({
      reply,
      risk: req.body.firewallScore,
      blocked: false,
      sanitized: req.body.wasSanitized,
      sanitizedPrompt: req.body.sanitizedPrompt
    });

  } catch (err) {
    console.error("💥 BACKEND CRASH DETECTED:");
    console.error(err); // THIS is what you're missing

    return res.status(500).json({
      error: err.message || "Unknown error",
      stack: err.stack
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
  console.log("🔑 Gemini Key:", process.env.GEMINI_API_KEY ? "LOADED" : "MISSING");
});