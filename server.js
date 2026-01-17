const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

// زيادة سعة البيانات لاستقبال الصور الكبيرة (Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// جلب المفتاح من متغيرات البيئة
const GROQ_API_KEY = process.env.MURTA;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, image } = req.body;
    
    // تجهيز محتوى الرسالة
    let userContent = [{ type: "text", text: message }];
    
    // إذا وجدنا صورة، نضيفها
    if (image) {
        userContent.push({
            type: "image_url",
            image_url: { url: image }
        });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                { 
                    role: "system", 
                    content: "You are MVC AI. Helpful, smart, and concise. Reply in the user's language." 
                },
                { 
                    role: "user", 
                    content: userContent 
                }
            ],
            // ⚠️ التعديل الهام: استخدام موديل Llama 3.3 القوي والمستقر
            // ملاحظة: إذا واجهت مشكلة في الصور مع هذا الموديل، جرب "llama-3.2-90b-vision-preview"
            model: "llama-3.3-70b-versatile", 
            temperature: 0.7
        })
    });

    const data = await response.json();

    if (data.error) {
        // طباعة الخطأ في الكونسول لمعرفته
        console.error("Groq Error:", data.error);
        throw new Error(data.error.message);
    }
    
    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ reply: "حدث خطأ في النظام (قد يكون الموديل مشغولاً، حاول مجدداً)." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
