import React, { useState, useEffect } from "react";

const BOARD_SIZE = 24;
const INITIAL_POSITIONS = {
  // Player 1 (light grey) pieces
  23: 2, // 2 pieces on point 24
  12: 5, // 5 pieces on point 13
  7: 3, // 3 pieces on point 8
  5: 5, // 5 pieces on point 6

  // Player 2 (green) pieces
  0: 2, // 2 pieces on point 1
  11: 5, // 5 pieces on point 12
  16: 3, // 3 pieces on point 17
  18: 5, // 5 pieces on point 19
};

const Backgammon = ({ onClose }) => {
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [dice, setDice] = useState([1, 1]);
  const [validMoves, setValidMoves] = useState([]);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [availableDice, setAvailableDice] = useState([]);
  const [player1Bar, setPlayer1Bar] = useState(0); // Light grey pieces on the bar
  const [player2Bar, setPlayer2Bar] = useState(0); // Green pieces on the bar
  const [player1BorneOff, setPlayer1BorneOff] = useState(0); // Light grey pieces borne off
  const [player2BorneOff, setPlayer2BorneOff] = useState(0); // Green pieces borne off
  const [winner, setWinner] = useState(null); // null, 1, or -1
  const [noMovesAvailable, setNoMovesAvailable] = useState(false); // Indicates if the current player has no valid moves

  useEffect(() => {
    initializeBoard();
    // Check for initial no moves for the starting player
    const checkInitialNoMoves = (player) => {
      const playerHasPieceOnBar =
        player === 1 ? player1Bar > 0 : player2Bar > 0;
      if (playerHasPieceOnBar) {
        return getValidMoves(-1).length === 0;
      } else {
        for (let i = 0; i < BOARD_SIZE; i++) {
          if (Math.sign(board[i]) === player) {
            if (getValidMoves(i).length > 0) {
              return false; // Found at least one valid move
            }
          }
        }
        return true; // No valid moves found for any piece on the board
      }
    };

    // Check if the starting player has no moves
    if (checkInitialNoMoves(currentPlayer)) {
      console.log("Setting noMovesAvailable to true from useEffect.");
      setNoMovesAvailable(true);
    }
  }, []);

  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill(0);

    // Standard Backgammon setup
    // Player 1 (light grey) pieces
    newBoard[23] = 2; // 2 pieces on point 24
    newBoard[12] = 5; // 5 pieces on point 13
    newBoard[7] = 3; // 3 pieces on point 8
    newBoard[5] = 5; // 5 pieces on point 6

    // Player 2 (green) pieces
    newBoard[0] = -2; // 2 pieces on point 1
    newBoard[11] = -5; // 5 pieces on point 12
    newBoard[16] = -3; // 3 pieces on point 17
    newBoard[18] = -5; // 5 pieces on point 19

    setBoard(newBoard);
    rollDice();
  };

  const rollDice = () => {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    setDice([die1, die2]);
    setAvailableDice(die1 === die2 ? [die1, die1, die1, die1] : [die1, die2]);
  };

  const isPlayerInHomeBoard = (player) => {
    // White (Player 1) home board is points 1-6 (indices 0-5)
    // Green (Player -1) home board is points 19-24 (indices 18-23)
    if (player === 1) {
      for (let i = 6; i < BOARD_SIZE; i++) {
        if (Math.sign(board[i]) === 1) return false;
      }
      return true;
    } else {
      // Check if any Green pieces are outside points 19-24 (indices 18-23)
      for (let i = 0; i < 18; i++) {
        // Indices 0 through 17 are outside Green's home board
        if (Math.sign(board[i]) === -1) return false;
      }
      return true;
    }
  };

  // Helper to check if a single die move is valid from a point
  const isSingleMoveValid = (point, die, player, board) => {
    const targetPoint = player === 1 ? point - die : point + die;

    if (targetPoint >= 0 && targetPoint < BOARD_SIZE) {
      return (
        board[targetPoint] === 0 ||
        Math.sign(board[targetPoint]) === player ||
        Math.abs(board[targetPoint]) === 1
      ); // Can land on empty, own, or blot
    } else if (
      (player === 1 && targetPoint < 0) ||
      (player === -1 && targetPoint >= BOARD_SIZE)
    ) {
      // Bearing off scenario
      if (isPlayerInHomeBoard(player)) {
        const distanceToBearOff = player === 1 ? point + 1 : BOARD_SIZE - point;
        if (die === distanceToBearOff) {
          return true;
        } else if (die > distanceToBearOff) {
          // Only allow bearing off with a higher die if there are no checkers on higher points within the home board
          if (player === 1) {
            // Check points higher than 'point' within home board (points 0-5)
            for (let i = point + 1; i <= 5; i++) {
              if (Math.sign(board[i]) === player) {
                return false;
              }
            }
          } else {
            // Check points lower than 'point' within home board (points 18-23)
            for (let i = point - 1; i >= 18; i--) {
              if (Math.sign(board[i]) === player) {
                return false;
              }
            }
          }
          return true;
        }
      }
    }
    return false; // Not a valid move
  };

  const getCombinedMoveTarget = (point, die1, die2, player, board) => {
    const intermediateTarget = player === 1 ? point - die1 : point + die1;
    // Check if intermediate point is valid (not blocked by > 1 opponent piece)
    if (intermediateTarget >= 0 && intermediateTarget < BOARD_SIZE) {
      if (
        Math.sign(board[intermediateTarget]) !== player &&
        Math.abs(board[intermediateTarget]) > 1
      ) {
        return null; // Intermediate point is blocked
      }
    } else if (intermediateTarget < 0 || intermediateTarget >= BOARD_SIZE) {
      // Intermediate point is off the board, this combination is not possible for an on-board move
      return null;
    }

    const finalTarget =
      player === 1 ? point - (die1 + die2) : point + (die1 + die2);

    // Check if final target point is valid (on board or bear off)
    if (finalTarget >= 0 && finalTarget < BOARD_SIZE) {
      if (
        board[finalTarget] === 0 ||
        Math.sign(board[finalTarget]) === player ||
        Math.abs(board[finalTarget]) === 1
      ) {
        return finalTarget; // Valid on-board move
      } else {
        return null; // Final point is blocked
      }
    } else if (finalTarget < 0 || finalTarget >= BOARD_SIZE) {
      // Final target is off the board - check if bearing off is valid
      if (isPlayerInHomeBoard(player)) {
        const distanceToBearOff = player === 1 ? point + 1 : BOARD_SIZE - point;
        // Allow bearing off if combined dice can reach or exceed point 0
        if (die1 + die2 >= distanceToBearOff) {
          return -2; // Valid bearing off move
        }
      }
      return null; // Cannot bear off with this combined die
    }
    return null; // Should not reach here
  };

  // This function now calculates all valid moves (single and combined) from a given point
  const getValidMoves = (point) => {
    const playerHasPieceOnBar =
      currentPlayer === 1 ? player1Bar > 0 : player2Bar > 0;

    // If player has pieces on the bar, they must re-enter first
    if (playerHasPieceOnBar) {
      console.log(
        `Checking valid moves from bar (point -1) for player ${currentPlayer} with dice: ${availableDice}`
      );
      // Only calculate moves from the bar (represented by a conceptual point)
      if (point === -1) {
        // Use -1 to represent the bar
        const moves = [];
        availableDice.forEach((die) => {
          // Target point is determined by die roll on opponent's home board
          // Non-standard rule: White enters points 19-24 (indices 18-23), Green enters 1-6 (indices 0-5)
          const targetPoint = currentPlayer === 1 ? BOARD_SIZE - die : die - 1;

          // Check if the target point is within bounds and can be landed on
          if (targetPoint >= 0 && targetPoint < BOARD_SIZE) {
            if (
              board[targetPoint] === 0 ||
              Math.sign(board[targetPoint]) === currentPlayer ||
              Math.abs(board[targetPoint]) === 1 // Can hit a blot
            ) {
              console.log(
                `- Valid single move from bar with die ${die} to target ${targetPoint}`
              );
              moves.push({ target: targetPoint, dieUsed: die });
            }
          }
        });
        // Filter unique target points
        const uniqueMoves = Array.from(
          new Set(moves.map((move) => move.target))
        ).map((target) => moves.find((move) => move.target === target));
        return uniqueMoves;
      } else {
        // Cannot move pieces already on the board if there are pieces on the bar
        return [];
      }
    } else {
      // Normal move logic if no pieces on the bar
      if (
        Math.sign(board[point]) !== currentPlayer ||
        availableDice.length === 0
      ) {
        // If no piece of the current player at this point, or no dice left, no valid moves from here
        return [];
      }

      console.log(
        `Checking valid moves from point ${point} for player ${currentPlayer} with dice: ${availableDice}`
      );
      const moves = [];

      // 1. Add valid single-die moves
      availableDice.forEach((die) => {
        // Always allow both bearing off and moving within home board if both are valid
        const targetPoint = currentPlayer === 1 ? point - die : point + die;
        if (isSingleMoveValid(point, die, currentPlayer, board)) {
          // If bearing off, use target -2
          if (
            (currentPlayer === 1 && targetPoint < 0) ||
            (currentPlayer === -1 && targetPoint >= BOARD_SIZE)
          ) {
            moves.push({ target: -2, dieUsed: die, source: point });
          } else {
            moves.push({ target: targetPoint, dieUsed: die, source: point });
          }
        }
      });

      console.log("After single moves check:", moves);

      // 2. Add valid combined moves using any two available dice
      if (availableDice.length >= 2) {
        console.log("Checking for combined moves with dice:", availableDice);
        const availableDiceCopy = [...availableDice]; // Work on a copy
        const checkedPairs = new Set();

        for (let i = 0; i < availableDiceCopy.length; i++) {
          for (let j = i + 1; j < availableDiceCopy.length; j++) {
            const die1 = availableDiceCopy[i];
            const die2 = availableDiceCopy[j];
            const pairKey =
              die1 <= die2 ? `${die1}-${die2}` : `${die2}-${die1}`;

            if (!checkedPairs.has(pairKey)) {
              checkedPairs.add(pairKey);

              const combinedTarget = getCombinedMoveTarget(
                point,
                die1,
                die2,
                currentPlayer,
                board
              );

              if (combinedTarget !== null) {
                // Ensure this combined move isn't already added
                const combinedMoveExists = moves.some(
                  (move) =>
                    Array.isArray(move.dieUsed) &&
                    ((move.dieUsed[0] === die1 && move.dieUsed[1] === die2) ||
                      (move.dieUsed[0] === die2 && move.dieUsed[1] === die1)) &&
                    move.target === combinedTarget &&
                    move.source === point
                );

                if (!combinedMoveExists) {
                  console.log(
                    `- Valid combined move with dice ${die1},${die2} from ${point} to target ${combinedTarget}`
                  );
                  moves.push({
                    target: combinedTarget,
                    dieUsed: [die1, die2],
                    source: point,
                  });
                }
              } else {
                console.log(
                  `- Invalid combined move with dice ${die1},${die2} from ${point}. Target was null.`
                );
              }
            }
          }
        }
      }

      console.log("All generated moves (before uniqueness filter):");
      console.log(moves);

      // Return all generated moves (single and combined)
      return moves;
    }
  };

  const handlePointClick = (point) => {
    if (winner !== null) return; // Prevent moves if the game is over
    if (selectedPoint === null) {
      const playerHasPieceOnBar =
        currentPlayer === 1 ? player1Bar > 0 : player2Bar > 0;

      // If player has pieces on the bar, they must select the bar first (conceptual point -1)
      if (playerHasPieceOnBar) {
        const barMoves = getValidMoves(-1);
        if (barMoves.length === 0) {
          // Player has pieces on the bar but no valid moves
          console.log("Player stuck on the bar. Passing turn.");
          setCurrentPlayer(currentPlayer === 1 ? -1 : 1);
          rollDice(); // Roll dice for the next player
          setSelectedPoint(null); // Clear any selected point
          setValidMoves([]); // Clear valid moves
        } else {
          // Player has valid moves from the bar
          setSelectedPoint(-1); // Use -1 to represent the bar as the selected source
          setValidMoves(barMoves); // Set the valid moves from the bar
        }
      } else if (
        Math.sign(board[point]) === currentPlayer &&
        availableDice.length > 0
      ) {
        // Normal piece selection if no pieces on the bar
        setSelectedPoint(point);
        setValidMoves(getValidMoves(point));
      }
    } else {
      // If a point is already selected, try to move to the clicked point or bear off
      const move = validMoves.find((move) => move.target === point);
      const bearingOffMove = validMoves.find(
        (move) =>
          move.target === -2 &&
          move.source === selectedPoint &&
          (currentPlayer === 1
            ? point < 6 && point >= 0
            : point >= 18 && point < BOARD_SIZE)
      ); // Check if click is on a point in home board and bearing off is valid

      const combinedMove = validMoves.find(
        (move) =>
          Array.isArray(move.dieUsed) && // Check if it's a combined move
          move.source === selectedPoint &&
          move.target === point
      ); // Find if the clicked point is a valid target for a combined move

      if (move || bearingOffMove || combinedMove) {
        const newBoard = [...board];
        const sourcePoint = selectedPoint;
        const targetMove = move || bearingOffMove || combinedMove; // Use the found move, bearing off move, or combined move
        const targetPoint = targetMove.target;
        const dieUsed = targetMove.dieUsed;

        const playerHasPieceOnBar =
          currentPlayer === 1 ? player1Bar > 0 : player2Bar > 0;

        if (playerHasPieceOnBar && sourcePoint === -1) {
          // Handle moving from the bar
          // Check for hitting an opponent's single piece (blot) on the entry point
          if (
            Math.sign(newBoard[targetPoint]) !== currentPlayer &&
            Math.abs(newBoard[targetPoint]) === 1
          ) {
            console.log(
              `Hit opponent's blot at point ${
                targetPoint + 1
              }. Moving piece to the bar.`
            );
            newBoard[targetPoint] = 0; // Remove opponent's piece
            if (currentPlayer === 1) {
              setPlayer2Bar((prev) => prev + 1);
            } else {
              setPlayer1Bar((prev) => prev + 1);
            }
          }

          // Move the piece from the bar onto the board
          newBoard[targetPoint] += currentPlayer; // Add one piece to target

          // Decrease the count of pieces on the bar
          if (currentPlayer === 1) {
            setPlayer1Bar((prev) => prev - 1);
          } else {
            setPlayer2Bar((prev) => prev - 1);
          }
        } else {
          // Handle normal move on the board or bearing off
          if (targetPoint === -2) {
            // Handle bearing off
            console.log(
              `Bearing off piece from point ${
                sourcePoint + 1
              } using die ${dieUsed}.`
            );
            newBoard[sourcePoint] -= currentPlayer; // Remove one piece from source

            // Increase the borne off count
            if (currentPlayer === 1) {
              console.log(
                `Player 1 bearing off. Before: ${player1BorneOff}, After: ${
                  player1BorneOff + 1
                }`
              );
              setPlayer1BorneOff((prev) => prev + 1);
            } else {
              console.log(
                `Player -1 bearing off. Before: ${player2BorneOff}, After: ${
                  player2BorneOff + 1
                }`
              );
              setPlayer2BorneOff((prev) => prev + 1);
            }
          } else {
            // Handle regular on-board move
            // Check for hitting an opponent's single piece (blot) on the target point
            if (
              Math.sign(newBoard[targetPoint]) !== currentPlayer &&
              Math.abs(newBoard[targetPoint]) === 1
            ) {
              console.log(
                `Hit opponent's blot at point ${
                  targetPoint + 1
                }. Moving piece to the bar.`
              );
              newBoard[targetPoint] = 0; // Remove opponent's piece
              if (currentPlayer === 1) {
                setPlayer2Bar((prev) => prev + 1);
              } else {
                setPlayer1Bar((prev) => prev + 1);
              }
            }

            // Move the piece
            newBoard[sourcePoint] -= currentPlayer; // Remove one piece from source
            newBoard[targetPoint] += currentPlayer; // Add one piece to target
          }
        }

        // Update the board state
        setBoard(newBoard);

        // Remove the used die from available dice
        const newAvailableDice = [...availableDice];

        if (Array.isArray(dieUsed)) {
          // If a combined move was made, remove both dice
          const die1Index = newAvailableDice.indexOf(dieUsed[0]);
          if (die1Index > -1) {
            newAvailableDice.splice(die1Index, 1);
          }
          const die2Index = newAvailableDice.indexOf(dieUsed[1]);
          if (die2Index > -1) {
            newAvailableDice.splice(die2Index, 1);
          }
        } else {
          // If a single die move was made, remove that die
          const dieIndex = newAvailableDice.indexOf(dieUsed);
          if (dieIndex > -1) {
            newAvailableDice.splice(dieIndex, 1);
          }
        }
        setAvailableDice(newAvailableDice);

        // Deselect and clear moves
        setSelectedPoint(null);
        setValidMoves([]);

        // Check for win condition
        const currentBorneOff =
          currentPlayer === 1 ? player1BorneOff : player2BorneOff;
        const piecesAfterMove = currentBorneOff + (targetPoint === -2 ? 1 : 0);

        if (piecesAfterMove === 15) {
          setWinner(currentPlayer); // Set the winning player
          console.log(
            `Player ${currentPlayer === 1 ? "White" : "Green"} wins!`
          );
        } else {
          // Check if there are any valid moves with the remaining dice
          const hasValidMoves = () => {
            // If we have no dice left, there are no valid moves
            if (newAvailableDice.length === 0) {
              return false;
            }

            // Check if there are any valid moves with the remaining dice
            for (let i = 0; i < BOARD_SIZE; i++) {
              if (Math.sign(newBoard[i]) === currentPlayer) {
                const moves = getValidMoves(i);
                if (moves.length > 0) {
                  return true;
                }
              }
            }

            // If we just moved from the bar, check if there are any more pieces on the bar
            const remainingPiecesOnBar =
              currentPlayer === 1 ? player1Bar : player2Bar;
            if (remainingPiecesOnBar > 0) {
              const barMoves = getValidMoves(-1);
              if (barMoves.length > 0) {
                return true;
              }
            }

            // If we just bore off, check if there are still valid bear off moves
            if (isPlayerInHomeBoard(currentPlayer)) {
              for (let i = 0; i < BOARD_SIZE; i++) {
                if (Math.sign(newBoard[i]) === currentPlayer) {
                  for (let die of newAvailableDice) {
                    if (isSingleMoveValid(i, die, currentPlayer, newBoard)) {
                      return true;
                    }
                  }
                }
              }
            }

            return false;
          };

          // Only end turn if there are no valid moves
          if (!hasValidMoves()) {
            console.log("No valid moves remaining. Ending turn.");
            setCurrentPlayer(currentPlayer === 1 ? -1 : 1);
            rollDice();
          } else {
            console.log("Valid moves still available. Continuing turn.");
          }
        }
      } else {
        // Deselect if clicked point is not a valid move
        console.log("Clicked point is not a valid move.");
        setSelectedPoint(null);
        setValidMoves([]);
      }
    }
  };

  // useEffect to check for no moves at the start of a player's turn
  useEffect(() => {
    // Only perform this check if the game is not over
    if (winner === null && availableDice.length > 0) {
      // Only check if dice have been rolled for the new turn
      const playerHasPieceOnBar =
        currentPlayer === 1 ? player1Bar > 0 : player2Bar > 0;
      let hasValidMoves = false;

      if (playerHasPieceOnBar) {
        // Check for valid moves from the bar
        if (getValidMoves(-1).length > 0) {
          hasValidMoves = true;
        }
      } else {
        // Check for valid moves from any piece on the board
        for (let i = 0; i < BOARD_SIZE; i++) {
          if (Math.sign(board[i]) === currentPlayer) {
            if (getValidMoves(i).length > 0) {
              hasValidMoves = true;
              break;
            }
          }
        }
      }

      if (!hasValidMoves) {
        console.log(
          "Setting noMovesAvailable to true from useEffect (turn start check)."
        );
        setNoMovesAvailable(true);
      } else {
        console.log(
          "Player has valid moves. Setting noMovesAvailable to false."
        );
        setNoMovesAvailable(false);
      }
    }
  }, [currentPlayer, availableDice, board, player1Bar, player2Bar]); // Dependencies

  // useEffect to hide the no moves graphic after a delay
  useEffect(() => {
    let timer;
    if (noMovesAvailable) {
      timer = setTimeout(() => {
        console.log("Hiding noMovesAvailable graphic.");
        setNoMovesAvailable(false);
        // Automatically switch player and roll dice after the graphic disappears
        setCurrentPlayer((prevPlayer) => (prevPlayer === 1 ? -1 : 1));
        rollDice();
      }, 2000); // Hide after 2 seconds
    }
    // Cleanup function to clear the timer if noMovesAvailable becomes false before the timeout
    return () => clearTimeout(timer);
  }, [noMovesAvailable, setCurrentPlayer, rollDice]); // Dependencies on noMovesAvailable, setCurrentPlayer, and rollDice

  const handleDragStart = (e, point, pieceIndex) => {
    setDraggedPiece({ point, pieceIndex });
    e.dataTransfer.setData("text/plain", ""); // Required for Firefox
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Allow drop
  };

  const handleDrop = (e, targetPoint) => {
    e.preventDefault();
    if (draggedPiece) {
      const newBoard = [...board];
      const sourcePoint = draggedPiece.point;

      // Move piece from source to target
      if (newBoard[sourcePoint] !== 0) {
        const pieceCount = Math.abs(newBoard[sourcePoint]);
        newBoard[sourcePoint] =
          Math.sign(newBoard[sourcePoint]) * (pieceCount - 1);
        newBoard[targetPoint] =
          Math.sign(newBoard[sourcePoint]) *
          (Math.abs(newBoard[targetPoint] || 0) + 1);
        setBoard(newBoard);
      }

      setDraggedPiece(null);
    }
  };

  const renderPoint = (point) => {
    const pieces = Math.abs(board[point]);
    const isPlayer1 = board[point] > 0;
    const isSelected = selectedPoint === point;
    const isValidMove = validMoves.some((move) => move.target === point);
    const isTopHalf = point < 12;
    const triangleColor = point % 2 === 0 ? "#374151" : "#1f2937";

    return (
      <div
        key={point}
        className={`relative w-[40px] sm:w-[52px] h-32 sm:h-48 ${
          isSelected ? "ring-2 ring-bright-green" : ""
        } ${isValidMove ? "ring-2 ring-yellow-400" : ""}`}
        onClick={() => handlePointClick(point)}
      >
        {/* Triangle */}
        <div
          className="absolute inset-0"
          style={{
            width: 0,
            height: 0,
            borderLeft: "26px solid transparent",
            borderRight: "26px solid transparent",
            borderStyle: "solid",
            borderTop: isTopHalf
              ? `192px solid ${triangleColor}`
              : "transparent",
            borderBottom: isTopHalf
              ? "transparent"
              : `192px solid ${triangleColor}`,
          }}
        />

        {/* Pieces */}
        {pieces > 0 && (
          <div
            className={`absolute inset-x-0 flex flex-col items-center ${
              isTopHalf ? "top-0" : "bottom-0"
            } ${isTopHalf ? "justify-start" : "justify-end"} p-1 sm:p-2`}
          >
            {Array(pieces)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                    isPlayer1
                      ? "bg-gray-300 border-2 border-gray-400"
                      : "bg-bright-green border-2 border-emerald-600"
                  }`}
                />
              ))}
          </div>
        )}

        {/* Point number */}
        <div
          className={`absolute ${
            isTopHalf ? "bottom-1" : "top-1"
          } left-1/2 transform -translate-x-1/2 text-[10px] sm:text-xs text-gray-400`}
        >
          {point + 1}
        </div>
      </div>
    );
  };

  // Add useEffect to auto-hide the win modal after 3 seconds
  useEffect(() => {
    if (winner !== null) {
      const timer = setTimeout(() => {
        setWinner(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [winner]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-[800px] overflow-auto max-h-[95vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent">
            Backgammon
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="mb-4 flex justify-center space-x-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">Current Player</div>
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                currentPlayer === 1
                  ? "bg-gray-300 border-2 border-gray-400"
                  : "bg-bright-green border-2 border-emerald-600"
              }`}
            />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Dice</div>
            <div className="flex space-x-2">
              {dice.map((die, i) => (
                <div
                  key={i}
                  className="w-6 h-6 sm:w-8 sm:h-8 bg-white text-gray-800 rounded flex items-center justify-center font-bold text-sm sm:text-base"
                >
                  {die}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-4 sm:border-8 border-black rounded-lg p-1 sm:p-2 bg-black">
          <div className="border border-amber-700 rounded-md p-1">
            <div className="flex flex-col">
              <div className="flex justify-center h-32 sm:h-48">
                {/* Top half - first 6 points */}
                {Array(6)
                  .fill(0)
                  .map((_, i) => {
                    const pointIndex = 11 - i;
                    return renderPoint(pointIndex);
                  })}
                {/* Gap with vertical line */}
                <div className="w-4 sm:w-8 flex justify-center">
                  <div className="w-[1px] h-full bg-amber-700"></div>
                </div>
                {/* Top half - second 6 points */}
                {Array(6)
                  .fill(0)
                  .map((_, i) => {
                    const pointIndex = 5 - i;
                    return renderPoint(pointIndex);
                  })}
              </div>
              <div className="h-4 sm:h-8 bg-black my-1 sm:my-2"></div>
              <div className="flex justify-center h-32 sm:h-48">
                {/* Bottom half - first 6 points */}
                {Array(6)
                  .fill(0)
                  .map((_, i) => {
                    const pointIndex = 12 + i;
                    return renderPoint(pointIndex);
                  })}
                {/* Gap with vertical line */}
                <div className="w-4 sm:w-8 flex justify-center">
                  <div className="w-[1px] h-full bg-amber-700"></div>
                </div>
                {/* Bottom half - second 6 points */}
                {Array(6)
                  .fill(0)
                  .map((_, i) => {
                    const pointIndex = 18 + i;
                    return renderPoint(pointIndex);
                  })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center flex-wrap gap-4">
            <button
              onClick={initializeBoard}
              className="px-3 py-1 bg-transparent border border-white rounded-md transition-colors hover:bg-gray-700/50"
            >
              <span className="bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent text-sm">
                New Game
              </span>
            </button>

            {/* Bar display box */}
            <div
              className="bg-black border border-amber-700 rounded-md w-[100px] sm:w-[140px] h-[30px] sm:h-[34px] flex items-center justify-center text-white text-base sm:text-lg font-bold"
              onClick={() => {
                const playerHasPieceOnBar =
                  currentPlayer === 1 ? player1Bar > 0 : player2Bar > 0;
                if (playerHasPieceOnBar) {
                  setSelectedPoint(-1); // Use -1 to represent the bar as the selected source
                  setValidMoves(getValidMoves(-1)); // Calculate moves from the bar
                }
              }}
            >
              {/* Display pieces on bar for current player */}
              {Array(currentPlayer === 1 ? player1Bar : player2Bar)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                      currentPlayer === 1
                        ? "bg-gray-300 border-2 border-gray-400"
                        : "bg-bright-green border-2 border-emerald-600"
                    } mx-[1px]`}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Borne off pieces display */}
        <div className="flex justify-center mt-4 space-x-4">
          {/* Player 1 (White/Grey) borne off */}
          <div className="bg-black border border-amber-700 rounded-md w-[50px] sm:w-[60px] h-[30px] sm:h-[40px] flex items-center justify-center">
            <span className="text-gray-300 text-base sm:text-lg font-bold">
              {player1BorneOff}
            </span>
          </div>

          {/* Player 2 (Green) borne off */}
          <div className="bg-black border border-amber-700 rounded-md w-[50px] sm:w-[60px] h-[30px] sm:h-[40px] flex items-center justify-center">
            <span className="text-bright-green text-base sm:text-lg font-bold">
              {player2BorneOff}
            </span>
          </div>
        </div>
      </div>
      {noMovesAvailable && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-xl text-center max-w-[95vw] sm:max-w-[500px]">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              No Moves Available
            </h2>
            <p className="text-xl sm:text-2xl text-white mb-4">
              Player {currentPlayer === 1 ? "White" : "Green"} cannot make a
              move.
            </p>
            <button
              onClick={() => {
                setNoMovesAvailable(false);
                setCurrentPlayer(currentPlayer === 1 ? -1 : 1);
                rollDice();
              }}
              className="mt-4 px-4 py-2 bg-transparent border border-white rounded-md text-white transition-colors hover:bg-gray-700/50"
            >
              End Turn
            </button>
          </div>
        </div>
      )}
      {winner !== null && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-xl text-center max-w-[95vw] sm:max-w-[500px]">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Game Over!
            </h2>
            <p className="text-xl sm:text-2xl text-white">
              Player {winner === 1 ? "White" : "Green"} wins!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backgammon;
