let dictionaryData = [];
let currentSet = [];
let currentWord = null;

const imagesContainer = document.getElementById("imagesContainer");
const targetWordEl = document.getElementById("targetWord");
const speakBtn = document.getElementById("speakBtn");
const dictionarySelect = document.getElementById("dictionarySelect");

dictionarySelect.addEventListener("change", loadDictionary);
speakBtn.addEventListener("click", speakWord);

async function loadDictionary() {
    const selected = dictionarySelect.value;

    const response = await fetch(`dictionaries/${selected}.json`);
    dictionaryData = await response.json();

    startGame();
}

function startGame() {
    const shuffled = [...dictionaryData].sort(() => 0.5 - Math.random());

    // 3 на мобілці, 5 на ширших екранах
    const count = window.innerWidth < 600 ? 3 : 5;

    currentSet = shuffled.slice(0, count);
    renderImages();
    pickNextWord();
}

function renderImages() {
    imagesContainer.innerHTML = "";

    currentSet.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="card-front">
                <img src="images/${dictionarySelect.value}/${item.image}" alt="${item.word}">
            </div>
        `;

        card.addEventListener("click", () => handleClick(item));
        imagesContainer.appendChild(card);
    });
}

function pickNextWord() {
    if (currentSet.length === 0) {
        targetWordEl.textContent = "Great job!";
        imagesContainer.innerHTML = "";
        return;
    }

    currentWord = currentSet[Math.floor(Math.random() * currentSet.length)];
    targetWordEl.textContent = currentWord.word;
}

function handleClick(item) {
    if (item.word === currentWord.word) {
        currentSet = currentSet.filter(w => w.word !== item.word);
        renderImages();
        pickNextWord();
    } else {
        shake();
    }
}

function speakWord() {
    if (!currentWord) return;

    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}

function restartGame() {
    startGame();
}

function shake() {
    imagesContainer.style.transform = "translateX(10px)";
    setTimeout(() => {
        imagesContainer.style.transform = "translateX(-10px)";
    }, 100);
    setTimeout(() => {
        imagesContainer.style.transform = "translateX(0px)";
    }, 200);
}

loadDictionary();
