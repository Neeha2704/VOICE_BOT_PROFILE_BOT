const chatBox = document.getElementById("chatBox");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

// -------- Speech Recognition Setup --------
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Speech recognition not supported. Please use Chrome or Edge.");
}

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.continuous = false;

let isListening = false;

// -------- UI Helpers --------
function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.classList.add("message", type);
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
  speechSynthesis.cancel(); // avoid overlap
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  speechSynthesis.speak(utterance);
}

// -------- Core Logic --------
async function processQuestion(question) {
  if (!question.trim()) return;

  addMessage(question, "user");

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    addMessage(data.answer, "bot");
    speak(data.answer);
  } catch {
    addMessage("Unable to reach the server.", "bot");
  }
}

// -------- Events --------
sendBtn.addEventListener("click", () => {
  processQuestion(textInput.value);
  textInput.value = "";
});

textInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    processQuestion(textInput.value);
    textInput.value = "";
  }
});

micBtn.addEventListener("click", () => {
  if (isListening) return; // prevent double start
  isListening = true;
  addMessage("🎧 Listening…", "bot");
  recognition.start();
});

recognition.onresult = e => {
  const question = e.results[0][0].transcript;
  isListening = false;
  processQuestion(question);
};

recognition.onerror = e => {
  isListening = false;
  addMessage("Mic error: " + e.error, "bot");
};

recognition.onend = () => {
  isListening = false;
};
