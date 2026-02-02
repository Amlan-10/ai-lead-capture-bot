const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.NVIDIA_API_KEY;

app.post("/chat", async (req, res) => {
  const { message, botType } = req.body;

  let systemPrompt = "";

  if (botType === "lead") {
    systemPrompt = `You are an AI lead qualification assistant for a digital marketing agency.

Your job is to talk to potential clients and collect the following details step by step:
1. What service they need (SEO, Ads, Social Media, Website, etc.)
2. Their business website or industry
3. Their monthly marketing budget
4. Their name
5. Their email address

Rules:
- Ask one question at a time.
- Be friendly and professional.
- If the user goes off-topic, gently guide back to collecting lead info.
- When all info is collected, say:
"Thank you! Our team will contact you soon."`;
  } else if(botType === "support"){
    // Default = Customer Support Bot
    systemPrompt = `You are a customer support assistant for Sunrise Bistro restaurant in New York.

BUSINESS INFORMATION:
- Opening Hours: 9 AM – 10 PM daily
- Phone: +1 212-555-1234
- Cuisine: Italian and Continental
- Reservations: By phone only
- Vegan options available

STRICT RULES:
1. Answer ONLY using the information above.
2. If asked something outside this info, say:
"I'm sorry, I don't have that information. Please call the restaurant at +1 212-555-1234 for more details."
3. Do NOT invent menu items or services.
4. Keep replies short and professional.`;
  }

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
          { role: "user", content: message }
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

app.listen(3000, () => console.log("Server running on port 3000"));
