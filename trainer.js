let currentWords = [];
let currentWord = {};
let score = 0;

async function loadDictionary(name = "basic") {
    const response = await fetch(`dictionaries/${name}.json`);
    currentWords = await response.json();
    score = 0;
    document.getElementById("score").textContent = "Бали: 0";
    getRandomWord();
}

function getRandomWord() {
    currentWord = currentWords[Math.floor(Math.random() * currentWords.length)];
    document.getElementById("word").textContent = currentWord.en;
}

function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.toLowerCase().trim();
    const result = document.getElementById("result");

    if (userAnswer === currentWord.ua) {
        score++;
        result.textContent = "✅ Правильно!";
    } else {
        result.textContent = "❌ Правильна відповідь: " + currentWord.ua;
    }

    document.getElementById("score").textContent = "Бали: " + score;
    document.getElementById("answer").value = "";

    setTimeout(getRandomWord, 800);
}

document.addEventListener("DOMContentLoaded", () => {
    loadDictionary("basic");
});
