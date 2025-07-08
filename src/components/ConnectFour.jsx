import React, { useState } from "react";

const BOARD_ROWS = 6;
const BOARD_COLS = 7;

const ConnectFour = ({ onClose }) => {
  const [board, setBoard] = useState(
    Array(BOARD_ROWS)
      .fill()
      .map(() => Array(BOARD_COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState("white");
  const [gameWon, setGameWon] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameDraw, setGameDraw] = useState(false);

  const checkWinner = (board, row, col, player) => {
    // Check horizontal
    let count = 1;
    for (let i = col - 1; i >= 0 && board[row][i] === player; i--) count++;
    for (let i = col + 1; i < BOARD_COLS && board[row][i] === player; i++)
      count++;
    if (count >= 4) return true;

    // Check vertical
    count = 1;
    for (let i = row - 1; i >= 0 && board[i][col] === player; i--) count++;
    for (let i = row + 1; i < BOARD_ROWS && board[i][col] === player; i++)
      count++;
    if (count >= 4) return true;

    // Check diagonal (top-left to bottom-right)
    count = 1;
    for (
      let i = 1;
      row - i >= 0 && col - i >= 0 && board[row - i][col - i] === player;
      i++
    )
      count++;
    for (
      let i = 1;
      row + i < BOARD_ROWS &&
      col + i < BOARD_COLS &&
      board[row + i][col + i] === player;
      i++
    )
      count++;
    if (count >= 4) return true;

    // Check diagonal (top-right to bottom-left)
    count = 1;
    for (
      let i = 1;
      row - i >= 0 &&
      col + i < BOARD_COLS &&
      board[row - i][col + i] === player;
      i++
    )
      count++;
    for (
      let i = 1;
      row + i < BOARD_ROWS &&
      col - i >= 0 &&
      board[row + i][col - i] === player;
      i++
    )
      count++;
    if (count >= 4) return true;

    return false;
  };

  const checkDraw = (board) => {
    return board[0].every((cell) => cell !== null);
  };

  const dropToken = (col) => {
    if (gameWon || gameDraw) return;

    // Find the lowest empty row in the selected column
    let row = BOARD_ROWS - 1;
    while (row >= 0 && board[row][col] !== null) {
      row--;
    }

    if (row < 0) return; // Column is full

    // Create new board with the dropped token
    const newBoard = board.map((row) => [...row]);
    newBoard[row][col] = currentPlayer;

    setBoard(newBoard);

    // Check for winner
    if (checkWinner(newBoard, row, col, currentPlayer)) {
      setGameWon(true);
      setWinner(currentPlayer);
      return;
    }

    // Check for draw
    if (checkDraw(newBoard)) {
      setGameDraw(true);
      return;
    }

    // Switch players
    setCurrentPlayer(currentPlayer === "white" ? "green" : "white");
  };

  const newGame = () => {
    setBoard(
      Array(BOARD_ROWS)
        .fill()
        .map(() => Array(BOARD_COLS).fill(null))
    );
    setCurrentPlayer("white");
    setGameWon(false);
    setWinner(null);
    setGameDraw(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 p-2 sm:p-4 rounded-lg shadow-xl relative flex flex-col items-center w-full max-w-[700px] min-w-[320px]">
        <div className="w-full flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg mb-1 px-2"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent text-center w-full">
          Connect Four
        </h2>

        {/* Game status */}
        <div className="mb-4 text-center">
          {!gameWon && !gameDraw && (
            <div className="text-lg text-gray-300">
              Current Player:
              <span
                className={`ml-2 px-3 py-1 rounded-full font-bold ${
                  currentPlayer === "white"
                    ? "bg-white text-gray-800"
                    : "bg-green-500 text-black"
                }`}
              >
                {currentPlayer === "white" ? "White" : "Green"}
              </span>
            </div>
          )}
          {gameWon && (
            <div className="text-2xl font-bold text-bright-green">
              {winner === "white" ? "White" : "Green"} Wins!
            </div>
          )}
          {gameDraw && (
            <div className="text-2xl font-bold text-gray-400">It's a Draw!</div>
          )}
        </div>

        {/* Game board */}
        <div className="bg-gray-600 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-7 gap-1">
            {/* Column headers (drop zones) */}
            {Array(BOARD_COLS)
              .fill()
              .map((_, col) => (
                <button
                  key={`header-${col}`}
                  onClick={() => dropToken(col)}
                  disabled={gameWon || gameDraw}
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded-full opacity-30"></div>
                  </div>
                </button>
              ))}

            {/* Board cells */}
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center"
                >
                  {cell && (
                    <div
                      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${
                        cell === "white" ? "bg-white" : "bg-green-500"
                      } shadow-lg`}
                    ></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* New Game button */}
        <button
          onClick={newGame}
          className="px-4 py-2 bg-gradient-to-r from-bright-green to-emerald-600 text-dark-grey rounded-md border border-bright-green hover:from-emerald-600 hover:to-bright-green transition-all duration-300 shadow-[0_0_10px_rgba(0,204,126,0.3)]"
        >
          New Game
        </button>

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-gray-300">
          <p>Click on a column to drop your token</p>
          <p>Connect four tokens in a row to win!</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectFour;
