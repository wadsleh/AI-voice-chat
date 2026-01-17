const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// استدعاء المفتاح من متغيرات البيئة الآمنة
const HF_TOKEN = process.env.HF_TOKEN;


// استخدام موديل Mistral المستقر جداً
const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch(MODEL_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            inputs: message,
            parameters: { 
                max_new_tokens: 500, // طول الرد
                return_full_text: false,
                temperature: 0.7 
            }
        })
    });

    if (!response.ok) {
        throw new Error(`HF API Error: ${response.statusText}`);
    }

    const result = await response.json();
    // استخراج النص من رد Hugging Face
    const replyText = result[0].generated_text;

    res.json({ reply: replyText });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ reply: "حدث خطأ في الاتصال، حاول مرة أخرى." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
