const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const recordBtn = document.getElementById('record-btn');

// 1. إعداد التعرف على الصوت
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA'; // اللغة العربية

    recognition.onstart = () => { recordBtn.textContent = "يستمع... 👂"; };
    recognition.onend = () => { recordBtn.textContent = "🎤 تكلم"; };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage(); // إرسال تلقائي بمجرد التوقف عن الكلام
    };

    recordBtn.addEventListener('click', () => recognition.start());
} else {
    recordBtn.style.display = 'none'; // إخفاء الزر إذا المتصفح لا يدعم الصوت
    alert("المتصفح لا يدعم تحويل الصوت لنص");
}

// 2. إرسال الرسالة
sendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
    const text = userInput.value;
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';

    try {
        // ملاحظة: هذا الرابط يعمل مع السيرفر الذي انشأناه
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        
        const data = await response.json();
        addMessage(data.reply, 'ai');
        speak(data.reply); // نطق الرد

    } catch (error) {
        addMessage("عذراً، تأكد من تشغيل السيرفر.", 'ai');
        console.error(error);
    }
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 3. نطق النص (Text-to-Speech)
function speak(text) {
    // 1. إيقاف أي كلام قديم فوراً (الحل لمشكلتك)
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA"; // ضبط اللغة عربية
    utterance.rate = 1.0;     // سرعة طبيعية

    // داخل دالة تشغيل المايك
window.speechSynthesis.cancel(); // اسكت عشان أقدر أتكلم أنا

}
