let currentWords = [];
let currentWord = {};
let score = 0;

const wordElement = document.getElementById("word");
const answerInput = document.getElementById("answer");
const resultElement = document.getElementById("result");
const scoreElement = document.getElementById("score");
const dictionarySelect = document.getElementById("dictionarySelect");

async function loadDictionary(name) {
    try {
        const response = await fetch(`dictionaries/${name}.json`);
        currentWords = await response.json();

        if (!Array.isArray(currentWords) || currentWords.length === 0) {
            wordElement.textContent = "Словник порожній";
            return;
        }

        score = 0;
        scoreElement.textContent = "Бали: 0";
        getRandomWord();

    } catch (error) {
        wordElement.textContent = "Помилка завантаження словника";
        console.error(error);
    }
}

function getRandomWord() {
    currentWord = currentWords[Math.floor(Math.random() * currentWords.length)];
    wordElement.textContent = currentWord.en;
}

function checkAnswer() {
    const userAnswer = answerInput.value.toLowerCase().trim();

    if (userAnswer === currentWord.ua) {
        score++;
        resultElement.textContent = "✅ Правильно!";
    } else {
        resultElement.textContent = "❌ Правильна відповідь: " + currentWord.ua;
    }

    scoreElement.textContent = "Бали: " + score;
    answerInput.value = "";
    setTimeout(getRandomWord, 800);
}

dictionarySelect.addEventListener("change", () => {
    loadDictionary(dictionarySelect.value);
});

document.addEventListener("DOMContentLoaded", () => {
    loadDictionary(dictionarySelect.value);
});
