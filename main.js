document.addEventListener('DOMContentLoaded', () => {
    let gameBoard = Array(9).fill(null);
    let isGameOver = false;
    let currentPlayer = 'X';
    let isSinglePlayer = true;
    let aiDifficulty = 'hard';
    let playerXName = localStorage.getItem('playerXName') || 'Player X';
    let playerOName = localStorage.getItem('playerOname') || 'Player O';
    let scoreX = parseInt(localStorage.getItem('scoreX')) || 0;
    let scoreO = parseInt(localStorage.getItem('scoreO')) || 0;

    const board = document.querySelector('.board');
    const statusElement = document.getElementById('status');
    const gameButton = document.getElementById('gameButton');
    const playerXInput = document.getElementById('playerX');
    const playerOInput = document.getElementById('playerO');
    const scoreXElement = document.getElementById('scoreX');
    const scoreOElement = document.getElementById('scoreO');
    const aiToggle = document.getElementById('aiToggle');
    const toggleBtn = document.querySelector('.dark-mode-toggle');
    const resetBtn = document.getElementById('resetBtn');
    const difficultySelect = document.getElementById('difficultySelect');

    // Initialize inputs and scores from localStorage
    playerXInput.value = playerXName === 'Player X' ? '' : playerXName;
    playerOInput.value = playerOName === 'Player O' ? '' : playerOName;
    updateScoreboard();

    // Dark mode toggle functionality
    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = toggleBtn.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });

    // Event listeners for player names
    playerXInput.addEventListener('input', updatePlayerNames);
    playerOInput.addEventListener('input', updatePlayerNames);

    // AI Toggle and difficulty selection
    aiToggle.addEventListener('change', () => {
        isSinglePlayer = aiToggle.checked;
        updatePlayerNames();
        startGameOrRestartGame();
    });

    difficultySelect.addEventListener('change', () => {
        aiDifficulty = difficultySelect.value;
    });

    // Game controls
    gameButton.addEventListener('click', startGameOrRestartGame);
    resetBtn.addEventListener('click', () => {
        scoreX = 0;
        scoreO = 0;
        localStorage.setItem('scoreX', '0');
        localStorage.setItem('scoreO', '0');
        updateScoreboard();
        startGameOrRestartGame();
    });

    function createBoard() {
        board.innerHTML = '';
        gameBoard = Array(9).fill(null);
        isGameOver = false;
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', handleClick);
            board.appendChild(cell);
        }
        updateStatus(`Current Turn: ${currentPlayer}`);
    }

    function updatePlayerNames() {
        playerXName = playerXInput.value.trim() || 'Player X';
        playerOName = isSinglePlayer ? 'AI' : (playerOInput.value.trim() || 'Player O');
        
        document.querySelector('.score-x-label').innerText = `${playerXName}: ${scoreX}`;
        document.querySelector('.score-o-label').innerText = `${playerOName}: ${scoreO}`;
    }

    function updateScoreboard() {
        scoreXElement.innerText = scoreX;
        scoreOElement.innerText = scoreO;
        localStorage.setItem('scoreX', scoreX);
        localStorage.setItem('scoreO', scoreO);
    }

    function handleClick(e) {
        if (isGameOver) return;
        const index = e.target.dataset.index;
        
        if (gameBoard[index] !== null) return;
        
        makeMove(index);
        
        if (isGameOver) {
            checkWinner();
        } else {
            switchPlayer();
            if (isSinglePlayer && currentPlayer === 'O') {
                setTimeout(aiMove, 300);
            }
        }
    }

    function makeMove(index) {
        gameBoard[index] = currentPlayer;
        const cell = document.querySelector(`.cell[data-index='${index}']`);
        cell.innerText = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase(), 'bounce');
        checkWinner();
    }

    function aiMove() {
        if (aiDifficulty === 'easy') {
            const empty = gameBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
            if (empty.length > 0) {
                const move = empty[Math.floor(Math.random() * empty.length)];
                makeMove(move);
                if (!isGameOver) switchPlayer();
            }
        } else {
            let bestScore = -Infinity;
            let move;
            for (let i = 0; i < gameBoard.length; i++) {
                if (gameBoard[i] === null) {
                    gameBoard[i] = 'O';
                    let score = minimax(gameBoard, 0, false);
                    gameBoard[i] = null;
                    if (score > bestScore) {
                        bestScore = score;
                        move = i;
                    }
                }
            }
            if (move !== undefined) {
                makeMove(move);
            }
            if (!isGameOver) switchPlayer();
        }
    }

    // Minimax algorithm implementation for AI
    function minimax(board, depth, isMaximizing) {
        const result = evaluateBoard(board);
        if (result !== null) {
            return result;
        }

        if (isMaximizing) {
            let best = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = null;
                    best = Math.max(score, best);
                }
            }
            return best;
        } else {
            let best = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = null;
                    best = Math.min(score, best);
                }
            }
            return best;
        }
    }

    function evaluateBoard(board) {
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of wins) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                if (board[a] === 'X') return -10;
                if (board[a] === 'O') return 10;
            }
        }

        if (!board.includes(null)) return 0; // It's a draw
        return null;
    }

    function checkWinner() {
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of wins) {
            if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                isGameOver = true;
                highlightWinningCells([a, b, c]);
                const winnerName = (gameBoard[a] === 'X') ? playerXName : playerOName;
                updateStatus(`${winnerName} Wins! 🎉`);
                updateScore(gameBoard[a]);
                gameButton.innerText = 'Restart Game';
                return;
            }
        }

        if (!gameBoard.includes(null)) {
            isGameOver = true;
            updateStatus("It's a Draw! 🤝");
            gameButton.innerText = 'Restart Game';
        }
    }

    function updateScore(player) {
        if (player === 'X') {
            scoreX++;
        } else {
            scoreO++;
        }
        updateScoreboard();
    }

    function highlightWinningCells(cells) {
        cells.forEach(index => {
            document.querySelector(`.cell[data-index='${index}']`).classList.add('winning-cell');
        });
    }

    function switchPlayer() {
        currentPlayer = (currentPlayer === 'X' ? 'O' : 'X');
        const playerTurnName = (currentPlayer === 'X' ? playerXName : playerOName);
        updateStatus(`Current Turn: ${playerTurnName}`);
    }

    function updateStatus(msg) {
        statusElement.innerText = msg;
    }

    function startGameOrRestartGame() {
        isGameOver = false;
        currentPlayer = 'X';
        gameButton.innerText = 'Restart Game';
        createBoard();
        updatePlayerNames();
        
        // If AI is enabled and it's O's turn (which shouldn't happen at start, but good practice)
        if (isSinglePlayer && currentPlayer === 'O') {
            setTimeout(aiMove, 300);
        }
    }

    // Initial setup
    createBoard();
    updatePlayerNames();
});