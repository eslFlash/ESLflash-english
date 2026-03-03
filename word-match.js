let dictData = [];
let currentWord = {};
let remainingWords = [];
let totalQuestions = 0;
let correctAnswers = 0;

const dictionarySelect = document.getElementById("dictionarySelect");
const matchWord = document.getElementById("matchWord");
const answersGrid = document.getElementById("answersGrid");
const progressEl = document.getElementById("progress");
const speakBtn = document.getElementById("speakBtn");

populateDictionarySelect();
dictionarySelect.addEventListener("change", loadDictionary);

async function populateDictionarySelect(){

    dictionarySelect.innerHTML = `<option value="">Select dictionary</option>`;

    try {
        const response = await fetch("dictionaries/index.json");
        const dictionaries = await response.json();

        dictionaries.forEach(dict=>{
            const opt = document.createElement("option");
            opt.value = dict.path;
            opt.textContent = `${dict.level} — ${dict.title}`;
            dictionarySelect.appendChild(opt);
        });

    } catch(error){
        console.error("Dictionary index load error:", error);
    }
}

async function loadDictionary() {
    const selected = dictionarySelect.value;
    if (!selected) return;

    try {
        const response = await fetch(`dictionaries/${selected}.json`);
        const data = await response.json();

        if (data.core) {
            dictData = [...data.core, ...(data.extra || [])];
        } else {
            dictData = data;
        }

    } catch(error){
        console.error("Dictionary load error:", error);
    }
}

function startGame() {
    remainingWords = [...dictData];
    totalQuestions = remainingWords.length;
    correctAnswers = 0;
    updateProgress();
    nextQuestion();
}

function updateProgress() {
    progressEl.textContent = `${correctAnswers} / ${totalQuestions}`;
}

function nextQuestion() {
    if (remainingWords.length === 0) {
        matchWord.textContent = "Готово!";
        answersGrid.innerHTML = "";
        return;
    }

    const index = Math.floor(Math.random() * remainingWords.length);
    currentWord = remainingWords[index];
    remainingWords.splice(index, 1);

    renderQuestion(currentWord);
    updateProgress();
}

function renderQuestion(wordObj) {
    matchWord.textContent = wordObj.word;

    const options = generateOptions(wordObj);
    answersGrid.innerHTML = "";

    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt.translation;
        btn.onclick = () => checkAnswer(opt);
        answersGrid.appendChild(btn);
    });
}

function generateOptions(correct) {
    const options = [correct];

    while (options.length < 6) {
        const random = dictData[Math.floor(Math.random() * dictData.length)];
        if (!options.find(x => x.word === random.word)) {
            options.push(random);
        }
    }

    return shuffleArray(options);
}

function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function checkAnswer(answerObj) {
    if (answerObj.word === currentWord.word) {
        correctAnswers++;
        nextQuestion();
    } else {
        // помилка — можна додати ефект
    }
    updateProgress();
}

function speakWord() {
    if (!currentWord.word) return;
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}

function restartGame() {
    startGame();
}

// старт
loadDictionary();
