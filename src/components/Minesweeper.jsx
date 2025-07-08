// src/components/Minesweeper.jsx
import React, { useState, useEffect } from "react";

const numRows = 20;
const numCols = 40;
const numMines = 165; // Adjust number of mines for a 40x20 grid

const createEmptyBoard = (rows, cols) => {
  return Array.from({ length: rows }).map((_, rowIndex) =>
    Array.from({ length: cols }).map((_, colIndex) => ({
      row: rowIndex,
      col: colIndex,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
    }))
  );
};

const plantMines = (board, rows, cols, mines) => {
  let minesPlanted = 0;
  while (minesPlanted < mines) {
    const randomRow = Math.floor(Math.random() * rows);
    const randomCol = Math.floor(Math.random() * cols);
    if (!board[randomRow][randomCol].isMine) {
      board[randomRow][randomCol].isMine = true;
      minesPlanted++;
    }
  }
  return board;
};

const getNeighbors = (board, row, col) => {
  const neighbors = [];
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
      neighbors.push(board[newRow][newCol]);
    }
  }
  return neighbors;
};

const calculateNeighborMines = (board) => {
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (!board[r][c].isMine) {
        const neighbors = getNeighbors(board, r, c);
        const mineCount = neighbors.filter(
          (neighbor) => neighbor.isMine
        ).length;
        board[r][c].neighborMines = mineCount;
      }
    }
  }
  return board;
};

const revealCell = (board, row, col) => {
  const newBoard = board.map((row) => [...row]); // Create a deep copy
  const cell = newBoard[row][col];

  if (cell.isRevealed || cell.isFlagged) return board;

  cell.isRevealed = true;

  if (cell.isMine) {
    // Game over logic will be handled in the component
    return newBoard;
  }

  if (cell.neighborMines === 0) {
    const neighbors = getNeighbors(newBoard, row, col);
    neighbors.forEach((neighbor) => {
      if (!neighbor.isRevealed && !neighbor.isMine) {
        revealCell(newBoard, neighbor.row, neighbor.col);
      }
    });
  }

  return newBoard;
};

const Minesweeper = ({ onClose }) => {
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    let newBoard = createEmptyBoard(numRows, numCols);
    newBoard = plantMines(newBoard, numRows, numCols, numMines);
    newBoard = calculateNeighborMines(newBoard);

    // Find a safe space to reveal
    let safeRow, safeCol;
    do {
      safeRow = Math.floor(Math.random() * numRows);
      safeCol = Math.floor(Math.random() * numCols);
    } while (
      newBoard[safeRow][safeCol].isMine ||
      newBoard[safeRow][safeCol].neighborMines > 0
    );

    // Reveal the safe space
    newBoard = revealCell(newBoard, safeRow, safeCol);

    setBoard(newBoard);
    setGameOver(false);
    setGameWon(false);
  };

  const handleCellClick = (row, col) => {
    if (gameOver || gameWon) return;

    const newBoard = revealCell(board, row, col);
    setBoard(newBoard);

    if (newBoard[row][col].isMine) {
      setGameOver(true);
      revealAllMines(newBoard);
    } else {
      checkWin(newBoard);
    }
  };

  const handleContextMenu = (event, row, col) => {
    event.preventDefault();
    if (gameOver || gameWon) return;

    const newBoard = board.map((row) => [...row]);
    const cell = newBoard[row][col];

    if (!cell.isRevealed) {
      cell.isFlagged = !cell.isFlagged;
      setBoard(newBoard);
      checkWin(newBoard);
    }
  };

  const checkWin = (currentBoard) => {
    const hiddenCells = currentBoard.flat().filter((cell) => !cell.isRevealed);
    const flaggedMines = currentBoard
      .flat()
      .filter((cell) => cell.isMine && cell.isFlagged);

    if (hiddenCells.length === numMines && flaggedMines.length === numMines) {
      setGameWon(true);
      revealAllMines(currentBoard);
    }
  };

  const revealAllMines = (currentBoard) => {
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard.flat().forEach((cell) => {
      if (cell.isMine) {
        cell.isRevealed = true;
      }
    });
    setBoard(newBoard);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent">
            Minesweeper
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Minesweeper board */}
        <div
          className={`gap-px mx-auto`}
          style={{
            display: "grid", // Ensure display is grid
            gridTemplateColumns: `repeat(${numCols}, 21px)`, // Explicitly set 40 columns of 21px
            width: `${numCols * 21 + (numCols - 1) * 1}px`, // Calculate grid width based on cell size and gap
          }}
        >
          {board.flat().map((cell, index) => (
            <div
              key={index}
              className={`w-[21px] h-[21px] flex items-center justify-center text-sm font-bold cursor-pointer rounded-[2px]
                ${
                  cell.isRevealed
                    ? cell.isMine
                      ? "bg-red-500 text-white" // Mine color
                      : "bg-gray-300 text-bright-green" // Revealed cell color with green numbers
                    : "bg-gray-600 hover:bg-gray-500 text-transparent" // Hidden cell color
                }
                ${cell.isFlagged ? "text-red-500" : ""} // Flag color
              `}
              onClick={() => handleCellClick(cell.row, cell.col)}
              onContextMenu={(e) => handleContextMenu(e, cell.row, cell.col)}
            >
              {
                cell.isRevealed
                  ? cell.isMine
                    ? "💣" // Mine symbol
                    : cell.neighborMines > 0
                    ? cell.neighborMines
                    : "" // Number of neighbor mines or empty
                  : cell.isFlagged
                  ? "🚩" // Flag symbol
                  : "" // Hidden cell content
              }
            </div>
          ))}
        </div>

        {/* Game Status and Restart Button */}
        <div className="mt-4 text-center">
          {gameOver && (
            <p className="text-red-500 font-bold mb-2">Game Over!</p>
          )}
          {gameWon && (
            <p className="text-bright-green font-bold mb-2">You Win!</p>
          )}
          <button
            onClick={initializeGame} // Call initializeGame to restart
            className="px-3 py-1 bg-transparent border border-white rounded-md transition-colors hover:bg-gray-700/50"
          >
            <span className="bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent text-sm">
              Restart
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Minesweeper;
