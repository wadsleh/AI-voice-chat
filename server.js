const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const GROQ_API_KEY = process.env.MURTA;

app.post('/api/chat', async (req, res) => {
  const { message, language } = req.body;

  try {
    let userContent = [{ type: "text", text: message }];
    
    // تعليمات النظام: الرد بنفس لغة المستخدم
    const systemInstruction = language === 'ar-SA' 
        ? "أنت MVC AI، مساعد ذكي. رد باللغة العربية دائماً."
        : "You are MVC AI, a smart assistant. Reply in English.";

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: userContent }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ reply: "Server Busy, Try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
