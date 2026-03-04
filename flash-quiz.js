const dictionarySelect = document.getElementById("dictionarySelect");
const modeSelect = document.getElementById("modeSelect");
const btnPlay = document.getElementById("btnPlay");
const gameBoard = document.getElementById("gameBoard");
const scoreBoard = document.getElementById("scoreBoard");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");

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
  {text:"Opp -40", action:"oppLose", value:40}
];

btnPlay.addEventListener("click", startGame);

populateDictionarySelect();

function populateDictionarySelect(){
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

  tile.used = true;
  card.classList.add("used");
  card.style.pointerEvents="none";

  if(tile.type==="question"){
    showQuestion(tile);
  } else {
    executeEffect(tile);
    showEffect(tile);
  }
}

function showQuestion(tile){

  const wrong = shuffle(
    tiles.filter(x=>x.type==="question" && x.word!==tile.word)
  ).slice(0,2);

  const options = shuffle([tile.word, wrong[0].word, wrong[1].word]);

  const dictName = dictionarySelect.value.replace(".json","");

  modal.style.display="flex";
  modalBody.innerHTML = `
      <img src="images/${dictName}/${tile.word}.jpg"
           onerror="this.src='images/${dictName}/${tile.word}.png'"
           class="quiz-image">
      <button id="speakBtn">🔊</button>
      <div class="quiz-buttons">
        ${options.map(o=>`<button class="optBtn">${o}</button>`).join("")}
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
      endTurn();
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

  const positiveActions = ["gain","bothGain","oppLose","steal","double"];
  const isPositive = positiveActions.includes(tile.action);

  const emoji = isPositive ? "😊" : "🤦‍♂️";

  const translations = {
    steal:"Вкради очки",
    lose:"Втрати очки",
    gain:"Отримай очки",
    resetSelf:"Скидання твоїх очок",
    resetOpp:"Скидання очок суперника",
    double:"Подвоєння",
    swap:"Обмін очками",
    bothGain:"Обидва отримують очки",
    bothLose:"Обидва втрачають очки",
    half:"Половина очок",
    oppGain:"Суперник отримує очки",
    oppLose:"Суперник втрачає очки"
  };

  let fullText = "";

  switch(tile.action){
    case "bothGain":
      fullText = `You both get +${tile.value}`;
      break;
    case "bothLose":
      fullText = `You both get -${tile.value}`;
      break;
    case "gain":
      fullText = `You get +${tile.value}`;
      break;
    case "lose":
      fullText = `You get -${tile.value}`;
      break;
    case "oppGain":
      fullText = `Opponent gets +${tile.value}`;
      break;
    case "oppLose":
      fullText = `Opponent gets -${tile.value}`;
      break;
    case "steal":
      fullText = `Steal ${tile.value} from opponent`;
      break;
    case "double":
      fullText = `Your score doubles`;
      break;
    case "swap":
      fullText = `Swap scores`;
      break;
    case "half":
      fullText = `Your score is cut in half`;
      break;
    case "resetSelf":
      fullText = `Your score resets to 0`;
      break;
    case "resetOpp":
      fullText = `Opponent score resets to 0`;
      break;
  }

  modal.style.display="flex";
  modalBody.innerHTML=`
      <div class="quiz-modal">
        <h2>${fullText} ${emoji}</h2>
        <p style="color:#888; margin-top:5px;">
          ${translations[tile.action]}
        </p>
        <button id="okBtn">OK</button>
      </div>
  `;

  document.getElementById("okBtn").onclick = endTurn;
      }

function endTurn(){
  modal.style.display="none";
  usedCount++;
  updateScore();

  if(usedCount===tiles.length){
    showFinal();
    return;
  }

  if(mode===2){
    currentPlayer = currentPlayer===1?2:1;
    updateScore();
  }
}

function updateScore(){

  document.querySelector("#player1 span").textContent = scores[1];
  document.querySelector("#player2 span").textContent = scores[2];

  document.getElementById("player1")
    .classList.toggle("active", currentPlayer === 1);

  document.getElementById("player2")
    .classList.toggle("active", currentPlayer === 2);

  document.getElementById("player2").style.display =
      mode === 1 ? "none" : "block";
     }

function speak(text){
  if(!window.speechSynthesis) return;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang="en-US";
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function shuffle(arr){
  return arr.sort(()=>Math.random()-0.5);
}

function showFinal(){

  launchConfetti();

  let winnerText = "";
  let winnerScore = 0;

  if(scores[1] > scores[2]){
    winnerText = "🔥 Player 1 wins!";
    winnerScore = scores[1];
  } 
  else if(scores[2] > scores[1]){
    winnerText = "🔥 Player 2 wins!";
    winnerScore = scores[2];
  } 
  else {
    winnerText = "⚡ Draw!";
    winnerScore = scores[1];
  }

  modal.style.display = "flex";
  modalBody.innerHTML = `
      <div class="quiz-modal">
          <h2 style="color:#e67e22;">GAME OVER</h2>
          <p style="font-size:20px;margin:15px 0;">
              ${winnerText}
          </p>
          <input id="nicknameInput" placeholder="Enter nickname">
          <button id="saveScoreBtn">Save Score</button>
          <button id="restartBtn">Play Again</button>
      </div>
  `;

  document.getElementById("saveScoreBtn").onclick = ()=>{
      const name = document.getElementById("nicknameInput").value.trim();
      if(!name) return;
      saveRecord(name, winnerScore);
      renderLeaderboard();
  };

  document.getElementById("restartBtn").onclick = ()=>location.reload();
}

function launchConfetti(){
    for (let i = 0; i < 80; i++) {
        let conf = document.createElement("div");
        conf.style.position = "fixed";
        conf.style.width = "6px";
        conf.style.height = "6px";
        conf.style.background = "#ff8c00";
        conf.style.top = "0";
        conf.style.left = Math.random() * 100 + "vw";
        conf.style.opacity = Math.random();
        conf.style.zIndex = "3000";
        conf.style.transition = "2s ease-out";
        document.body.appendChild(conf);

        setTimeout(()=>{
            conf.style.top="100vh";
            conf.style.transform="rotate(720deg)";
        },10);

        setTimeout(()=>conf.remove(),2000);
    }
          }
function saveRecord(name, score){
    let records = JSON.parse(localStorage.getItem("flashQuizRecords")) || [];
    records.push({name, score});
    records.sort((a,b)=>b.score-a.score);
    records = records.slice(0,5);
    localStorage.setItem("flashQuizRecords", JSON.stringify(records));
}

function renderLeaderboard(){
    let records = JSON.parse(localStorage.getItem("flashQuizRecords")) || [];
    const lb = document.getElementById("leaderboard");

    lb.innerHTML = "<h3>🏆 Top Players</h3>";

    records.forEach(r=>{
        lb.innerHTML += `<p>${r.name} — ${r.score}</p>`;
    });
}

renderLeaderboard();
