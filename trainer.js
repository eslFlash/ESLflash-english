let words = [];
let currentWord = {};
let score = 0;

function loadDictionary() {
    const selected = document.getElementById("dictionarySelect").value;

    fetch(`dictionaries/${selected}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Dictionary not found");
            }
            return response.json();
        })
        .then(data => {

    // Підтримка старого і нового формату словників
    if (Array.isArray(data)) {
        words = data; // старий формат
    } else {
        words = [...data.core, ...data.extra]; // новий A0 формат
    }

    score = 0;
    document.getElementById("score").innerText = "Бали: 0";
    nextWord();
})
        .catch(error => {
            document.getElementById("word").innerText = "Помилка завантаження словника";
            console.error(error);
        });
}

function nextWord() {
    if (words.length === 0) return;

    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];

    document.getElementById("word").innerText = currentWord.word;
    document.getElementById("answer").value = "";
    document.getElementById("result").innerText = "";
}

function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.trim().toLowerCase();

    if (userAnswer === currentWord.translation.toLowerCase()) {
        document.getElementById("result").innerText = "Правильно!";
        score++;
    } else {
        document.getElementById("result").innerText = "Неправильно! Правильна відповідь: " + currentWord.translation;
    }

    document.getElementById("score").innerText = "Бали: " + score;

    setTimeout(nextWord, 1000);
}

window.onload = async () => {

    await populateDictionarySelect();

    loadDictionary();

};
