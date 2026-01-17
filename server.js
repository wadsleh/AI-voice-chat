const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// جلب المفتاح من متغيرات البيئة (اسم المفتاح الذي وضعته في Render)
const GROQ_API_KEY = process.env.MURTA;

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // الاتصال بموديل Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                // توجيه ذكي: الموديل سيرد بنفس لغة المستخدم
                { 
                    role: "system", 
                    content: "You are a helpful and smart AI assistant like Gemini. You are versatile and can speak all languages. Always reply in the same language the user is speaking to you. Keep your answers concise." 
                },
                { role: "user", content: message }
            ],
            // استخدام أحدث وأذكى موديل متاح حالياً
            model: "llama-3.3-70b-versatile",
            temperature: 0.7
        })
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    const replyText = data.choices[0].message.content;
    res.json({ reply: replyText });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ reply: "حدث خطأ في الاتصال بالسيرفر." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
