const difficultySelect = document.getElementById("difficultySelect");
const dictionarySelect = document.getElementById("dictionarySelect");
const playersSelect = document.getElementById("playersSelect");
const startBtn = document.getElementById("startGameBtn");
const board = document.getElementById("gameBoard");

let dictData = [];
let cards = [];
let flipped = [];
let currentPlayer = 1;
let scores = [0, 0];
let playersCount = 2;

/* LOAD DICTIONARY */

async function loadDictionary() {
    const selected = dictionarySelect.value;
    const response = await fetch(`dictionaries/${selected}.json`);
    dictData = await response.json();
}

dictionarySelect.addEventListener("change", loadDictionary);

/* SHUFFLE */

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

/* START GAME */

function startGame() {

    board.innerHTML = "";
    flipped = [];
    scores = [0,0];
    playersCount = parseInt(playersSelect.value);
    currentPlayer = 1;

    updateScores();

    const difficulty = difficultySelect.value;

    board.classList.remove("easy","medium","hard");
    board.classList.add(difficulty);

    const selectedDict = dictionaries[dictionarySelect.value];

    let pairCount = 8; // easy

    if (difficulty === "medium") pairCount = 12;
    if (difficulty === "hard") pairCount = 16;

    let gameItems = selectedDict.slice(0, pairCount);

    cards = shuffle([...gameItems, ...gameItems]);

    cards.forEach(item => {

        const card = document.createElement("div");
        card.classList.add("memory-card");
        card.dataset.word = item.word;

        card.innerHTML = `
            <div class="memory-inner">
                <div class="memory-back"></div>
                <div class="memory-front">
                    <img src="${item.image}" />
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

    if (flipped.length === 2) {
        checkMatch();
    }
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
        }, 500);

    } else {

        setTimeout(() => {
            c1.classList.remove("flip");
            c2.classList.remove("flip");
            flipped = [];
            switchPlayer();
        }, 800);
    }
}

/* SWITCH PLAYER */

function switchPlayer() {

    if (playersCount === 1) return;

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateScores();
}

/* UPDATE SCORE */

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

/* INIT */

loadDictionary();
startBtn.addEventListener("click", startGame);
