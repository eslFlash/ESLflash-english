let dictionaryData = [];
let tiles = [];
let currentPlayer = 1;
let scores = {1:0, 2:0};
let mode = 1;

const gameGrid = document.getElementById("gameGrid");
const modal = document.getElementById("modal");
const scoreBoard = document.getElementById("scoreBoard");
const dictionarySelect = document.getElementById("dictionarySelect");
const modeSelect = document.getElementById("modeSelect");

const EFFECTS = [
  {text:"Steal 30 points", action:"steal30"},
  {text:"Lose 25 points", action:"lose25"},
  {text:"Gain 50 points", action:"gain50"},
  {text:"Reset your score", action:"resetSelf"},
  {text:"Reset opponent score", action:"resetOpp"},
  {text:"Double your points", action:"double"},
  {text:"Swap scores", action:"swap"},
  {text:"Lose 50 points", action:"lose50"},
  {text:"Gain 30 points", action:"gain30"},
  {text:"Half your score", action:"half"},
  {text:"Opponent +40", action:"opp40"},
  {text:"Opponent -40", action:"oppMinus40"},
  {text:"Both +20", action:"both20"},
  {text:"Both -20", action:"bothMinus20"},
  {text:"Gain 75", action:"gain75"},
  {text:"Lose 75", action:"lose75"},
  {text:"Steal 15", action:"steal15"},
  {text:"Opponent reset", action:"resetOpp"},
  {text:"Extra turn", action:"extra"},
  {text:"Skip opponent", action:"skip"}
];

async function loadDictionaries() {
    const list = ["verbs","food","basic"];
    list.forEach(name=>{
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        dictionarySelect.appendChild(option);
    });
}
loadDictionaries();

async function startGame() {

    mode = parseInt(modeSelect.value);
    currentPlayer = 1;
    scores = {1:0,2:0};

    const selected = dictionarySelect.value;
    const response = await fetch(`dictionaries/${selected}.json`);
    dictionaryData = await response.json();

    const wordCards = shuffle(dictionaryData).slice(0,10).map(w=>({
        type:"question",
        word:w.word,
        image:w.image
    }));

    const effectCards = shuffle(EFFECTS).slice(0,6).map(e=>({
        type:"effect",
        ...e
    }));

    tiles = shuffle([...wordCards,...effectCards]);

    renderBoard();
    updateScore();
}

function renderBoard(){
    gameGrid.innerHTML="";
    tiles.forEach((tile,index)=>{
        const div=document.createElement("div");
        div.className="game-card";
        div.textContent=index+1;
        div.onclick=()=>openTile(index);
        gameGrid.appendChild(div);
    });
}

function openTile(index){
    const tile=tiles[index];
    if(!tile || tile.used) return;

    if(tile.type==="question"){
        showQuestion(tile,index);
    }else{
        applyEffect(tile,index);
    }
}

function showQuestion(tile,index){
    const options = shuffle([
        tile.word,
        shuffle(dictionaryData)[0].word,
        shuffle(dictionaryData)[1].word
    ]);

    modal.style.display="block";
    modal.innerHTML=`
        <div style="background:black;border:3px solid orange;padding:20px;text-align:center;">
            <img src="${tile.image}" style="max-width:300px;"><br><br>
            ${options.map(o=>`<button onclick="answer('${o}','${tile.word}',${index})">${o}</button><br>`).join("")}
        </div>
    `;
}

function answer(selected,correct,index){
    modal.style.display="none";

    if(selected===correct){
        scores[currentPlayer]+=25;
    }

    tiles[index].used=true;
    nextTurn();
}

function applyEffect(tile,index){
    switch(tile.action){
        case "steal30":
            scores[currentPlayer]+=30;
            scores[otherPlayer()]-=30;
            break;
        case "lose25":
            scores[currentPlayer]-=25;
            break;
        case "gain50":
            scores[currentPlayer]+=50;
            break;
        case "resetSelf":
            scores[currentPlayer]=0;
            break;
        case "resetOpp":
            scores[otherPlayer()]=0;
            break;
        case "double":
            scores[currentPlayer]*=2;
            break;
        case "swap":
            [scores[1],scores[2]]=[scores[2],scores[1]];
            break;
        case "lose50":
            scores[currentPlayer]-=50;
            break;
        case "gain30":
            scores[currentPlayer]+=30;
            break;
        case "half":
            scores[currentPlayer]=Math.floor(scores[currentPlayer]/2);
            break;
        case "opp40":
            scores[otherPlayer()]+=40;
            break;
        case "oppMinus40":
            scores[otherPlayer()]-=40;
            break;
        case "both20":
            scores[1]+=20; scores[2]+=20;
            break;
        case "bothMinus20":
            scores[1]-=20; scores[2]-=20;
            break;
        case "gain75":
            scores[currentPlayer]+=75;
            break;
        case "lose75":
            scores[currentPlayer]-=75;
            break;
        case "steal15":
            scores[currentPlayer]+=15;
            scores[otherPlayer()]-=15;
            break;
    }

    tiles[index].used=true;
    updateScore();
    nextTurn();
}

function nextTurn(){
    updateScore();
    if(tiles.every(t=>t.used)){
        finishGame();
        return;
    }
    if(mode===2){
        currentPlayer=otherPlayer();
    }
}

function updateScore(){
    scoreBoard.innerHTML=`Player 1: ${scores[1]} ${mode===2 ? " | Player 2: "+scores[2] : ""}`;
}

function otherPlayer(){
    return currentPlayer===1?2:1;
}

function finishGame(){
    let message="Game Over!";
    if(mode===2){
        if(scores[1]>scores[2]) message="Player 1 Wins!";
        else if(scores[2]>scores[1]) message="Player 2 Wins!";
        else message="Draw!";
    }
    alert(message);
}

function shuffle(arr){
    return [...arr].sort(()=>Math.random()-0.5);
}
