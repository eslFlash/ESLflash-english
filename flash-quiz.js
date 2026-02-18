const dictionarySelect = document.getElementById("dictionarySelect");
const modeSelect = document.getElementById("modeSelect");
const btnPlay = document.getElementById("btnPlay");
const gameBoard = document.getElementById("gameBoard");
const scoreBoard = document.getElementById("scoreBoard");
const modal = document.getElementById("modal");

let tiles = [];
let mode = 1;
let currentPlayer = 1;
let scores = {1:0,2:0};
let usedCount = 0;

// effect cards
const EFFECTS = [
  {text:"Steal 30", action:"steal", value:30},
  {text:"Lose 25", action:"lose", value:25},
  {text:"Gain 50", action:"gain", value:50},
  {text:"Reset you", action:"resetSelf"},
  {text:"Reset opp", action:"resetOpp"},
  {text:"Double", action:"double"},
  {text:"Swap", action:"swap"},
  {text:"Both +20", action:"bothGain", value:20},
  {text:"Both -20", action:"bothLose", value:20},
  {text:"Half", action:"half"},
  {text:"Opp +40", action:"oppGain", value:40},
  {text:"Opp -40", action:"oppLose", value:40},
  {text:"Steal 15", action:"steal", value:15},
  {text:"Gain 30", action:"gain", value:30},
  {text:"Lose 75", action:"lose", value:75},
  {text:"Bonus 100", action:"gain", value:100},
  {text:"Jackpot 150", action:"gain", value:150},
  {text:"Skip opp", action:"skip"}
];

btnPlay.addEventListener("click", startGame);

async function startGame(){
  const dict = dictionarySelect.value;
  if (!dict) {
    alert("Оберіть словник!");
    return;
  }

  mode = parseInt(modeSelect.value);
  currentPlayer = 1;
  scores = {1:0,2:0};
  usedCount = 0;

  // load JSON
  const response = await fetch(`dictionaries/${dict}.json`);
  const data = await response.json();

  const wordTiles = shuffle([...data]).slice(0,10).map(w=>({
    type:"question",
    word:w.word,
    image:w.image,
    translation:w.translation,
    used:false
  }));

  const effectTiles = shuffle([...EFFECTS]).slice(0,6).map(e=>({
    type:"effect",
    ...e,
    used:false
  }));

  tiles = shuffle([...wordTiles, ...effectTiles]);
  renderBoard();
  updateScore();
}

function renderBoard(){
  gameGrid.innerHTML = "";
  tiles.forEach((tile,i) => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.textContent = i+1;
    card.onclick = () => openTile(i, card);
    gameGrid.appendChild(card);
  });
}

function openTile(index, card){
  const tile = tiles[index];
  if (tile.used) return;

  tile.used = true;
  card.style.pointerEvents="none";

  if (tile.type === "question") {
    showQuestion(tile, card);
  } else {
    showEffect(tile, card);
  }
}

function showQuestion(tile, card){
  const wrong = shuffle([...tiles]
    .filter(x => x.type==="question" && x.word!==tile.word))
    .slice(0,2);

  const options = shuffle([tile.word, wrong[0].word, wrong[1].word]);

  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="quiz-modal">
      <img src="${tile.image}" class="quiz-image">
      
      <div class="quiz-buttons">
        ${options.map(o=>`<button class="optBtn">${o}</button>`).join("")}
      </div>
    </div>
  `;

  document.querySelectorAll(".optBtn").forEach(btn => {
    btn.onclick = () => handleAnswer(btn, tile.word, card);
  });
}


function handleAnswer(button, correct, card){
  const allBtns = document.querySelectorAll(".optBtn");
  allBtns.forEach(b => b.disabled = true);

  if (button.textContent === correct){
    button.style.background="green";
    scores[currentPlayer] += 25;
  } else {
    button.style.background="red";
  }

  setTimeout(() => {
    modal.style.display="none";
    finishTurn(card);
  }, 800);
}

function showEffect(tile, card){
  const opponent = currentPlayer === 1 ? 2 : 1;

  executeEffect(tile);

  modal.style.display = "flex";
  modal.innerHTML = `
    <div style="background:#000; padding:30px; text-align:center; color:white;">
      <h2 style="color:#e67e22;">${tile.text}</h2>
      <button onclick="closeEffect()">OK</button>
    </div>
  `;
}

function closeEffect(){
  modal.style.display="none";
  finishTurn();
}

function executeEffect(tile){
  const opp = currentPlayer === 1 ? 2 : 1;

  switch(tile.action){
    case "gain": scores[currentPlayer]+=tile.value; break;
    case "lose": scores[currentPlayer] -= tile.value; break;
    case "steal":
      const stolen = Math.min(tile.value,scores[opp]);
      scores[opp]-=stolen; scores[currentPlayer]+=stolen; 
      break;
    case "resetSelf": scores[currentPlayer]=0; break;
    case "resetOpp": scores[opp]=0; break;
    case "double": scores[currentPlayer]*=2; break;
    case "swap":
      [scores[1],scores[2]]=[scores[2],scores[1]]; break;
    case "bothGain":
      scores[1]+=tile.value; scores[2]+=tile.value; break;
    case "bothLose":
  scores[1] -= tile.value;
  scores[2] -= tile.value;
  break;
    case "half": scores[currentPlayer]=Math.floor(scores[currentPlayer]/2); break;
    case "oppGain": scores[opp]+=tile.value; break;
    case "oppLose": scores[opp] -= tile.value; break;
  }
}

function finishTurn(card){
  if(card){
    card.style.background="black";
    card.style.border="3px solid #e67e22";
  }

  usedCount++;
  updateScore();

  if (usedCount === tiles.length) {
    showFinal();
    return;
  }

  if (mode === 2){
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }
}

function updateScore(){
  scoreBoard.textContent = mode === 2
    ? `Player 1: ${scores[1]} | Player 2: ${scores[2]}`
    : `Score: ${scores[1]}`;
}

function showFinal(){
  modal.style.display="flex";
  modal.innerHTML = `
    <div style="background:#000; padding:40px; text-align:center; color:white;">
      <h2>Game Over</h2>
      <p>${mode===2
         ? (scores[1]>scores[2]
            ? "Player 1 Wins!"
            : (scores[1]<scores[2] ? "Player 2 Wins!" : "Draw!"))
         : "Final Score: " + scores[1]
      }</p>
      <button onclick="startGame()">Play Again</button>
    </div>
  `;
}

function shuffle(a){
  return a.sort(()=>Math.random()-0.5);
}
