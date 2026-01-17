const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const GROQ_API_KEY = process.env.MURTA;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, image } = req.body;
    
    let userContent = [{ type: "text", text: message }];
    if (image) {
        userContent.push({ type: "image_url", image_url: { url: image } });
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
                    // ⚠️ هنا نحدد شخصية البوت: اسمه MVC AI وليس Gemini
                    role: "system", 
                    content: "You are MVC AI, a professional and smart assistant created by Murtada. You are NOT Gemini. You help with code, images, and general questions. Always reply in the EXACT SAME language the user is speaking (if English reply English, if Arabic reply Arabic)." 
                },
                { role: "user", content: userContent }
            ],
            // موديل قوي يدعم الصور والنصوص
            model: "llama-3.2-90b-vision-preview",
            temperature: 0.7
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ reply: "Connection error. Please try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
