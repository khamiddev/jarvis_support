from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import io
import base64
from gTTS import gTTS  # Yangi ovoz kutubxonasi
from dotenv import load_dotenv

# .env faylini yuklash
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ XATO: GEMINI_API_KEY topilmadi!")
else:
    print("🚀 API kalit muvaffaqiyatli yuklandi!")

app = Flask(__name__)
CORS(app)
genai.configure(api_key=api_key)

# Ishlaydigan modelni avtomatik topish
ishlaydigan_model = None
print("🔍 Modellarni qidiryapman...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            ishlaydigan_model = m.name
            if 'gemini' in m.name.lower():
                break
    if ishlaydigan_model:
        print(f"✅ ULANDI: {ishlaydigan_model}")
        model = genai.GenerativeModel(ishlaydigan_model)
    else:
        print("❌ Model topilmadi.")
except Exception as e:
    print(f"Model xatosi: {e}")

JARVIS_PROMPT = """Sen Jarvis san. Hamidning shaxsiy sun'iy intellekt yordamchisisan. 
Javoblaringni doim qisqa, aniq va o'zbek tilida ber. 
Keraksiz uzun matnlardan qoch. Xo'jayiningga hurmat bilan, professional tarzda murojaat qil."""


@app.route('/ask', methods=['POST'])
def ask_jarvis():
    try:
        data = request.json
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({'error': 'Xabar topilmadi'}), 400

        # Gemini'dan javob olish
        full_prompt = f"{JARVIS_PROMPT}\n\nHamid: {user_message}\nJarvis:"
        response = model.generate_content(full_prompt)
        javob_matni = response.text.strip()

        # ==========================================
        # JAVOBNI MP3 OVOZGA AYLANTIRISH
        # ==========================================
        # O'zbek tili (uz) da ovoz tayyorlaymiz
        tts = gTTS(text=javob_matni, lang='uz', slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)

        # Ovozni Base64 formatida frontendga jo'natamiz
        audio_base64 = base64.b64encode(fp.read()).decode('utf-8')

        return jsonify({
            'response': javob_matni,
            'audio': audio_base64  # MP3 ovoz fayli shu yerda ketadi
        })

    except Exception as e:
        print("\n!!!!!!!! ASL XATO: !!!!!!!!\n", e, "\n!!!!!!!!!!!!!!!!!!!!!!!!!!!\n")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("Jarvis miyasi (Server) ishga tushdi. Buyruqlarni kutyapman...\n")
    app.run(port=5000, debug=True)