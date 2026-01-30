let words = [];
let currentIndex = 0;

async function loadReview() {
    const response = await fetch("dictionaries/basic.json");
    words = await response.json();
    showCard();
}

function showCard() {
    const word = words[currentIndex];

    document.getElementById("cardImage").src = word.image;
    document.getElementById("cardWord").textContent = word.en;
    document.getElementById("cardTranslation").textContent = word.ua;

    speak(word.en);

    document.getElementById("card").classList.remove("flip");
}

function nextCard() {
    currentIndex = (currentIndex + 1) % words.length;
    showCard();
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}

document.getElementById("card").addEventListener("click", () => {
    document.getElementById("card").classList.toggle("flip");
});

document.addEventListener("DOMContentLoaded", loadReview);
