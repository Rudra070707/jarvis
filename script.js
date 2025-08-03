const statusText = document.querySelector(".typing");
const synth = window.speechSynthesis;
let voices = [];

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;

const commands = {
  "hello": "Hello! I am JARVIS.",
  "who are you": "I am your virtual assistant, JARVIS.",
  "how are you": "I am always operational.",
  "what time is it": () => {
    const now = new Date();
    return `It is ${now.toLocaleTimeString()}`;
  },
  "what is your name": "I am JARVIS, your virtual assistant."
};

// Load voices before speaking
function loadVoices() {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      voices = synth.getVoices();
      if (voices.length !== 0) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

// Robotic voice speaker
async function speak(text) {
  await loadVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;      // Slower for robotic feel
  utterance.pitch = 0.5;     // Deeper voice
  utterance.volume = 1;

  // Try to pick a preferred robotic voice
  const jarvisVoice = voices.find(v => v.lang === "en-US" && v.name.includes("Google"))
                    || voices.find(v => v.lang === "en-US")
                    || voices[0];
  utterance.voice = jarvisVoice;

  synth.speak(utterance);
}

// Typing effect with voice
function typeAndSpeak(text) {
  let i = 0;
  statusText.textContent = "";
  const typingInterval = setInterval(() => {
    statusText.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(typingInterval);
      speak(text);
    }
  }, 40);
}

// Speech recognition
recognition.onstart = () => {
  statusText.textContent = "JARVIS is listening...";
};

recognition.onerror = (event) => {
  statusText.textContent = "Error: " + event.error;
  console.error("Speech recognition error:", event.error);
};

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
  console.log("Heard:", transcript);

  let response = commands[transcript];
  if (typeof response === "function") response = response();

  if (response) {
    typeAndSpeak(response);
  } else {
    typeAndSpeak("Sorry, I didn't understand that.");
  }
};

// Restart mic if it stops
recognition.onend = () => {
  console.log("Restarting recognition...");
  recognition.start();
};

// Auto-start on load
window.onload = () => {
  recognition.start();
  typeAndSpeak("JARVIS is now active.");
};
