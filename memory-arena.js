const dictionarySelect = document.getElementById("dictionarySelect");
const playersSelect = document.getElementById("playersSelect");
const difficultySelect = document.getElementById("difficultySelect");
const startBtn = document.getElementById("startGameBtn");
const board = document.getElementById("gameBoard");

let dictData = [];
let flipped = [];
let currentPlayer = 1;
let scores = [0,0];
let playersCount = 2;

/* LOAD DICTIONARY */

async function loadDictionary() {
    const selected = dictionarySelect.value;
    const response = await fetch(`dictionaries/${selected}.json`);
    dictData = await response.json();
}

/* SHUFFLE */

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

/* START GAME */

async function startGame() {

    await loadDictionary();

    board.innerHTML = "";
    flipped = [];
    scores = [0,0];
    playersCount = parseInt(playersSelect.value);
    currentPlayer = 1;
    updateScores();

    const difficulty = difficultySelect.value;

    board.classList.remove("easy","medium","hard");
    board.classList.add(difficulty);

    let pairCount = 8;
    if (difficulty === "medium") pairCount = 12;
    if (difficulty === "hard") pairCount = 16;

    let selectedWords = shuffle(dictData).slice(0, pairCount);
    let cards = shuffle([...selectedWords, ...selectedWords]);

    cards.forEach(item => {

        const card = document.createElement("div");
        card.classList.add("memory-card");
        card.dataset.word = item.word;

        card.innerHTML = `
            <div class="memory-inner">
                <div class="memory-back"></div>
                <div class="memory-front">
                    <img src="${item.image}">
                    <p>${item.word}</p>
                </div>
            </div>
        `;

        card.addEventListener("click", () => flipCard(card));
        board.appendChild(card);
    });
}

/* FLIP */

function flipCard(card) {

    if (
        flipped.length === 2 ||
        card.classList.contains("flip") ||
        card.classList.contains("matched")
    ) return;

    card.classList.add("flip");
    speak(card.dataset.word);
    flipped.push(card);

    if (flipped.length === 2) checkMatch();
}

/* CHECK */

function checkMatch() {

    const [c1, c2] = flipped;

    if (c1.dataset.word === c2.dataset.word) {

        scores[currentPlayer - 1]++;
        speak(c1.dataset.word);

        setTimeout(() => {
            c1.classList.add("matched");
            c2.classList.add("matched");
            flipped = [];
            updateScores();
        }, 400);

    } else {

        setTimeout(() => {
            c1.classList.remove("flip");
            c2.classList.remove("flip");
            flipped = [];
            switchPlayer();
        }, 800);
    }
}

/* SWITCH */

function switchPlayer() {
    if (playersCount === 1) return;
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateScores();
}

/* SCORE */

function updateScores() {
    document.querySelector("#player1 span").textContent = scores[0];
    document.querySelector("#player2 span").textContent = scores[1];

    document.getElementById("player1")
        .classList.toggle("active", currentPlayer === 1);

    document.getElementById("player2")
        .classList.toggle("active", currentPlayer === 2);
}

/* SPEAK */

function speak(word) {
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    speechSynthesis.speak(utter);
}

function endGame() {

    let winnerText = "";

    if (player1Score > player2Score) {
        winnerText = "Player 1 Wins! 🏆";
    } else if (player2Score > player1Score) {
        winnerText = "Player 2 Wins! 🏆";
    } else {
        winnerText = "It's a Draw! 🤝";
    }

    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.background = "rgba(0,0,0,0.85)";
    modal.style.display = "flex";
    modal.style.flexDirection = "column";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.color = "white";
    modal.style.zIndex = "999";
    modal.style.textAlign = "center";

    modal.innerHTML = `
        <h2 style="font-size:28px;margin-bottom:10px;">Game Over</h2>
        <p style="font-size:22px;margin-bottom:20px;">${winnerText}</p>
        <button id="restartBtn" style="
            padding:10px 20px;
            font-size:16px;
            background:#e67e22;
            border:none;
            border-radius:10px;
            cursor:pointer;
            font-weight:bold;
        ">Play Again</button>
    `;

    document.body.appendChild(modal);

    document.getElementById("restartBtn").addEventListener("click", () => {
        location.reload();
    });
}

startBtn.addEventListener("click", startGame);
