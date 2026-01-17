const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
// زيادة سعة البيانات لاستقبال الصور (مهم جداً)
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const GROQ_API_KEY = process.env.MURTA;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, image } = req.body;
    
    // إعداد محتوى الرسالة
    let userContent = [{ type: "text", text: message }];
    
    // إذا أرسل المستخدم صورة، نضيفها للطلب
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
                    content: "You are MVC AI. Helpful and smart. Reply in the user's language." 
                },
                { 
                    role: "user", 
                    content: userContent 
                }
            ],
            // ⚠️ ملاحظة: نستخدم موديل 11b لأنه يدعم الصور وسريع
            // إذا توقف هذا الموديل مستقبلاً، جرب: "llama-3.2-90b-vision-preview"
            model: "llama-3.2-11b-vision-preview",
            temperature: 0.7
        })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);
    
    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Server Error:", error);
    // رسالة واضحة في حال توقف الموديل
    res.status(500).json({ reply: "حدث خطأ في قراءة الصورة (قد يكون الموديل متوقفاً مؤقتاً)." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
