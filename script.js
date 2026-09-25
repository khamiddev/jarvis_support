const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const loginScreen = document.getElementById('login-screen');
const loginTitle = document.getElementById('login-title');
const kirishVideo = document.getElementById('kirishVideo');
const jarvisUI = document.getElementById('jarvis-ui');
const mainVideo = document.getElementById('mainVideo');

// Ovoz tizimini tayyorlash
window.speechSynthesis.getVoices();

// 1. ISMNI TEKSHIRISH
usernameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const value = usernameInput.value.trim().toLowerCase();
        
        if (value === 'khamid' || value === 'hamid') {
            usernameInput.style.display = 'none';
            passwordInput.style.display = 'block';
            loginTitle.innerText = "ENTER PASSWORD";
            passwordInput.focus();
        } else {
            xatoKorsatish(usernameInput);
        }
    }
});

// 2. PAROL TEKSHIRUVI
passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const pwd = passwordInput.value.trim().toLowerCase();
        
        if (pwd === 'jarvis') {
            // Ovoz tizimini blokdan chiqarish
            let unlockAudio = new SpeechSynthesisUtterance('');
            window.speechSynthesis.speak(unlockAudio);

            loginScreen.style.display = 'none'; 
            kirishVideo.style.display = 'block'; 
            
            kirishVideo.play().catch(error => {
                console.log("Kirish videosi xatosi:", error);
                videoTugadi();
            });
        } else {
            xatoKorsatish(passwordInput);
        }
    }
});

function xatoKorsatish(inputElement) {
    loginScreen.style.backgroundColor = "rgba(255, 0, 0, 0.4)"; 
    inputElement.style.borderColor = "red";
    inputElement.style.color = "red";
    inputElement.value = "";
    const eskiPlaceholder = inputElement.placeholder;
    inputElement.placeholder = "ERROR!";

    setTimeout(() => {
        loginScreen.style.backgroundColor = "black";
        inputElement.style.borderColor = "#ff9900";
        inputElement.style.color = "#00ffcc";
        inputElement.placeholder = eskiPlaceholder;
    }, 1000);
}

// 3. ASOSIY VIDEOGA O'TISH VA SALOMLASHISH
kirishVideo.addEventListener('ended', videoTugadi);

function videoTugadi() {
    kirishVideo.style.display = 'none'; 
    jarvisUI.style.display = 'block'; 
    
    if(mainVideo) {
        mainVideo.currentTime = 0;
        mainVideo.play().catch(err => console.log("Asosiy video xatosi: ", err));
    }

    // ==========================================
    // TIZIMGA XUSH KELIBSIZ DEB AYTISH
    // ==========================================
    speak("Tizimga xush kelibsiz");

    startJarvis(); 
}

if (mainVideo) {
    mainVideo.addEventListener('timeupdate', function() {
        if (mainVideo.duration && mainVideo.currentTime >= mainVideo.duration - 1.5) {
            mainVideo.currentTime = 0; 
            mainVideo.play();
        }
    });
}

// 4. JARVIS MIKROFONI
function startJarvis() {
    console.log("Jarvis mikrofonni tinglamoqda...");
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'uz-UZ';
    recognition.continuous = false; 
    
    recognition.start();

    recognition.onend = function() {
        recognition.start();
    };

    recognition.onresult = (event) => {
        let command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Eshitildi: " + command);

        if (command.includes("jarvis")) {
            // Nuqta va boshqa belgilarni tozalash
            let question = command.replace(/jarvis/g, "").replace(/[.,?!]/g, "").trim();
            
            // Agar faqat "Jarvis" degan bo'lsa
            if (question === "") {
                speak("Xizmatdaman, xo'jayin");
            } else {
                // Agar haqiqiy savol bo'lsa, Python'ga yuboramiz
                askJarvisBrain(question);
            }
        }
    };
}

// 5. PYTHONGA SO'ROV YUBORISH
async function askJarvisBrain(question) {
    console.log("Miyaga yuborilyapti: " + question);
    try {
        // MANA SHU YERDA 127.0.0.1:5000 ga murojaat qilinadi
        const response = await fetch('http://127.0.0.1:5000/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: question })
        });
        
        if (!response.ok) {
            throw new Error(`Xatolik: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.response) {
            console.log("Javob:", data.response);
            speak(data.response); 
        } else {
            console.error("Xato:", data.error);
        }
    } catch (err) {
        console.error("Server bilan aloqa uzildi:", err);
    }
}

// 6. JAVOBNI O'QISH
function speak(text) {
    console.log("Jarvis gapirmoqchi: " + text);
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}