const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const GROQ_API_KEY = process.env.MURTA;

app.post('/api/chat', async (req, res) => {
  const { message, image } = req.body;

  // دالة مساعدة للاتصال بالموديل
  const callGroq = async (modelName, content) => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                { role: "system", content: "You are MVC AI. Helpful assistant." },
                { role: "user", content: content }
            ],
            model: modelName,
            temperature: 0.7
        })
    });
    return await response.json();
  };

  try {
    let userContent = [{ type: "text", text: message }];
    let targetModel = "llama-3.3-70b-versatile"; // الموديل الأساسي المستقر

    // إذا كان هناك صورة، نحاول استخدام موديل الرؤية
    if (image) {
        userContent.push({ type: "image_url", image_url: { url: image } });
        targetModel = "llama-3.2-90b-vision-preview"; // موديل الصور القوي
    }

    let data = await callGroq(targetModel, userContent);

    // ⚠️ الذكاء هنا: إذا فشل موديل الصور، نتحول لموديل النصوص فوراً
    if (data.error) {
        console.log("Vision model failed, switching to text model...");
        // نلغي الصورة ونرسل النص فقط للموديل المستقر
        userContent = [{ type: "text", text: message + " (Image analysis failed, replying to text only)" }];
        data = await callGroq("llama-3.3-70b-versatile", userContent);
    }

    if (data.error) throw new Error(data.error.message);
    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Final Error:", error);
    res.status(500).json({ reply: "نواجه ضغطاً على السيرفرات، يرجى المحاولة بعد قليل." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
