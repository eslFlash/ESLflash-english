const topics = [
{ id: "can-negative", title: "CAN - Negative" },
{ id: "can-questions", title: "CAN - Questions" },
{ id: "there-is-affirmative", title: "There is - Affirmative" },
{ id: "there-is-negative", title: "There is - Negative" },
{ id: "there-is-questions", title: "There is - Questions" },
{ id: "there-are-affirmative", title: "There are - Affirmative" },
{ id: "there-are-negative", title: "There are - Negative" },
{ id: "there-are-questions", title: "There are - Questions" },
{ id: "ps-affirmative", title: "Present Simple - Affirmative" },
{ id: "ps-negative", title: "Present Simple - Negative" },
{ id: "ps-questions", title: "Present Simple - Questions" }
];

const menu = document.getElementById("menu");
const gameArea = document.getElementById("gameArea");

let sentences = [];
let currentSentence = null;
let mistakeCount = 0;
let resetCount = 0;
let score = 0;

renderMenu();

function renderMenu() {
  menu.innerHTML = "";
  gameArea.innerHTML = "";

  topics.forEach(topic => {
    const btn = document.createElement("button");
    btn.textContent = topic.title;
    btn.onclick = () => loadTopic(topic.id);
    menu.appendChild(btn);
  });
}

async function loadTopic(topicId) {
  const response = await fetch(`grammar/${topicId}.json`);
  sentences = await response.json();

  sentences = shuffle(sentences).slice(0, 10);

  score = 0;
  resetCount = 0;

  menu.innerHTML = "";
  startGame();
}

function startGame() {
  if (sentences.length === 0) {
    gameArea.innerHTML = `<h2>Excellent work! 🔥 Score: ${score}/10</h2>
    <button onclick="renderMenu()">Back to topics</button>`;
    return;
  }

  currentSentence = sentences.shift();
  mistakeCount = 0;

  renderSentence();
}

function renderSentence() {
  gameArea.innerHTML = "";

  const slots = document.createElement("div");
  slots.style.marginBottom = "30px";

  currentSentence.words.forEach(() => {
    const slot = document.createElement("span");
    slot.className = "slot";
    slot.style.display = "inline-block";
    slot.style.minWidth = "80px";
    slot.style.borderBottom = "3px solid black";
    slot.style.margin = "5px";
    slot.style.fontSize = "22px";
    slot.style.textAlign = "center";
    slot.innerHTML = "&nbsp;";
    slots.appendChild(slot);
  });

  const wordButtons = document.createElement("div");

  shuffle([...currentSentence.words]).forEach(word => {
    const btn = document.createElement("button");
    btn.textContent = word;
    btn.onclick = () => handleWordClick(word, btn);
    wordButtons.appendChild(btn);
  });

  gameArea.appendChild(slots);
  gameArea.appendChild(wordButtons);
}

let filledWords = [];

function handleWordClick(word, button) {
  speak(word);

  filledWords.push(word);
  updateSlots();

  if (!isCorrectSoFar()) {
    mistakeCount++;

    if (mistakeCount >= 2) {
      resetSentence();
    }
  }

  if (filledWords.length === currentSentence.words.length) {
    if (isFullyCorrect()) {
      score++;
      setTimeout(startGame, 700);
    } else {
      resetSentence();
    }
  }
}

function updateSlots() {
  const slotElements = document.querySelectorAll(".slot");
  slotElements.forEach((slot, i) => {
    slot.textContent = filledWords[i] || "";
  });
}

function isCorrectSoFar() {
  for (let i = 0; i < filledWords.length; i++) {
    if (filledWords[i] !== currentSentence.words[i]) {
      return false;
    }
  }
  return true;
}

function isFullyCorrect() {
  return filledWords.join(" ") === currentSentence.words.join(" ");
}

function resetSentence() {
  filledWords = [];
  mistakeCount = 0;
  resetCount++;

  if (resetCount >= 3) {
    highlightCorrect();
  }

  updateSlots();
}

function highlightCorrect() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach(btn => {
    if (currentSentence.words.includes(btn.textContent)) {
      btn.style.backgroundColor = "#ffeaa7";
    }
  });
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

function shuffle(array) {
  return array.sort(() => 0.5 - Math.random());
      }
