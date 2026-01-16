const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static('public'));

// إعداد الاتصال بالذكاء الاصطناعي
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// استقبال الرسائل
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send('حدث خطأ في الاتصال');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
