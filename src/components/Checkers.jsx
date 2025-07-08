import { useState, useEffect } from "react";

const Checkers = ({ onClose }) => {
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(
    Math.random() < 0.5 ? "light" : "black"
  );
  const [validMoves, setValidMoves] = useState([]);
  const [jumpingPiece, setJumpingPiece] = useState(null);
  const [transformingPiece, setTransformingPiece] = useState(null);

  const initializeBoard = () => {
    const newBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Place black pieces
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 === 1) {
          newBoard[i][j] = "black";
        }
      }
    }

    // Place light pieces
    for (let i = 5; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 === 1) {
          newBoard[i][j] = "light";
        }
      }
    }

    return newBoard;
  };

  const handleRestart = () => {
    setBoard(initializeBoard());
    setSelectedPiece(null);
    setCurrentPlayer(Math.random() < 0.5 ? "light" : "black");
    setValidMoves([]);
    setJumpingPiece(null);
    setTransformingPiece(null);
  };

  useEffect(() => {
    setBoard(initializeBoard());
  }, []);

  const getValidMoves = (row, col, checkForJumpsOnly = false) => {
    const moves = [];
    const piece = board[row][col];
    const isKing = piece.includes("king");
    const opponent = piece.includes("light") ? "black" : "light";

    // Kings can move in both directions, regular pieces only forward
    const directions = isKing ? [-1, 1] : piece.includes("light") ? [-1] : [1];

    // Check for jumps
    for (const dir of directions) {
      for (const colDir of [-1, 1]) {
        const jumpRow = row + dir * 2;
        const jumpCol = col + colDir * 2;
        const middleRow = row + dir;
        const middleCol = col + colDir;

        if (
          jumpRow >= 0 &&
          jumpRow < 8 &&
          jumpCol >= 0 &&
          jumpCol < 8 &&
          board[middleRow][middleCol]?.includes(opponent) &&
          !board[jumpRow][jumpCol]
        ) {
          moves.push({ row: jumpRow, col: jumpCol, isJump: true });
        }
      }
    }

    // If only checking for jumps, return here
    if (checkForJumpsOnly) {
      return moves;
    }

    // Check regular moves
    for (const dir of directions) {
      for (const colDir of [-1, 1]) {
        const newRow = row + dir;
        const newCol = col + colDir;

        if (
          newRow >= 0 &&
          newRow < 8 &&
          newCol >= 0 &&
          newCol < 8 &&
          !board[newRow][newCol]
        ) {
          moves.push({ row: newRow, col: newCol, isJump: false });
        }
      }
    }

    return moves;
  };

  const handleCellClick = (row, col) => {
    // If we're in the middle of a jumping sequence
    if (jumpingPiece) {
      const move = validMoves.find(
        (move) => move.row === row && move.col === col
      );

      if (move) {
        const newBoard = [...board];
        const piece = newBoard[jumpingPiece.row][jumpingPiece.col];

        // Clear valid moves immediately after a successful jump
        setValidMoves([]);

        // Check if the piece should become a king
        if (
          !piece.includes("king") && // Only check for king if not already a king
          ((piece.includes("light") && row === 0) ||
            (piece.includes("black") && row === 7))
        ) {
          setTransformingPiece({
            row,
            col,
            piece: `king-${piece.split("-")[0]}`,
          });
          setTimeout(() => {
            newBoard[row][col] = `king-${piece.split("-")[0]}`;
            newBoard[jumpingPiece.row][jumpingPiece.col] = null;
            setBoard(newBoard);
            setTransformingPiece(null);
            // Check for additional jumps after transformation
            const additionalJumps = getValidMoves(row, col, true);
            if (additionalJumps.length > 0) {
              setJumpingPiece({ row, col });
              setValidMoves(additionalJumps);
            } else {
              setJumpingPiece(null);
              setValidMoves([]);
              setSelectedPiece(null);
              setCurrentPlayer(currentPlayer === "light" ? "black" : "light");
            }
          }, 1000);
        } else {
          newBoard[row][col] = piece;
          newBoard[jumpingPiece.row][jumpingPiece.col] = null;

          // Remove the captured piece
          const capturedRow = (jumpingPiece.row + row) / 2;
          const capturedCol = (jumpingPiece.col + col) / 2;
          newBoard[capturedRow][capturedCol] = null;

          setBoard(newBoard);

          // Check for additional jumps from the new position
          const additionalJumps = getValidMoves(row, col, true);
          if (additionalJumps.length > 0) {
            setJumpingPiece({ row, col });
            setValidMoves(additionalJumps);
          } else {
            // End of a jump sequence (no more jumps possible)
            setJumpingPiece(null);
            setValidMoves([]);
            setSelectedPiece(null);
            setCurrentPlayer(currentPlayer === "light" ? "black" : "light");
          }
        }
      } else {
        // If clicked on an invalid move during jump sequence, deselect the jumping piece and clear valid moves
        // The turn DOES NOT change here.
        setJumpingPiece(null);
        setValidMoves([]);
        setSelectedPiece(null); // Also deselect the piece
      }
      return;
    }

    // Normal piece selection and movement
    if (selectedPiece) {
      const move = validMoves.find(
        (move) => move.row === row && move.col === col
      );

      if (move) {
        const newBoard = [...board];
        const piece = newBoard[selectedPiece.row][selectedPiece.col];

        // Clear valid moves immediately after making a move
        setValidMoves([]);

        // Check if the piece should become a king
        if (
          !piece.includes("king") && // Only check for king if not already a king
          ((piece.includes("light") && row === 0) ||
            (piece.includes("black") && row === 7))
        ) {
          setTransformingPiece({
            row,
            col,
            piece: `king-${piece.split("-")[0]}`,
          });
          setTimeout(() => {
            newBoard[row][col] = `king-${piece.split("-")[0]}`;
            newBoard[selectedPiece.row][selectedPiece.col] = null;
            setBoard(newBoard);
            setTransformingPiece(null);
            setSelectedPiece(null);
            setValidMoves([]);
            setCurrentPlayer(currentPlayer === "light" ? "black" : "light");
          }, 1000);
        } else {
          newBoard[row][col] = piece;
          newBoard[selectedPiece.row][selectedPiece.col] = null;

          if (move.isJump) {
            // Remove the captured piece
            const capturedRow = (selectedPiece.row + row) / 2;
            const capturedCol = (selectedPiece.col + col) / 2;
            newBoard[capturedRow][capturedCol] = null;

            setBoard(newBoard);

            // Check for additional jumps
            const additionalJumps = getValidMoves(row, col, true);
            if (additionalJumps.length > 0) {
              setJumpingPiece({ row, col });
              setValidMoves(additionalJumps);
              setSelectedPiece(null);
            } else {
              // End of a jump sequence (a single jump or no more jumps possible)
              setJumpingPiece(null);
              setSelectedPiece(null);
              setValidMoves([]);
              setCurrentPlayer(currentPlayer === "light" ? "black" : "light");
            }
          } else {
            // Regular move completes the turn
            setBoard(newBoard);
            setSelectedPiece(null);
            setValidMoves([]);
            setCurrentPlayer(currentPlayer === "light" ? "black" : "light");
          }
        }
      } else {
        // If clicked on an invalid move after selecting a piece, deselect the piece and clear valid moves
        // The turn DOES NOT change here.
        setSelectedPiece(null);
        setValidMoves([]);
      }
    } else if (board[row][col]?.includes(currentPlayer)) {
      // When selecting a piece, show all valid moves (both jumps and regular moves)
      setSelectedPiece({ row, col });
      setValidMoves(getValidMoves(row, col));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent">
            Checkers
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="relative">
          <div className="grid grid-cols-8 gap-0 w-[400px] h-[400px] border-2 border-gray-600">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-full h-full flex items-center justify-center cursor-pointer
                    ${
                      (rowIndex + colIndex) % 2 === 0
                        ? "bg-gray-700"
                        : "bg-gray-600"
                    }
                    ${
                      (selectedPiece?.row === rowIndex &&
                        selectedPiece?.col === colIndex) ||
                      (jumpingPiece?.row === rowIndex &&
                        jumpingPiece?.col === colIndex)
                        ? "ring-2 ring-bright-green"
                        : ""
                    }
                    ${
                      validMoves.some(
                        (move) => move.row === rowIndex && move.col === colIndex
                      )
                        ? "ring-2 ring-emerald-500"
                        : ""
                    }
                  `}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell && (
                    <div className="relative w-4/5 h-4/5">
                      <div
                        className={`
                          w-full h-full rounded-full
                          ${
                            cell.includes("light")
                              ? "bg-gradient-to-r from-gray-200 to-gray-300"
                              : "bg-gradient-to-r from-gray-800 to-gray-900"
                          }
                          shadow-lg
                        `}
                      />
                      {cell.includes("king") && (
                        <div
                          className={`
                            absolute inset-0 flex items-center justify-center
                            ${
                              cell.includes("light")
                                ? "text-gray-800"
                                : "text-gray-200"
                            }
                          `}
                        >
                          <svg
                            className="w-1/2 h-1/2"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2L8 8H16L12 2Z" />
                            <path d="M12 22L8 16H16L12 22Z" />
                            <path d="M2 12L8 8V16L2 12Z" />
                            <path d="M22 12L16 8V16L22 12Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <button
            onClick={handleRestart}
            className="absolute -bottom-10 left-0 px-3 py-1 bg-transparent border border-white rounded-md transition-colors hover:bg-gray-700/50"
          >
            <span className="bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent text-sm">
              Restart
            </span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-300">
            Current Player:{" "}
            <span className="bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent">
              {currentPlayer === "light" ? "Light" : "Black"}
            </span>
          </p>
        </div>
      </div>
      {transformingPiece && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <div
            className={`absolute inset-0 rounded-full ${
              transformingPiece.piece.includes("light")
                ? "bg-gray-100"
                : "bg-gray-600"
            } bg-opacity-40 animate-pulse`}
          />
          <div
            className={`absolute inset-0 rounded-full ${
              transformingPiece.piece.includes("light")
                ? "bg-gradient-to-r from-gray-100 to-gray-200"
                : "bg-gradient-to-r from-gray-600 to-gray-700"
            } animate-ping opacity-40`}
          />
        </div>
      )}
    </div>
  );
};

export default Checkers;
