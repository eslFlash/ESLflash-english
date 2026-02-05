let words = [];
let currentIndex = 0;

const dictionarySelect = document.getElementById("dictionarySelect");

dictionarySelect.addEventListener("change", loadDictionary);

async function loadDictionary() {
    const selected = dictionarySelect.value;

    const response = await fetch(`dictionaries/${selected}.json`);
    words = await response.json();

    currentIndex = 0;
    showWord();
}

function showWord() {
    if (words.length === 0) return;

    const wordObj = words[currentIndex];

    document.getElementById("reviewWord").textContent = wordObj.word;
    document.getElementById("reviewTranslation").textContent = wordObj.translation;
    document.getElementById("reviewImage").src = wordObj.image;

    document.querySelector(".card").classList.remove("flipped");
}

function nextWord() {
    currentIndex++;
    if (currentIndex >= words.length) {
        currentIndex = 0;
    }
    showWord();
}

function flipCard() {
    document.querySelector(".card").classList.toggle("flipped");
}

loadDictionary();
