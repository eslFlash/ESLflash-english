let words = [];
let currentIndex = 0;

const card = document.getElementById("card");
const reviewWord = document.getElementById("reviewWord");
const reviewTranslation = document.getElementById("reviewTranslation");
const reviewImage = document.getElementById("reviewImage");
const speakBtn = document.getElementById("speakBtn");
const dictionarySelect = document.getElementById("dictionarySelect");

const dictionaries = ["basic", "food", "verbs"];

dictionaries.forEach(dict => {
    const option = document.createElement("option");
    option.value = dict;
    option.textContent = dict.charAt(0).toUpperCase() + dict.slice(1);
    dictionarySelect.appendChild(option);
});

async function loadDictionary(name) {
    const response = await fetch(`dictionaries/${name}.json`);
    words = await response.json();
    currentIndex = 0;
    showWord();
}

function showWord() {
    const word = words[currentIndex];

    reviewWord.textContent = word.word;
    reviewTranslation.textContent = word.translation;

    reviewImage.src = `images/${dictionarySelect.value}/${word.word}.jpg`;

    card.classList.remove("flipped");
}

function nextWord() {
    currentIndex = (currentIndex + 1) % words.length;
    showWord();
}

function prevWord() {
    currentIndex =
        (currentIndex - 1 + words.length) % words.length;
    showWord();
}

function speakWord(e) {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(
        words[currentIndex].word
    );
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}

card.addEventListener("click", () => {
    card.classList.toggle("flipped");
});

document.getElementById("nextBtn").addEventListener("click", nextWord);
document.getElementById("prevBtn").addEventListener("click", prevWord);
speakBtn.addEventListener("click", speakWord);

dictionarySelect.addEventListener("change", () => {
    loadDictionary(dictionarySelect.value);
});

loadDictionary("basic");
