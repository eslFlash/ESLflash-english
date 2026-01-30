const dictionaries = {
    basic: [
        { en: "apple", ua: "яблуко" },
        { en: "dog", ua: "собака" },
        { en: "house", ua: "будинок" }
    ],
    food: [
        { en: "bread", ua: "хліб" },
        { en: "milk", ua: "молоко" },
        { en: "cheese", ua: "сир" }
    ],
    verbs: [
        { en: "run", ua: "бігти" },
        { en: "eat", ua: "їсти" },
        { en: "sleep", ua: "спати" }
    ]
};

let currentWords = [];
let currentWord = {};
let score = 0;

const wordElement = document.getElementById("word");
const answerInput = document.getElementById("answer");
const resultElement = document.getElementById("result");
const scoreElement = document.getElementById("score");
const dictionarySelect = document.getElementById("dictionarySelect");

function loadDictionary() {
    const selected = dictionarySelect.value;
    currentWords = dictionaries[selected];
    score = 0;
    scoreElement.textContent = "Бали: 0";
    getRandomWord();
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
        resultElement.textContent = "❌ Неправильно. Правильна відповідь: " + currentWord.ua;
    }

    scoreElement.textContent = "Бали: " + score;
    answerInput.value = "";

    setTimeout(getRandomWord, 800);
}

dictionarySelect.addEventListener("change", loadDictionary);
document.addEventListener("DOMContentLoaded", loadDictionary);
