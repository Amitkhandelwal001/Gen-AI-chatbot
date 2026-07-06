import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

import { SYSTEM_PROMPT as HITESH_SYSTEM_PROMPT } from "./chatbot/hiteshsir.js";
import { SYSTEM_PROMPT as PIYUSH_SYSTEM_PROMPT } from "./chatbot/piyushsir.js";

const app = express();
const PORT = 3000;

// -----------------------------
// OpenAI Client
// -----------------------------

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// -----------------------------
// MongoDB Connection & Schema
// -----------------------------

const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));
} else {
  console.log("⚠️ MONGO_URI is missing in .env. Authentication will fail.");
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// -----------------------------
// Middleware
// -----------------------------

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Frontend
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------
// Store Conversations
// -----------------------------

const conversations = {
  hitesh: [
    {
      role: "system",
      content: HITESH_SYSTEM_PROMPT,
    },
  ],

  piyush: [
    {
      role: "system",
      content: PIYUSH_SYSTEM_PROMPT,
    },
  ],
};

// -----------------------------
// Chat API
// -----------------------------

app.post("/chat", async (req, res) => {
  try {
    const { mentor, message } = req.body;

    const history =
      mentor === "piyush"
        ? conversations.piyush
        : conversations.hitesh;

    // Add user message
    history.push({
      role: "user",
      content: message,
    });

    // Only ONE API Call
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: history,
      response_format: {
        type: "json_object",
      },
    });

    const result = response.choices[0].message.content;
    const parsed = JSON.parse(result);

    // Save assistant response
    history.push({
      role: "assistant",
      content: result,
    });

    res.json({
      success: true,
      reply: parsed.text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      reply: "Something went wrong.",
    });
  }
});

// -----------------------------
// Auth API
// -----------------------------

app.post("/api/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: "Missing fields" });
    
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ success: false, message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: "Account created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: "Missing fields" });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    res.json({ success: true, token: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -----------------------------
// Start Server
// -----------------------------

app.listen(PORT, () => {

  console.log(`
====================================

🚀 PERSONA AI Running

http://localhost:${PORT}

====================================
`);

});