const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

// ⚠️ زيادة سعة البيانات لاستقبال الصور (مهم جداً لرفع الملفات)
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const GROQ_API_KEY = process.env.MURTA;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, image } = req.body; // نستقبل الرسالة + الصورة (إن وجدت)

    // إعداد محتوى الرسالة
    let userContent = [{ type: "text", text: message }];

    // إذا وجدنا صورة، نضيفها للطلب
    if (image) {
        userContent.push({
            type: "image_url",
            image_url: { url: image } // الصورة تكون بصيغة Base64
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
                    content: "You are MVC AI, a helpful assistant created by Murtada. You can see images and understand text. Always reply in the same language the user uses." 
                },
                { 
                    role: "user", 
                    content: userContent 
                }
            ],
            // موديل الرؤية الجديد (11 مليار بارامتر) - سريع جداً ويدعم الصور
model: "llama-3.2-11b-vision-preview",
            temperature: 0.7
        })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    const replyText = data.choices[0].message.content;
    res.json({ reply: replyText });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ reply: "حدث خطأ في معالجة الملف أو الاتصال." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
