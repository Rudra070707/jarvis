const statusText = document.getElementById("statusText");
const synth = window.speechSynthesis;

let voices = [];

// Ensure voices are loaded first
window.speechSynthesis.onvoiceschanged = () => {
  voices = window.speechSynthesis.getVoices();
};

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
  }
};

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

function speak(text) {
  if (!voices.length) voices = synth.getVoices(); // Ensure voices are available
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;

  // Choose preferred voice
  const jarvisVoice = voices.find(v => v.lang === "en-US" && v.name.includes("Google")) || voices[0];
  utterance.voice = jarvisVoice;

  synth.speak(utterance);
}

recognition.onstart = () => {
  statusText.textContent = "JARVIS is listening...";
};

recognition.onerror = (event) => {
  statusText.textContent = "Error: " + event.error;
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

function startListening() {
  try {
    recognition.start();
  } catch (e) {
    console.log("Already started");
  }
}

// ✅ Auto-start on page load
window.onload = () => {
  startListening();

  // Give browser a moment to load voices before first speak
  setTimeout(() => {
    typeAndSpeak("JARVIS is now active.");
  }, 500);
};
