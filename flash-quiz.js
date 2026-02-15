let dictionaryData = [];
let tiles = [];
let currentPlayer = 1;
let scores = {1:0,2:0};
let mode = 1;
let usedCount = 0;

const grid = document.getElementById("gameGrid");
const modal = document.getElementById("modal");
const scoreBoard = document.getElementById("scoreBoard");
const dictionarySelect = document.getElementById("dictionarySelect");
const modeSelect = document.getElementById("modeSelect");

const EFFECTS = [
  {text:"Steal 30", action:"steal", value:30},
  {text:"Lose 25", action:"lose", value:25},
  {text:"Gain 50", action:"gain", value:50},
  {text:"Reset your score", action:"resetSelf"},
  {text:"Reset opponent", action:"resetOpp"},
  {text:"Double points", action:"double"},
  {text:"Swap scores", action:"swap"},
  {text:"Gain 75", action:"gain", value:75},
  {text:"Lose 50", action:"lose", value:50},
  {text:"Both +20", action:"bothGain", value:20},
  {text:"Both -20", action:"bothLose", value:20},
  {text:"Half your score", action:"half"},
  {text:"Opponent +40", action:"oppGain", value:40},
  {text:"Opponent -40", action:"oppLose", value:40},
  {text:"Steal 15", action:"steal", value:15},
  {text:"Gain 30", action:"gain", value:30},
  {text:"Lose 75", action:"lose", value:75},
  {text:"Opponent reset", action:"resetOpp"},
  {text:"Bonus 100", action:"gain", value:100},
  {text:"Jackpot 150", action:"gain", value:150}
];

async function startGame(){
  mode = parseInt(modeSelect.value);
  currentPlayer = 1;
  scores = {1:0,2:0};
  usedCount = 0;

  const selected = dictionarySelect.value;
  const res = await fetch(`dictionaries/${selected}.json`);
  dictionaryData = await res.json();

  const wordTiles = shuffle(dictionaryData).slice(0,10)
    .map(w => ({type:"question", word:w.word, image:w.image, used:false}));

  const effectTiles = shuffle(EFFECTS).slice(0,6)
    .map(e => ({type:"effect", ...e, used:false}));

  tiles = shuffle([...wordTiles, ...effectTiles]);

  renderBoard();
  updateScore();
}

function renderBoard(){
  grid.innerHTML="";
  tiles.forEach((tile,i)=>{
    const card = document.createElement("div");
    card.className="game-card";
    card.innerHTML=i+1;
    card.onclick=()=>openTile(i,card);
    grid.appendChild(card);
  });
}

function openTile(index,card){
  const tile = tiles[index];
  if(tile.used) return;

  tile.used = true;
  card.style.pointerEvents="none";

  if(tile.type==="question"){
    showQuestion(tile,card);
  } else {
    applyEffect(tile,card);
  }
}

function showQuestion(tile,card){

  const wrong = shuffle(dictionaryData.filter(w=>w.word!==tile.word)).slice(0,2);
  const options = shuffle([tile.word, wrong[0].word, wrong[1].word]);

  modal.style.display="flex";
  modal.innerHTML=`
    <div style="
      background:black;
      width:100%;
      height:100%;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      padding:20px;
    ">

      <img src="${tile.image}" 
           style="max-width:90%; max-height:50vh; margin-bottom:30px">

      ${options.map(o=>`
        <button class="answerBtn" 
          style="
            width:90%;
            margin:10px 0;
            padding:15px;
            font-size:20px;
          ">
          ${o}
        </button>
      `).join("")}

    </div>
  `;

  document.querySelectorAll(".answerBtn").forEach(btn=>{
    btn.onclick=()=>handleAnswer(btn, tile.word, card);
  });
}

function handleAnswer(button, correct, card){
  if(button.textContent===correct){
    scores[currentPlayer]+=25;
  }

  setTimeout(()=>{
    modal.style.display="none";
    finishTurn(card);
  },500);
}

function applyEffect(tile, card){

  const opponent = currentPlayer===1 ? 2 : 1;

  executeEffect(tile);

  modal.style.display="flex";
  modal.innerHTML=`
    <div style="background:black;padding:30px;text-align:center">
      <h2 style="color:orange">${tile.text}</h2>
      <p style="margin-top:10px">
        Player ${currentPlayer} affected
      </p>
      <button onclick="closeEffect(${tiles.indexOf(tile)})" 
              style="margin-top:20px;padding:10px 25px;font-size:18px">
        OK
      </button>
    </div>
  `;

  card.innerHTML = tile.text;
}

function closeEffect(index){

  modal.style.display="none";

  const cards = document.querySelectorAll(".game-card");
  const card = cards[index];

  finishTurn(card);
}

function executeEffect(tile){

  const opponent = currentPlayer===1 ? 2 : 1;

  switch(tile.action){

    case "gain":
      scores[currentPlayer]+=tile.value;
      break;

    case "lose":
      scores[currentPlayer]=Math.max(0, scores[currentPlayer]-tile.value);
      break;

    case "steal":
      const stolen = Math.min(tile.value, scores[opponent]);
      scores[opponent]-=stolen;
      scores[currentPlayer]+=stolen;
      break;

    case "resetSelf":
      scores[currentPlayer]=0;
      break;

    case "resetOpp":
      scores[opponent]=0;
      break;

    case "double":
      scores[currentPlayer]*=2;
      break;

    case "swap":
      [scores[1], scores[2]] = [scores[2], scores[1]];
      break;

    case "bothGain":
      scores[1]+=tile.value;
      scores[2]+=tile.value;
      break;

    case "bothLose":
      scores[1]=Math.max(0, scores[1]-tile.value);
      scores[2]=Math.max(0, scores[2]-tile.value);
      break;

    case "half":
      scores[currentPlayer]=Math.floor(scores[currentPlayer]/2);
      break;

    case "oppGain":
      scores[opponent]+=tile.value;
      break;

    case "oppLose":
      scores[opponent]=Math.max(0, scores[opponent]-tile.value);
      break;
  }
}

function finishTurn(card){

  card.style.background="black";
  card.style.border="3px solid orange";

  usedCount++;
  updateScore();

  if(usedCount===16){
    endGame();
    return;
  }

  if(mode===2){
    currentPlayer = currentPlayer===1 ? 2 : 1;
  }
}

function updateScore(){
  scoreBoard.innerHTML = mode===2
    ? `Player 1: ${scores[1]} | Player 2: ${scores[2]} | Turn: Player ${currentPlayer}`
    : `Score: ${scores[1]}`;
}

function endGame(){

  let message;

  if(mode===1){
    message = `Final score: ${scores[1]}`;
  } else {
    if(scores[1]>scores[2]) message="Player 1 Wins!";
    else if(scores[2]>scores[1]) message="Player 2 Wins!";
    else message="Draw!";
  }

  modal.style.display="flex";
  modal.innerHTML=`
    <div style="background:black;padding:30px">
      <h2>${message}</h2>
      <button onclick="startGame()">Play Again</button>
    </div>
  `;
}

function shuffle(arr){
  return arr.sort(()=>Math.random()-0.5);
}
