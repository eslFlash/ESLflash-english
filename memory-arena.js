// Приклад формату словника
const dictionaries = {
    demo: [
        { word: "cat", image: "images/cat.png" },
        { word: "dog", image: "images/dog.png" },
        { word: "apple", image: "images/apple.png" },
        { word: "car", image: "images/car.png" }
    ]
};

const dictionarySelect = document.getElementById("dictionarySelect");
const playersSelect = document.getElementById("playersSelect");
const startBtn = document.getElementById("startGameBtn");
const board = document.getElementById("gameBoard");

let cards = [];
let flipped = [];
let currentPlayer = 1;
let scores = [0,0];
let playersCount = 2;

function populateDictionaries() {
    for (let key in dictionaries) {
        let option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        dictionarySelect.appendChild(option);
    }
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startGame() {
    board.innerHTML = "";
    flipped = [];
    scores = [0,0];
    playersCount = parseInt(playersSelect.value);
    currentPlayer = 1;

    updateScores();

    const selectedDict = dictionaries[dictionarySelect.value];
    let gameItems = selectedDict.slice(0,16);

    cards = shuffle([...gameItems, ...gameItems]);

    cards.forEach((item, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.word = item.word;

        card.innerHTML = `
            <div class="card-inner card-back"></div>
            <div class="card-inner card-front">
                <img src="${item.image}" />
                <p>${item.word}</p>
            </div>
        `;

        card.addEventListener("click", () => flipCard(card));
        board.appendChild(card);
    });
}

function flipCard(card) {
    if (flipped.length === 2 || card.classList.contains("flip")) return;

    card.classList.add("flip");
    flipped.push(card);

    if (flipped.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [c1, c2] = flipped;

    if (c1.dataset.word === c2.dataset.word) {
        scores[currentPlayer-1]++;
        speakWord(c1.dataset.word);
        flipped = [];
        updateScores();
    } else {
        setTimeout(() => {
            c1.classList.remove("flip");
            c2.classList.remove("flip");
            flipped = [];
            switchPlayer();
        }, 800);
    }
}

function switchPlayer() {
    if (playersCount === 1) return;
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateScores();
}

function updateScores() {
    document.querySelector("#player1 span").textContent = scores[0];
    document.querySelector("#player2 span").textContent = scores[1];

    document.getElementById("player1").classList.toggle("active", currentPlayer===1);
    document.getElementById("player2").classList.toggle("active", currentPlayer===2);
}

function speakWord(word) {
    const utter = new SpeechSynthesisUtterance(word);
    speechSynthesis.speak(utter);
}

populateDictionaries();
startBtn.addEventListener("click", startGame);
