const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ⚠️ ضع مفتاحك هنا مباشرة بين علامات التنصيص
const genAI = new GoogleGenerativeAI("AIzaSyBaOm0UcZHH86t9GmyJNKIIm8zzjwmZmd0");

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Error causing crash:", error); // طباعة الخطأ في السجلات
    res.status(500).json({ error: "خطأ في الاتصال بالذكاء الاصطناعي" });
  }
});

const PORT = process.env.PORT || 3000;
// الحل لمشكلة الشبكة: إضافة '0.0.0.0'
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
