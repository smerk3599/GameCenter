import React, { useState } from "react";

const COLORS = [
  { name: "Red", code: "#ef4444" },
  { name: "Blue", code: "#3b82f6" },
  { name: "Green", code: "#22c55e" },
  { name: "Yellow", code: "#eab308" },
  { name: "Purple", code: "#a21caf" },
  { name: "Orange", code: "#f97316" },
];
const PEGS = 4;
const MAX_GUESSES = 10;

function randomCode() {
  // Allow duplicate colors
  return Array.from({ length: PEGS }, () =>
    Math.floor(Math.random() * COLORS.length)
  );
}

function getFeedback(code, guess) {
  // Returns [black, white] pegs
  let black = 0;
  let white = 0;
  const codeCopy = [...code];
  const guessCopy = [...guess];
  // First pass: black pegs
  for (let i = 0; i < PEGS; i++) {
    if (guessCopy[i] === codeCopy[i]) {
      black++;
      codeCopy[i] = guessCopy[i] = null;
    }
  }
  // Second pass: white pegs
  for (let i = 0; i < PEGS; i++) {
    if (guessCopy[i] != null) {
      const idx = codeCopy.indexOf(guessCopy[i]);
      if (idx !== -1) {
        white++;
        codeCopy[idx] = null;
      }
    }
  }
  return [black, white];
}

const Mastermind = ({ onClose }) => {
  const [secret, setSecret] = useState(randomCode());
  const [guesses, setGuesses] = useState([]); // [{ guess: [idx, ...], feedback: [b, w] }]
  const [current, setCurrent] = useState(Array(PEGS).fill(null));
  const [selected, setSelected] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);

  const newGame = () => {
    setSecret(randomCode());
    setGuesses([]);
    setCurrent(Array(PEGS).fill(null));
    setSelected(0);
    setGameWon(false);
    setGameLost(false);
  };

  const handleColorPick = (colorIdx) => {
    if (gameWon || gameLost) return;
    const next = [...current];
    next[selected] = colorIdx;
    // Move to next empty slot
    let nextSel = selected;
    for (let i = 1; i <= PEGS; i++) {
      const idx = (selected + i) % PEGS;
      if (next[idx] == null) {
        nextSel = idx;
        break;
      }
    }
    setCurrent(next);
    setSelected(nextSel);
  };

  const handleSlotClick = (idx) => {
    if (gameWon || gameLost) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (gameWon || gameLost) return;
    if (current.some((c) => c == null)) return;
    const feedback = getFeedback(secret, current);
    const newGuesses = [...guesses, { guess: current, feedback }];
    setGuesses(newGuesses);
    setCurrent(Array(PEGS).fill(null));
    setSelected(0);
    if (feedback[0] === PEGS) {
      setGameWon(true);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameLost(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl relative flex flex-col items-center min-w-[500px]">
        <div className="w-full flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg mb-1 px-2"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent text-center w-full">
          Mastermind
        </h2>
        <div className="mb-4 text-gray-300 text-center">
          Guess the secret code! {PEGS} pegs, {COLORS.length} colors,{" "}
          {MAX_GUESSES} guesses.
        </div>
        {/* Board with border */}
        <div className="flex flex-col gap-2 items-center mb-4 border border-gray-500 rounded-md p-4 bg-gray-900/40 w-fit mx-auto">
          {guesses.map((g, i) => (
            <div key={i} className="flex items-center gap-4 justify-center">
              <div className="flex gap-2">
                {g.guess.map((colorIdx, j) => (
                  <div
                    key={j}
                    className="w-7 h-7 rounded-full border-2 border-gray-600"
                    style={{ background: COLORS[colorIdx].code }}
                  />
                ))}
              </div>
              <div className="flex items-center">
                <div
                  className="flex gap-1 border border-gray-500 rounded-md px-2 py-1 bg-gray-900/60 ml-4 justify-center"
                  style={{
                    width: "96px",
                    minWidth: "96px",
                    maxWidth: "96px",
                    marginLeft: "1rem",
                    display: "flex",
                  }}
                >
                  {Array(g.feedback[0])
                    .fill(0)
                    .map((_, k) => (
                      <span
                        key={"b" + k}
                        className="inline-block w-3 h-3 rounded-full bg-black border border-gray-400"
                      />
                    ))}
                  {Array(g.feedback[1])
                    .fill(0)
                    .map((_, k) => (
                      <span
                        key={"w" + k}
                        className="inline-block w-3 h-3 rounded-full bg-white border border-gray-400"
                      />
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Current guess */}
        {!gameWon && !gameLost && (
          <div className="flex flex-col items-center mb-4">
            <div className="flex gap-2 mb-2">
              {current.map((colorIdx, i) => (
                <button
                  key={i}
                  className={`w-10 h-10 rounded-full border-4 flex items-center justify-center focus:outline-none ${
                    selected === i ? "border-yellow-400" : "border-gray-600"
                  } ${colorIdx != null ? "" : "bg-gray-700"}`}
                  style={{
                    background:
                      colorIdx != null ? COLORS[colorIdx].code : undefined,
                  }}
                  onClick={() => handleSlotClick(i)}
                >
                  {colorIdx == null ? (
                    <span className="text-gray-500">?</span>
                  ) : null}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mb-2">
              {COLORS.map((c, idx) => (
                <button
                  key={c.name}
                  className="w-8 h-8 rounded-full border-2 border-gray-400 focus:outline-none hover:scale-110 transition-transform"
                  style={{ background: c.code }}
                  onClick={() => handleColorPick(idx)}
                  aria-label={c.name}
                />
              ))}
            </div>
            <button
              className="mt-2 px-4 py-2 bg-gradient-to-r from-bright-green to-emerald-600 text-dark-grey rounded-md border border-bright-green hover:from-emerald-600 hover:to-bright-green transition-all duration-300 shadow-[0_0_10px_rgba(0,204,126,0.3)]"
              onClick={handleSubmit}
              disabled={current.some((c) => c == null)}
            >
              Submit Guess
            </button>
          </div>
        )}
        {/* Win/Lose message */}
        {(gameWon || gameLost) && (
          <div className="flex flex-col items-center mb-4">
            {gameWon && (
              <div className="text-3xl font-bold text-bright-green mb-2">
                You Win!
              </div>
            )}
            {gameLost && (
              <div className="text-3xl font-bold text-red-400 mb-2">
                You Lose!
              </div>
            )}
            <div className="mb-2 text-gray-300">Secret code:</div>
            <div className="flex gap-2 mb-2 border border-gray-500 rounded-md p-2 bg-gray-900/40">
              {secret.map((colorIdx, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-gray-400"
                  style={{ background: COLORS[colorIdx].code }}
                />
              ))}
            </div>
            <button
              className="px-4 py-2 bg-gradient-to-r from-bright-green to-emerald-600 text-dark-grey rounded-md border border-bright-green hover:from-emerald-600 hover:to-bright-green transition-all duration-300 shadow-[0_0_10px_rgba(0,204,126,0.3)]"
              onClick={newGame}
            >
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mastermind;
