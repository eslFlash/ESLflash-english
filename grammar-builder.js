let grammarData = [];
let currentSet = [];
let currentIndex = 0;
let currentSentence = null;
let mistakes = 0;
let resets = 0;
let score = 0;

const gameArea = document.getElementById("gameArea");
const grammarSelect = document.getElementById("grammarSelect");

async function startGame() {
    const selected = grammarSelect.value;
    const response = await fetch(`grammar/${selected}.json`);
    grammarData = await response.json();

    currentSet = [...grammarData].sort(() => 0.5 - Math.random()).slice(0, 10);
    currentIndex = 0;
    score = 0;

    loadSentence();
}

function loadSentence() {
    mistakes = 0;

    if (currentIndex >= currentSet.length) {
        endGame();
        return;
    }

    currentSentence = currentSet[currentIndex];
    renderSentence();
}

function renderSentence() {
    gameArea.innerHTML = "";

    const slotsDiv = document.createElement("div");
    slotsDiv.id = "slots";

    currentSentence.words.forEach(() => {
        const slot = document.createElement("span");
        slot.className = "slot";
        slot.textContent = "_____ ";
        slotsDiv.appendChild(slot);
    });

    const wordsDiv = document.createElement("div");
    wordsDiv.id = "words";

    const shuffled = [...currentSentence.words].sort(() => 0.5 - Math.random());

    shuffled.forEach(word => {
        const btn = document.createElement("button");
        btn.textContent = word;
        btn.onclick = () => handleClick(word, btn);
        wordsDiv.appendChild(btn);
    });

    gameArea.appendChild(slotsDiv);
    gameArea.appendChild(document.createElement("br"));
    gameArea.appendChild(wordsDiv);
}

function handleClick(word, btn) {
    speak(word);

    const slots = document.querySelectorAll(".slot");
    const filled = [...slots].filter(s => s.textContent !== "_____ ");

    if (word === currentSentence.words[filled.length]) {
        slots[filled.length].textContent = word + " ";
        btn.disabled = true;
        btn.style.backgroundColor = "green";

        if (filled.length + 1 === currentSentence.words.length) {
            score++;
            speak(currentSentence.sentence);
            setTimeout(() => {
                currentIndex++;
                loadSentence();
            }, 1000);
        }

    } else {
        mistakes++;
        btn.style.backgroundColor = "red";

        if (mistakes >= 2) {
            resetSentence();
        }
    }
}

function resetSentence() {
    resets++;

    if (resets >= 3) {
        highlightFirstWord();
    }

    renderSentence();
}

function highlightFirstWord() {
    const buttons = document.querySelectorAll("#words button");
    buttons.forEach(btn => {
        if (btn.textContent === currentSentence.words[0]) {
            btn.style.backgroundColor = "orange";
        }
    });
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}

function endGame() {
    gameArea.innerHTML = `<h2>Your score: ${score}/10</h2>
    <h3>Excellent work! Keep going!</h3>`;
}
