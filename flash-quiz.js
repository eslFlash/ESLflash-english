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
  {text:"Skip opp", action:"skip"}
];

btnPlay.addEventListener("click", startGame);

async function populateDictionarySelect(){
  const list = [
    {name:"Verbs", file:"verbs.json"},
    {name:"Basic", file:"basic.json"},
    {name:"Food", file:"food.json"}
  ];

  dictionarySelect.innerHTML = `<option value="">Select dictionary</option>`;

  list.forEach(item=>{
    const opt = document.createElement("option");
    opt.value = item.file;
    opt.textContent = item.name;
    dictionarySelect.appendChild(opt);
  });
}

populateDictionarySelect();

async function startGame(){
  const dict = dictionarySelect.value;
  if(!dict){
    alert("Select dictionary!");
    return;
  }

  mode = parseInt(modeSelect.value);
  currentPlayer = 1;
  scores = {1:0,2:0};
  usedCount = 0;

  const response = await fetch(`dictionaries/${dict}`);
  const data = await response.json();

  const wordTiles = shuffle([...data])
    .slice(0,10)
    .map(w=>({
      type:"question",
      ...w,
      used:false
    }));

  const effectTiles = shuffle([...EFFECTS])
    .slice(0,6)
    .map(e=>({
      type:"effect",
      ...e,
      used:false
    }));

  tiles = shuffle([...wordTiles, ...effectTiles]);

  renderBoard();
  updateScore();
}

function renderBoard(){
  gameBoard.innerHTML = "";

  tiles.forEach((tile,i) => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.textContent = i+1;

    card.onclick = () => openTile(i, card);

    gameBoard.appendChild(card);
  });
}

function openTile(index,card){
  const tile = tiles[index];
  if(tile.used) return;

  tile.used=true;
  card.classList.add("used");
card.style.pointerEvents="none";

  if(tile.type==="question"){
    showQuestion(tile,card);
  } else {
    executeEffect(tile);
    showEffect(tile);
  }
}

function showQuestion(tile,card){
  const wrong = shuffle(
    tiles.filter(x=>x.type==="question" && x.word!==tile.word)
  ).slice(0,2);

  const options = shuffle([tile.word, wrong[0].word, wrong[1].word]);

  modal.style.display="flex";
  modal.innerHTML=`
    <div class="quiz-modal">
      <img src="${tile.image}" class="quiz-image">
      <button id="speakBtn">🔊</button>
      <div class="quiz-buttons">
        ${options.map(o=>`<button class="optBtn">${o}</button>`).join("")}
      </div>
    </div>
  `;

  document.getElementById("speakBtn").onclick=()=>speak(tile.word);

  document.querySelectorAll(".optBtn").forEach(btn=>{
    btn.onclick=()=>{
      if(btn.textContent===tile.word){
        scores[currentPlayer]+=25;
      } else {
        scores[currentPlayer]-=25;
      }
      closeModal(card);
    };
  });
}

function executeEffect(tile){
  const opp = currentPlayer===1?2:1;

  switch(tile.action){
    case "gain": scores[currentPlayer]+=tile.value; break;
    case "lose": scores[currentPlayer]-=tile.value; break;
    case "steal":
      scores[currentPlayer]+=tile.value;
      scores[opp]-=tile.value;
      break;
    case "resetSelf": scores[currentPlayer]=0; break;
    case "resetOpp": scores[opp]=0; break;
    case "double": scores[currentPlayer]*=2; break;
    case "swap": [scores[1],scores[2]]=[scores[2],scores[1]]; break;
    case "bothGain": scores[1]+=tile.value; scores[2]+=tile.value; break;
    case "bothLose": scores[1]-=tile.value; scores[2]-=tile.value; break;
    case "half": scores[currentPlayer]=Math.floor(scores[currentPlayer]/2); break;
    case "oppGain": scores[opp]+=tile.value; break;
    case "oppLose": scores[opp]-=tile.value; break;
  }
}

function showEffect(tile){
  modal.style.display="flex";
  modal.innerHTML=`
    <div class="quiz-modal">
      <h2>${tile.text}</h2>
      <button onclick="closeModal()">OK</button>
    </div>
  `;
  updateScore();
}

function closeModal(card){
  modal.style.display="none";
  usedCount++;
  updateScore();

  if(mode===2){
    currentPlayer = currentPlayer===1?2:1;
  }

  if(usedCount===tiles.length){
    alert("Game over!");
  }
}

function updateScore(){
  scoreBoard.innerHTML = `
    Player 1: ${scores[1]} 
    ${mode===2?` | Player 2: ${scores[2]}`:""}
  `;
}
function finishTurn(card){

  if(card){
    card.classList.add("used");
  }

  usedCount++;
  updateScore();

  if (usedCount === tiles.length) {
    showFinal();
    return;
  }

  if(mode === 2){
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }
}

function speak(text){
  if(!window.speechSynthesis) return;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang="en-US";

  const voices = speechSynthesis.getVoices();
  const male = voices.find(v=>v.name.toLowerCase().includes("male"));
  if(male) utter.voice=male;

  speechSynthesis.speak(utter);
}

function shuffle(arr){
  return arr.sort(()=>Math.random()-0.5);
          }
function showFinal(){

  let message = "";

  if(scores[1] > scores[2]){
    message = "🔥 Player 1 dominates!";
  } else if(scores[2] > scores[1]){
    message = "🔥 Player 2 takes the crown!";
  } else {
    message = "⚖️ Draw! Real battle!";
  }

  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="quiz-modal">
      <h2 style="color:#e67e22;">Game Over</h2>
      <p style="font-size:20px; margin:15px 0;">${message}</p>
      <p>Player 1: ${scores[1]} | Player 2: ${scores[2]}</p>
      <button onclick="location.reload()">Play Again</button>
    </div>
  `;
}
