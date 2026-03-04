let dictData = [];
let gameWords = [];
let currentIndex = 0;
let score = 0;

const dictionarySelect = document.getElementById("dictionarySelect");
const imageBox = document.getElementById("imageBox");
const answersBox = document.getElementById("answersBox");
const scoreEl = document.getElementById("score");

dictionarySelect.addEventListener("change", loadDictionary);

async function loadDictionary() {
    const selected = dictionarySelect.value;
    const response = await fetch(`dictionaries/${selected}.json`);
    dictData = await response.json();
}

function startGame() {
    if (!dictData.length) return;

    score = 0;
    currentIndex = 0;
    scoreEl.textContent = `0 / 10`;

    gameWords = shuffleArray([...dictData]).slice(0, 10);

    showQuestion();
}

function showQuestion() {

    if (currentIndex >= gameWords.length) {
        endGame();
        return;
    }

    const wordObj = gameWords[currentIndex];

    imageBox.innerHTML = `
        <img src="${wordObj.image}" 
             style="max-width:300px; width:100%; border-radius:16px;">
    `;

    const options = generateOptions(wordObj);

    answersBox.innerHTML = "";

    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt.word;
        btn.onclick = () => handleAnswer(opt, wordObj, btn);
        answersBox.appendChild(btn);
    });
}

function handleAnswer(selected, correct, btn) {

    speak(selected.word);

    if (selected.word === correct.word) {

        btn.style.background = "green";
        score++;
        scoreEl.textContent = `${score} / 10`;

        setTimeout(() => {
            currentIndex++;
            showQuestion();
        }, 700);

    } else {

        btn.style.background = "red";

        // неправильне слово повертається в кінець
        gameWords.push(correct);

        setTimeout(() => {
            showQuestion();
        }, 700);
    }
}

function generateOptions(correct) {

    const options = [correct];

    while (options.length < 3) {
        const random = dictData[Math.floor(Math.random() * dictData.length)];
        if (!options.find(w => w.word === random.word)) {
            options.push(random);
        }
    }

    return shuffleArray(options);
}

function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function speak(word) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}

function endGame() {
    imageBox.innerHTML = "";
    answersBox.innerHTML = `
        <h2>🔥 Excellent work!</h2>
        <p>You completed all 10 words!</p>
    `;
}

loadDictionary();
