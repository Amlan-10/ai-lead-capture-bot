const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.NVIDIA_API_KEY;

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const systemPrompt = `You are an AI lead qualification assistant for a digital marketing agency.

Your job is to talk to potential clients and collect the following details step by step:
1. What service they need (SEO, Ads, Social Media, Website, etc.)
2. Their business website or industry
3. Their monthly marketing budget
4. Their name
5. Their email address

Rules:
- Ask one question at a time.
- Be friendly and professional.
- If the user goes off-topic, gently guide them back to sharing their project details.
- When all details are collected, say:
"Thank you! Our team will review your information and contact you soon."`;

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "meta/llama-3-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await response.json();
    console.log("NVIDIA RESPONSE:", JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0) {
      res.json({ reply: data.choices[0].message.content });
    } else if (data.error) {
      res.status(500).json({ reply: "AI Error: " + data.error.message });
    } else {
      res.status(500).json({ reply: "Unexpected AI response format." });
    }

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ reply: "Server error while contacting AI." });
  }
});

app.listen(3000, () => console.log("Lead bot server running on port 3000"));
