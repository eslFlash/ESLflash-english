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
let totalPairs = 0;
let matches = 0;
let vsComputer = false;

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
    currentPlayer = 1;

    const mode = playersSelect.value;

if (mode === "computer") {
    playersCount = 2;
    vsComputer = true;
} else {
    playersCount = parseInt(mode);
    vsComputer = false;
}
    vsComputer = playersCount === 1;

    updateScores();

    const difficulty = difficultySelect.value;

    board.classList.remove("easy","medium","hard");
    board.classList.add(difficulty);

    let pairCount = 8;
    if (difficulty === "medium") pairCount = 12;
    if (difficulty === "hard") pairCount = 16;

    totalPairs = pairCount;
    matches = 0;

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
        matches++;
        checkGameEnd();

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

    if (playersCount === 2) {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateScores();
    }

    if (vsComputer && currentPlayer === 2) {
        setTimeout(computerMove, 800);
    }
}

function computerMove() {

    let available = [...document.querySelectorAll(".memory-card:not(.flip):not(.matched)")];

    if (available.length < 2) return;

    let first = available[Math.floor(Math.random() * available.length)];
    flipCard(first);

    setTimeout(() => {
        let secondOptions = [...document.querySelectorAll(".memory-card:not(.flip):not(.matched)")];
        let second = secondOptions[Math.floor(Math.random() * secondOptions.length)];
        flipCard(second);
    }, 600);
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

/* GAME END */

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
        winnerText = "🔥 Player 1 wins the Arena!";
        winnerScore = scores[0];
    } else if (scores[1] > scores[0]) {
        winnerText = vsComputer
            ? "🤖 Computer wins!"
            : "🔥 Player 2 wins the Arena!";
        winnerScore = scores[1];
    } else {
        winnerText = "⚡ Draw!";
        winnerScore = scores[0];
    }

    const modal = document.createElement("div");
    modal.className = "esl-modal";

    modal.innerHTML = `
        <div class="esl-modal-card">
            <h2>GAME OVER</h2>
            <p>${winnerText}</p>

            <input id="nicknameInput" placeholder="Enter nickname">

            <button id="saveScoreBtn">Save Score</button>
            <button id="restartBtn">Play Again</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("saveScoreBtn")
        .addEventListener("click", () => {
            const name = document.getElementById("nicknameInput").value.trim();
            if (!name) return;
            saveRecord(name, winnerScore);
            renderLeaderboard();
        });

    document.getElementById("restartBtn")
        .addEventListener("click", () => location.reload());
}

/* CONFETTI */

function launchConfetti() {
    for (let i = 0; i < 80; i++) {
        let conf = document.createElement("div");
        conf.style.position = "fixed";
        conf.style.width = "6px";
        conf.style.height = "6px";
        conf.style.background = "#ff8c00";
        conf.style.top = "0";
        conf.style.left = Math.random() * 100 + "vw";
        conf.style.opacity = Math.random();
        conf.style.zIndex = "2000";
        conf.style.transition = "2s ease-out";
        document.body.appendChild(conf);

        setTimeout(() => {
            conf.style.top = "100vh";
            conf.style.transform = "rotate(720deg)";
        }, 10);

        setTimeout(() => conf.remove(), 2000);
    }
}

/* LEADERBOARD */

function saveRecord(name, score) {
    let records = JSON.parse(localStorage.getItem("memoryArenaRecords")) || [];
    records.push({ name, score });
    records.sort((a,b) => b.score - a.score);
    records = records.slice(0,5);
    localStorage.setItem("memoryArenaRecords", JSON.stringify(records));
}

function renderLeaderboard() {
    let records = JSON.parse(localStorage.getItem("memoryArenaRecords")) || [];
    const lb = document.getElementById("leaderboard");

    lb.innerHTML = "<h3>🏆 Top Players</h3>";

    records.forEach(r => {
        lb.innerHTML += `<p>${r.name} — ${r.score}</p>`;
    });
}

renderLeaderboard();

startBtn.addEventListener("click", startGame);
