const words = [
    { en: "apple", ua: "яблуко" },
    { en: "dog", ua: "собака" },
    { en: "house", ua: "будинок" },
    { en: "water", ua: "вода" },
    { en: "book", ua: "книга" }
];

let currentWord = {};
let score = 0;

function getRandomWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    document.getElementById("word").textContent = currentWord.en;
}

function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.toLowerCase().trim();
    const result = document.getElementById("result");

    if (userAnswer === currentWord.ua) {
        score++;
        result.textContent = "✅ Правильно!";
    } else {
        result.textContent = "❌ Неправильно. Правильна відповідь: " + currentWord.ua;
    }

    document.getElementById("score").textContent = "Бали: " + score;
    document.getElementById("answer").value = "";

    setTimeout(getRandomWord, 800);
}

document.addEventListener("DOMContentLoaded", getRandomWord);
