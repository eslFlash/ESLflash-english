let dictionaryData = [];
let gameWords = [];
let currentIndex = 0;
let currentWord = "";
let mistakes = 0;
let resets = 0;
let score = 0;

const dictionarySelect = document.getElementById("dictionarySelect");
const gameArea = document.getElementById("gameArea");

const dictionaries = [
  { id: "basic", title: "Basic" },
  { id: "verbs", title: "Verbs" },
  { id: "food", title: "Food" }
];

dictionaries.forEach(dict => {
  const option = document.createElement("option");
  option.value = dict.id;
  option.textContent = dict.title;
  dictionarySelect.appendChild(option);
});

async function startGame() {
  const selected = dictionarySelect.value;

  const response = await fetch(`dictionaries/${selected}.json`);
  dictionaryData = await response.json();

  // тільки lowercase і без пробілів
  dictionaryData = dictionaryData.filter(item =>
    item.word === item.word.toLowerCase() &&
    !item.word.includes(" ")
  );

  shuffle(dictionaryData);

  gameWords = dictionaryData.slice(0, 10);
  currentIndex = 0;
  score = 0;

  loadWord();
}

function loadWord() {
  if (currentIndex >= gameWords.length) {
    endGame();
    return;
  }

  mistakes = 0;
  resets = 0;

  currentWord = gameWords[currentIndex].word;

  renderGame();
}

function renderGame() {
  const item = gameWords[currentIndex];

  gameArea.innerHTML = `
    <div style="text-align:center;">
      <div style="margin-bottom:20px;">
        ${renderProgress()}
      </div>

      <img src="${item.image}" style="width:300px;height:300px;object-fit:contain;">

      <div id="slots" style="margin:20px 0;font-size:32px;letter-spacing:10px;"></div>

      <div id="letters"></div>
    </div>
  `;

  renderSlots();
  renderLetters();
}

function renderProgress() {
  let html = "";
  for (let i = 0; i < 10; i++) {
    html += i < currentIndex ? "● " : "○ ";
  }
  return html;
}

function renderSlots() {
  const slots = document.getElementById("slots");
  slots.innerHTML = "";

  for (let i = 0; i < currentWord.length; i++) {
    const span = document.createElement("span");
    span.textContent = "_";
    span.dataset.index = i;
    slots.appendChild(span);
  }
}

function renderLetters() {
  const lettersDiv = document.getElementById("letters");
  lettersDiv.innerHTML = "";

  let letters = currentWord.split("");

  // +1 зайва літера
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let extra;
  do {
    extra = alphabet[Math.floor(Math.random() * alphabet.length)];
  } while (currentWord.includes(extra));

  letters.push(extra);

  shuffle(letters);

  letters.forEach(letter => {
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.style.margin = "5px";
    btn.onclick = () => handleLetter(letter, btn);
    lettersDiv.appendChild(btn);
  });
}

function handleLetter(letter, btn) {
  const slots = document.querySelectorAll("#slots span");

  for (let i = 0; i < slots.length; i++) {
    if (slots[i].textContent === "_" && currentWord[i] === letter) {
      slots[i].textContent = letter;
      slots[i].style.color = "green";
      btn.disabled = true;
      btn.style.visibility = "hidden";
      checkComplete();
      return;
    }
  }

  // якщо не підійшла
  mistakes++;
  btn.style.background = "red";

  if (mistakes >= 2) {
    resetWord();
  }
}

function resetWord() {
  resets++;
  mistakes = 0;

  if (resets >= 2) {
    revealOneLetter();
  }

  renderSlots();
  renderLetters();
}

function revealOneLetter() {
  const slots = document.querySelectorAll("#slots span");

  for (let i = 0; i < currentWord.length; i++) {
    if (slots[i].textContent === "_") {
      slots[i].textContent = currentWord[i];
      slots[i].style.color = "orange";
      break;
    }
  }
}

function checkComplete() {
  const slots = document.querySelectorAll("#slots span");
  let word = "";

  slots.forEach(s => word += s.textContent);

  if (word === currentWord) {
    speak(word);

    if (resets === 0) score++;

    setTimeout(() => {
      currentIndex++;
      loadWord();
    }, 800);
  }
}

function endGame() {
  let message;

  if (score === 10) message = "Outstanding! 🏆";
  else if (score >= 7) message = "Great job! 💪";
  else if (score >= 4) message = "Good work! 👍";
  else message = "Keep practicing! 🔥";

  gameArea.innerHTML = `
    <h2>${message}</h2>
    <p>Your score: ${score}/10</p>
    <button onclick="startGame()">Play again</button>
  `;
}

function speak(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

function shuffle(array) {
  array.sort(() => 0.5 - Math.random());
}
