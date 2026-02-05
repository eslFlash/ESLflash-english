let words = [];
let currentIndex = 0;

const dictionarySelect = document.getElementById("dictionarySelect");
const card = document.getElementById("card");
const reviewWord = document.getElementById("reviewWord");
const reviewTranslation = document.getElementById("reviewTranslation");
const reviewImage = document.getElementById("reviewImage");
const speakBtn = document.getElementById("speakBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

dictionarySelect.addEventListener("change", loadDictionary);
card.addEventListener("click", flipCard);
speakBtn.addEventListener("click", speakWord);
nextBtn.addEventListener("click", nextWord);
prevBtn.addEventListener("click", prevWord);

async function loadDictionary() {
    const selected = dictionarySelect.value;

    const response = await fetch(`dictionaries/${selected}.json`);
    words = await response.json();

    currentIndex = 0;
    showWord();
}

function showWord() {
    if (!words.length) return;

    const wordObj = words[currentIndex];

    reviewWord.textContent = wordObj.word;
    reviewTranslation.textContent = wordObj.translation;
    reviewImage.src = wordObj.image;

    card.classList.remove("flipped");
}

function flipCard() {
    card.classList.toggle("flipped");
}

function nextWord() {
    currentIndex++;
    if (currentIndex >= words.length) currentIndex = 0;
    showWord();
}

function prevWord() {
    currentIndex--;
    if (currentIndex < 0) currentIndex = words.length - 1;
    showWord();
}

function speakWord(event) {
    event.stopPropagation();

    if (!words.length) return;

    const utterance = new SpeechSynthesisUtterance(words[currentIndex].word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

loadDictionary();}

function prevWord() {
    currentIndex--;
    if (currentIndex < 0) currentIndex = words.length - 1;
    showWord();
}

function flipCard() {
    card.classList.toggle("flipped");
}

function speakWord(event) {
    event.stopPropagation();

    if (words.length === 0) return;

    const utterance = new SpeechSynthesisUtterance(words[currentIndex].word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;

    speechSynthesis.speak(utterance);
}

loadDictionary();    document.getElementById("reviewImage").src = wordObj.image;

    document.querySelector(".card").classList.remove("flipped");
}

function nextWord() {
    currentIndex++;
    if (currentIndex >= words.length) {
        currentIndex = 0;
    }
    showWord();
}
function speakWord() {
    if (words.length === 0) return;

    const word = words[currentIndex].word;

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    speechSynthesis.speak(utterance);
}

function flipCard() {
    document.querySelector(".card").classList.toggle("flipped");
}

loadDictionary();
