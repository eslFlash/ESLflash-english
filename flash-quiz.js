// — — Flash Quiz Logic — —
const dictionarySelect = document.getElementById("dictionarySelect");
const modeSelect = document.getElementById("modeSelect");
const btnPlay = document.getElementById("btnPlay");
const gridArea = document.getElementById("gridArea");
const scoreBoard = document.getElementById("scoreBoard");
const modal = document.getElementById("modal");

let activeDict = null;
let tiles = [];
let score = 0;

// — Load dict into select menu
function loadDictionaries() {
  Object.keys(dictionaries).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = key;
    dictionarySelect.appendChild(opt);
  });
}

btnPlay.addEventListener("click", startGame);

function startGame() {
  const dictKey = dictionarySelect.value;
  if (!dictKey) {
    alert("Оберіть словник!");
    return;
  }
  activeDict = dictionaries[dictKey];
  score = 0;
  updateScore();

  // pick N cards
  const copy = [...activeDict];
  shuffle(copy);

  tiles = copy.slice(0, 10);
  renderGrid();
}

function renderGrid() {
  gridArea.innerHTML = "";
  tiles.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "flash-card";
    card.dataset.index = idx;
    card.textContent = item.word;
    card.addEventListener("click", () => flipCard(idx));
    gridArea.appendChild(card);
  });
}

function flipCard(idx) {
  const card = tiles[idx];
  showModal(card);
}

function showModal(card) {
  modal.innerHTML = `
    <div class="modal-card">
      <img src="${card.image}" alt="${card.word}">
      <h2>${card.word}</h2>
      <p>${card.translation}</p>
      <button onclick="closeModal()">OK</button>
    </div>
  `;
  modal.classList.remove("modal-hidden");
}

function closeModal() {
  modal.classList.add("modal-hidden");
}

function updateScore() {
  scoreBoard.textContent = `Score: ${score}`;
}

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

loadDictionaries();
