import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";
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