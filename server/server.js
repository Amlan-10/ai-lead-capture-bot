const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());


// const API_KEY = "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";
const API_KEY = process.env.NVIDIA_API_KEY;


app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "meta/llama-4-maverick-17b-128e-instruct",
                messages: [
                    {
                        role: "system",
                        content: `You are an AI lead qualification assistant for a digital marketing agency.

Your job is to talk to potential clients and collect the following details step by step:
1. What service they need (SEO, Ads, Social Media, Website, etc.)
2. Their business website or industry
3. Their monthly marketing budget (low, medium, high or amount)
4. Their name
5. Their email address

Rules:
- Ask one question at a time.
- Be friendly and professional.
- If the user asks unrelated questions, gently bring the conversation back to collecting their project details.
- When all details are collected, say:
"Thank you! Our team will review your information and contact you soon."`
                    }

                    ,
                    { role: "user", content: userMessage }
                ],
                max_tokens: 512,
                temperature: 1.0,
                top_p: 1.0,
                stream: false
            })
        });

        const data = await response.json();
        console.log("NVIDIA RAW RESPONSE:\n", JSON.stringify(data, null, 2));

        if (data.choices && data.choices.length > 0) {
            res.json({ reply: data.choices[0].message.content });
        } else if (data.error) {
            res.status(500).json({ reply: "AI Error: " + data.error.message });
        } else {
            res.status(500).json({ reply: "Unexpected AI response format." });
        }

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ reply: "AI request failed." });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
