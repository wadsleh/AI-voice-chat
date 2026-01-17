const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ⚠️ ضع مفتاح Groq الجديد هنا (يبدأ بـ gsk_)
const GROQ_API_KEY = process.env.MURTA;

// هذا السطر سيطبع في الـ Logs هل المفتاح موجود أم لا
console.log("Is Key Loaded?", GROQ_API_KEY ? "YES ✅" : "NO ❌");


app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // الاتصال بسيرفرات Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                { role: "system", content: "You are a helpful assistant. Always reply in Arabic." },
                { role: "user", content: message }
            ],
            // موديل Llama 3.3 الجديد: ذكي جداً وسريع ويدعم العربية بطلاقة
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
    res.status(500).json({ reply: "حدث خطأ في الخادم." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
