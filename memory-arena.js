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

let totalPairs = 0;
let matches = 0;
let vsComputer = false;

function checkGameEnd() {
    if (matches === totalPairs) {
        setTimeout(endGame, 600);
    }
}

function endGame() {

    launchConfetti();

    let winnerText = "";
    let winnerScore = 0;

    if (scores[0] > scores[1]) {
        winnerText = "🔥 Player 1 dominates the Arena!";
        winnerScore = scores[0];
    } else if (scores[1] > scores[0]) {
        winnerText = "🔥 Player 2 takes the victory!";
        winnerScore = scores[1];
    } else {
        winnerText = "⚡ It's a draw. Warriors respect warriors.";
        winnerScore = scores[0];
    }

    const nickname = prompt("Enter winner nickname:");

    if (nickname) {
        saveRecord(nickname, winnerScore);
    }

    renderLeaderboard();

    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.background = "rgba(0,0,0,0.9)";
    modal.style.display = "flex";
    modal.style.flexDirection = "column";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "1000";
    modal.style.textAlign = "center";

    modal.innerHTML = `
        <h2 style="font-size:26px;color:#e67e22;">GAME OVER</h2>
        <p style="font-size:18px;margin:10px 0;">
            ${winnerText}
        </p>
        <p style="font-size:16px;margin-bottom:20px;">
            🧠 Every game makes your memory sharper.
        </p>
        <button id="restartBtn" style="
            padding:12px 22px;
            border-radius:14px;
            border:none;
            background:#e67e22;
            color:white;
            font-weight:bold;
            cursor:pointer;
            box-shadow:0 4px 0 #c96a1c;
        ">Play Again</button>
    `;

    document.body.appendChild(modal);

    document.getElementById("restartBtn")
        .addEventListener("click", () => location.reload());
}

startBtn.addEventListener("click", startGame);
