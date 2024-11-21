let currentPlayer = null;
let aiPlayer = null;
let humanPlayer = null;

const grid = document.getElementById("grid");
const resetButton = document.getElementById("resetButton");
const resultDisplay = document.getElementById("result");
const cells = [];
const emptyImgSrc = 'img/vide.png';
const crossImgSrc = 'img/croix.png';
const circleImgSrc = 'img/cercle.png';
const selectCross = document.getElementById("selectCross");
const selectCircle = document.getElementById("selectCircle");

const board = Array(9).fill(null); //representation théorique du plateau de jeu
let searchParameters = [];

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Win en lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // en colonnes
    [0, 4, 8], [2, 4, 6]             // en diagonales
];

function initializeGrid() {
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        const img = document.createElement("img");
        img.src = emptyImgSrc;
        img.setAttribute("data-index", i);

        cell.appendChild(img);
        grid.appendChild(cell);
        cells.push(img);

        img.addEventListener("click", handleCellClick);
    }
}

function handleCellClick(event) {
    const index = parseInt(event.target.getAttribute("data-index"));
    //check si le coup est valide
    if (currentPlayer && event.target.src.includes(emptyImgSrc) && board[index] === null) {
        makeMove(index, humanPlayer);
        if (!checkForWinner() && !isBoardFull()) {
            currentPlayer = aiPlayer;
            aiMakeMove();
        }
    }
}

function makeMove(index, player) {
    //MàJ plateau & interface en fonction du joueur
    board[index] = player === 'cross' ? 1 : -1;
    cells[index].src = player === 'cross' ? crossImgSrc : circleImgSrc;
}

function aiMakeMove() {
    searchParameters = [];
    const bestMove = minimax(board.slice(), 0, -Infinity, Infinity, true);
    makeMove(bestMove.index, aiPlayer);
    displaySearchParameters();
    if (!checkForWinner() && !isBoardFull()) {
        currentPlayer = humanPlayer;
    }
}

function isBoardFull() {
    return board.every(cell => cell !== null);
}

function minimax(newBoard, depth, alpha, beta, isMaximizingPlayer) {
    const result = evaluateBoard(newBoard);
    if (result !== null) {
        return { score: result };
    }

    let bestMove = null;
    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = aiPlayer === 'cross' ? 1 : -1;
                const eval = minimax(newBoard, depth + 1, alpha, beta, false).score;
                newBoard[i] = null;
                if (eval > maxEval) {
                    maxEval = eval;
                    bestMove = i;
                }
                alpha = Math.max(alpha, eval);
                searchParameters.push({ depth, index: i, alpha, beta, eval, isMaximizingPlayer });
                if (beta <= alpha) {
                    break; //Coupure alpha-bêta basé sur algo minmax
                }
            }
        }
        return { score: maxEval, index: bestMove };
    } else {
        let minEval = Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = humanPlayer === 'cross' ? 1 : -1;
                const eval = minimax(newBoard, depth + 1, alpha, beta, true).score;
                newBoard[i] = null;
                if (eval < minEval) {
                    minEval = eval;
                    bestMove = i;
                }
                beta = Math.min(beta, eval);
                searchParameters.push({ depth, index: i, alpha, beta, eval, isMaximizingPlayer });
                if (beta <= alpha) {
                    break; //Coupure alpha-bêta basé sur algo minmax
                }
            }
        }
        return { score: minEval, index: bestMove };
    }
}

function evaluateBoard(board) {
    for (const combo of winningCombinations) {
        const sum = combo.reduce((acc, index) => acc + (board[index] || 0), 0);
        if (sum === 3) {
            return aiPlayer === 'cross' ? 1 : -1; // l'IA gagne
        } else if (sum === -3) {
            return aiPlayer === 'cross' ? -1 : 1; // joueur gagne
        }
    }
    if (board.every(cell => cell !== null)) {
        return 0; // Match nul
    }
    return null; // Partie encore en cours
}

function displaySearchParameters() {
    const table = document.getElementById('searchParametersTable');
    table.innerHTML = '';
    const headerRow = document.createElement('tr');
    const headers = ['Profondeur', 'Index', 'α (Alpha)', 'β (Beta)', 'Évaluation', 'Maximisant'];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    searchParameters.forEach(param => {
        const row = document.createElement('tr');
        const cells = [param.depth, param.index, param.alpha, param.beta, param.eval, param.isMaximizingPlayer];
        cells.forEach(text => {
            const td = document.createElement('td');
            td.textContent = text;
            row.appendChild(td);
        });
        table.appendChild(row);
    });
}

function checkForWinner() {
    let winner = null;
    winningCombinations.forEach(combination => {
        const [a, b, c] = combination;
        // Vérifie si une combinaison gagnante est remplie
        if (board[a] === board[b] && board[b] === board[c] && board[a] !== null) {
            winner = board[a] === 1 ? 'Croix' : 'Rond';
        }
    });

    if (winner) {
        resultDisplay.textContent = `${winner} a gagner 🎉`;
        disableGrid();
        return true;
    } else if (board.every(cell => cell !== null)) {
        resultDisplay.textContent = "Match nul :(";
        return true;
    }
    return false;
}

function disableGrid() {
    cells.forEach(cell => {
        cell.removeEventListener("click", handleCellClick);
    });
}

function resetGrid() {
    cells.forEach(cell => {
        cell.src = emptyImgSrc;
        cell.addEventListener("click", handleCellClick);
    });
    board.fill(null);
    searchParameters = [];
    resultDisplay.textContent = "";
    currentPlayer = null;
    aiPlayer = null;
    humanPlayer = null;
    const table = document.getElementById('searchParametersTable');
    table.innerHTML = '';
}

selectCross.addEventListener("click", () => {
    humanPlayer = 'cross';
    aiPlayer = 'circle';
    currentPlayer = humanPlayer;
    resultDisplay.textContent = "La Croix (vous) commence 🚀";
});

selectCircle.addEventListener("click", () => {
    humanPlayer = 'circle';
    aiPlayer = 'cross';
    currentPlayer = aiPlayer;
    resultDisplay.textContent = "Le Rond (vous) commence 🚀";
    aiMakeMove(); //l"ia" commence si le joueur choisit les ronds
});

resetButton.addEventListener("click", resetGrid);

initializeGrid();