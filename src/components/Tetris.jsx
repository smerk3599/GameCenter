import React, { useEffect, useRef, useState } from "react";

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 28;
const COLORS = ["#00cc7e", "#059669"];

// Tetromino shapes
const SHAPES = [
  // I
  [[1, 1, 1, 1]],
  // O
  [
    [1, 1],
    [1, 1],
  ],
  // T
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  // S
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  // Z
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  // J
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  // L
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
];

function randomShape() {
  const idx = Math.floor(Math.random() * SHAPES.length);
  return { shape: SHAPES[idx], colorIdx: Math.floor(Math.random() * 2) };
}

function rotate(shape) {
  return shape[0].map((_, i) => shape.map((row) => row[i]).reverse());
}

const START_COL = 3;
const START_ROW = 0;

const Tetris = ({ onClose }) => {
  const [board, setBoard] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState(null); // { shape, colorIdx, row, col }
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [dropInterval, setDropInterval] = useState(500);
  const intervalRef = useRef();
  const speedupTimerRef = useRef();

  // Spawn a new tetromino at the top center
  const spawn = () => {
    const { shape, colorIdx } = randomShape();
    const piece = { shape, colorIdx, row: START_ROW, col: START_COL };
    // Check for game over
    if (!canMove(piece, board)) {
      setGameOver(true);
      clearInterval(intervalRef.current);
      return;
    }
    setCurrentPiece(piece);
  };

  // Check if a piece can move to a position
  const canMove = (piece, b) => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[0].length; c++) {
        if (piece.shape[r][c]) {
          const newRow = piece.row + r;
          const newCol = piece.col + c;
          if (
            newRow < 0 ||
            newRow >= ROWS ||
            newCol < 0 ||
            newCol >= COLS ||
            b[newRow][newCol] !== null
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Merge current piece into the board
  const merge = (piece) => {
    const newBoard = board.map((row) => [...row]);
    piece.shape.forEach((rowArr, r) => {
      rowArr.forEach((cell, c) => {
        if (cell) {
          newBoard[piece.row + r][piece.col + c] = piece.colorIdx;
        }
      });
    });
    setBoard(newBoard);
    clearLines(newBoard);
    setCurrentPiece(null); // Signal to spawn a new piece
  };

  // Clear completed lines
  const clearLines = (b) => {
    let lines = 0;
    const newBoard = b.filter((row) => {
      if (row.every((cell) => cell !== null)) {
        lines++;
        return false;
      }
      return true;
    });
    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(null));
    }
    if (lines > 0) setScore((s) => s + lines * 100);
    setBoard(newBoard);
  };

  // Game loop and piece spawning
  useEffect(() => {
    if (gameOver) return;
    if (!currentPiece) {
      spawn();
      return;
    }
    intervalRef.current = setInterval(() => {
      setCurrentPiece((piece) => {
        if (!piece) return piece;
        const next = { ...piece, row: piece.row + 1 };
        if (canMove(next, board)) {
          return next;
        } else {
          merge(piece);
          return null;
        }
      });
    }, dropInterval);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, [currentPiece, board, gameOver, dropInterval]);

  // Speed up every 20 seconds
  useEffect(() => {
    if (gameOver) return;
    speedupTimerRef.current = setInterval(() => {
      setDropInterval((prev) => Math.max(100, prev - 20));
    }, 20000);
    return () => clearInterval(speedupTimerRef.current);
  }, [gameOver]);

  // Controls
  useEffect(() => {
    const handleKey = (e) => {
      if (!currentPiece || gameOver) return;
      if (e.key === "ArrowLeft") {
        const next = { ...currentPiece, col: currentPiece.col - 1 };
        if (canMove(next, board)) setCurrentPiece(next);
      } else if (e.key === "ArrowRight") {
        const next = { ...currentPiece, col: currentPiece.col + 1 };
        if (canMove(next, board)) setCurrentPiece(next);
      } else if (e.key === "ArrowDown") {
        const next = { ...currentPiece, row: currentPiece.row + 1 };
        if (canMove(next, board)) setCurrentPiece(next);
        else merge(currentPiece);
      } else if (e.key === "ArrowUp") {
        const rotated = { ...currentPiece, shape: rotate(currentPiece.shape) };
        if (canMove(rotated, board)) setCurrentPiece(rotated);
      } else if (e.key === " ") {
        // Hard drop
        let dropPiece = { ...currentPiece };
        while (canMove({ ...dropPiece, row: dropPiece.row + 1 }, board)) {
          dropPiece = { ...dropPiece, row: dropPiece.row + 1 };
        }
        merge(dropPiece); // Only merge, do not setCurrentPiece, to avoid state conflicts
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPiece, board, gameOver]);

  // Modal close resets game
  const handleClose = () => {
    setGameOver(false);
    setScore(0);
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setCurrentPiece(null);
    setDropInterval(500);
    onClose();
  };

  // New Game button handler
  const handleNewGame = () => {
    setGameOver(false);
    setScore(0);
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setCurrentPiece(null);
    setDropInterval(500);
  };

  // Draw the board
  const drawBoard = () => {
    const display = board.map((row) => [...row]);
    if (currentPiece) {
      currentPiece.shape.forEach((rowArr, r) => {
        rowArr.forEach((cell, c) => {
          if (cell) {
            const dRow = currentPiece.row + r;
            const dCol = currentPiece.col + c;
            if (dRow >= 0 && dRow < ROWS && dCol >= 0 && dCol < COLS) {
              display[dRow][dCol] = currentPiece.colorIdx;
            }
          }
        });
      });
    }
    return display;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl relative flex flex-col items-center">
        <div className="w-full flex justify-end">
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-lg mb-1 px-2"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent text-center w-full">
          Tetris
        </h2>
        <div
          className="p-2 border rounded-xl border-amber-700 bg-black flex flex-col items-center justify-center"
          style={{
            width: COLS * BLOCK_SIZE + 16,
            height: ROWS * BLOCK_SIZE + 16,
          }}
        >
          <div
            className="bg-black rounded-lg flex flex-col items-center justify-center"
            style={{ width: COLS * BLOCK_SIZE, height: ROWS * BLOCK_SIZE }}
          >
            {drawBoard().map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => (
                  <div
                    key={c}
                    style={{
                      width: BLOCK_SIZE,
                      height: BLOCK_SIZE,
                      background:
                        cell !== null ? COLORS[(r + c) % 2] : "transparent",
                      border:
                        cell !== null ? "2px solid #222" : "1px solid #222",
                    }}
                    className="transition-colors duration-200"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-lg text-white">
          Score: <span className="text-bright-green font-bold">{score}</span>
        </div>
        {gameOver && (
          <div className="mt-4 text-center text-red-400 font-bold text-xl">
            Game Over
          </div>
        )}
        <div className="mt-2 text-gray-400 text-sm">
          Use arrow keys to play. Space for hard drop.
        </div>
        <button
          onClick={handleNewGame}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-bright-green to-emerald-600 text-dark-grey rounded-md border border-bright-green hover:from-emerald-600 hover:to-bright-green transition-all duration-300 shadow-[0_0_10px_rgba(0,204,126,0.3)]"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default Tetris;
