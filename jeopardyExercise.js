const apiUrl = "https://jservice.io/";
const catagoryNumber = 6;
const CAT_NUM_CLUES = 5;
const CAT_COUNT = 100;
const LONG_DELAY = 1000;
const SHORT_DELAY = 500;
let categories = [];
let ongoingGame = false;


const bodyHTML = document.querySelector("body");
const gameBoard = document.querySelector("#gameContainer");
const tBody = document.querySelectorAll("td");


// Set up and start game function //
async function setupAndStart() {
    showLoader();
    ongoingGame = false;
    let catIds = await getCategoryIds();
    categories = [];
    for (let catId of catIds) {
        categories.push(await getCategory(catId));
    }
    fillTable();
}
let board = []; // the board doesnt 'change', but the pieces get add so I use let



function makeBoard() {
  for (let y = 0; y < HEIGHT; y++) {
    board.push(Array.from({ length: WIDTH }));
  }
}//this sets the board limits here instead of making a table in html



function makeTheBoard() {
  const board = document.getElementById('board');

  
  const top = document.createElement('tr');
  top.setAttribute('id', 'column-top');
  top.addEventListener('click', handleClick);//this makes it so all if the player
  //'interaction' is with the top row.  kinds like they are dropping the pieces in.

  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement('td');
    headCell.setAttribute('id', x);
    top.append(headCell);
  }

  board.append(top);

  // make main part of board
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement('tr');

    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement('td');
      cell.setAttribute('id', `${y}-${x}`);
      row.append(cell);
    }

    board.append(row);
  }
}

function buildContainerAndTable() {

    const gameContainer = document.createElement("div");
    gameContainer.classList.add("container");
    gameContainer.setAttribute("id", "game-container");

    
    $('#board').remove();

    
    const table = document.createElement("table");
    table.setAttribute("id", "board");
    table.classList.add("center", "indigo", "darken-4");
    gameContainer.append(table);
    
    bodyHTML.append(gameContainer);
   
    
    }

// Function to build the Category Row //
function buildTopRow() {
     
        const topHead = document.createElement("thead"); 
    
        const top = document.createElement("tr"); 
        top.setAttribute("id", "category-row");
     
        const gameTable = document.querySelector("#board");
   
        
        while (topHead.lastChild) {
            topHead.removeChild(topHead.lastChild);
        }
    
        for (let x = 0; x < catagoryNumber; x++) {
            const headCell = document.createElement("th");
            headCell.setAttribute("id", x);
            headCell.classList.add("indigo", "darken-4", "center-align", "flow-text",
                "white-text", "col", "s2", "responsive-table" 
            );
            top.append(headCell);
            headCell.innerText = categories[x].title;
          }
        topHead.append(top);
        gameTable.append(topHead);
}
    
// Function build cells with Questions //
function buildCluesByCategory() {
    const tableBody = document.createElement("tbody");
    tableBody.setAttribute("id", "t-body");
    // empty table body jQuery = $('tbody').empty(); //
    while (tableBody.lastChild) {
        tableBody.removeChild(tableBody.lastChild);
    }

    for (let clueID = 0; clueID < CAT_NUM_CLUES; clueID++) {
        const row = document.createElement("tr");
        for (let catID = 0; catID < catagoryNumber; catID++) {
            const cell = document.createElement("td");
            cell.classList.add("center-align", "indigo", "darken-4");
            const cellDiv = document.createElement("div");
            cellDiv.setAttribute("id", `${catID}-${clueID}`);
            cellDiv.classList.add(  "center-align", "indigo", "darken-4",
                "white-text", "hover" );
            cellDiv.innerText = "?";
            cell.append(cellDiv);
            row.append(cell);
        }
        tableBody.append(row);
    }
       
    board.append(tableBody);
    
    tableBody.addEventListener('click', (e) => {
        handleClick(e);   
     });
}

async function getCategoryIds() {
   
    const result = await axios.get(apiUrl + "categories", { params: { count: CAT_COUNT } });
    let newCatIds = result.data.map(cat => cat.id );
    return _.sampleSize(newCatIds, catagoryNumber);
}

// request data about a category to API, use map to build object with title and an Array called clues //
// Clues array contains properties answer, question and showing set to null. //
async function getCategory(catId) {
    const result = await axios.get(apiUrl + "category", { params: { id: catId } });
    let cat = result.data;
    let cluesArr = cat.clues;
    let randomizeClues = _.sampleSize(cluesArr, CAT_NUM_CLUES);
    let clues = randomizeClues.map(clues => ({
        question: clues.question,
        answer: clues.answer,
        showing: null,
    }));
    return { title: cat.title, clues }
}

// Fill the table, Markup functions are in seperat/ed js file /
async function fillTable() {
    buildContainerAndTable();
    buildTopRow();
    buildCluesByCategory();
    ongoingGame = true;
}

// Game logic:  FIRST click - show question, SECOND click - show answer //
// THIRD click: no action //
function handleClick(e) {
    let cellId = e.target.id;
    let idsArr = _.split(cellId, '-', 2);
    let clueID = idsArr[1];
    let catID = idsArr[0];
    let clue = categories[catID].clues[clueID];

    if (clue.showing === null) {
        e.target.innerText = clue.question;
        clue.showing = "question";
    }
    else if (clue.showing === "question") {
        e.target.innerText = clue.answer;
        clue.showing = "answer";
    }
    else {
        return
    }
}

// Function to handle start/reset button click //
function  handleBtnClick(FSBtn) {
    FSBtn.addEventListener('click', (e) => {
        snd.play();
        removeIntro();

        if (ongoingGame === false) {
            setTimeout(function () {
                setupAndStart()
                FSBtn.classList.remove("pulse");
                FSBtn.innerHTML = '<i class="large material-icons center">restore</i>';
            }, SHORT_DELAY);
            setTimeout(() => { removeLoader() }, LONG_DELAY);
        }
        else if (ongoingGame === true) {
            categories = [];
            setTimeout(function () {
                $("#firstsplash-btn").on("click", setupAndStart());
            }, LONG_DELAY);
            setTimeout(() => { removeLoader() }, LONG_DELAY);
           return
        }    
    }); 
}

