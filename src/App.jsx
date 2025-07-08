import { useState } from "react";
import Checkers from "./components/Checkers";
import MemoryMatch from "./components/MemoryMatch";
import Minesweeper from "./components/Minesweeper";
import Backgammon from "./components/Backgammon";
import Tetris from "./components/Tetris.jsx";
import Solitaire from "./components/Solitaire.jsx";
import Mastermind from "./components/Mastermind.jsx";
import ConnectFour from "./components/ConnectFour.jsx";

const games = [
  {
    id: 1,
    name: "Checkers",
    description:
      "A classic board game where players move diagonally to capture opponent's pieces. The goal is to capture all opponent's pieces or block them from making a legal move.",
    image: "/Checkers.png",
  },
  {
    id: 2,
    name: "Memory Match",
    description:
      "Test your memory by matching pairs of cards. Flip cards to find matching pairs and clear the board. The player with the most matches wins!",
    image: "/Memory Match.png",
  },
  {
    id: 3,
    name: "Minesweeper",
    description:
      "Classic puzzle game where you must clear a minefield without detonating any mines. Use logic and deduction to identify safe spaces and flag potential mines.",
    image: "/Minesweeper.png",
  },
  {
    id: 4,
    name: "Backgammon",
    description:
      "One of the oldest board games, combining strategy and luck. Move your pieces around the board and bear them off before your opponent.",
    image: "/Backgammon.png",
  },
  {
    id: 5,
    name: "Solitaire",
    description:
      "A classic card game where you arrange cards in descending order, alternating colors. Clear all cards from the tableau to win.",
    image: "/Solitaire.png",
  },
  {
    id: 6,
    name: "Tetris",
    description:
      "Arrange falling blocks to create complete lines. As lines are cleared, the game speeds up. How long can you survive?",
    image: "/Tetris.png",
  },
  {
    id: 7,
    name: "Connect Four",
    description:
      "Classic strategy game! Drop tokens to connect four in a row horizontally, vertically, or diagonally. Beat your opponent!",
    image: "/ConnectFour.png",
  },
  {
    id: 8,
    name: "Mastermind",
    description:
      "A code-breaking game where you try to guess the secret color code. After each guess, you'll get hints about correct colors and positions.",
    image: "/Mastermind.png",
  },
];

function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [showCheckers, setShowCheckers] = useState(false);
  const [showMemoryMatch, setShowMemoryMatch] = useState(false);
  const [showMinesweeper, setShowMinesweeper] = useState(false);
  const [showBackgammon, setShowBackgammon] = useState(false);
  const [showTetris, setShowTetris] = useState(false);
  const [showSolitaire, setShowSolitaire] = useState(false);
  const [showMastermind, setShowMastermind] = useState(false);
  const [showConnectFour, setShowConnectFour] = useState(false);

  const openGame = (gameId) => {
    if (gameId === 1) {
      setShowCheckers(true);
    } else if (gameId === 2) {
      setShowMemoryMatch(true);
    } else if (gameId === 3) {
      setShowMinesweeper(true);
    } else if (gameId === 4) {
      setShowBackgammon(true);
    } else if (gameId === 5) {
      setShowSolitaire(true);
    } else if (gameId === 6) {
      setShowTetris(true);
    } else if (gameId === 7) {
      setShowConnectFour(true);
    } else if (gameId === 8) {
      setShowMastermind(true);
    } else {
      console.log(`Opening game ${gameId}`);
    }
  };

  return (
    <div className="min-h-screen bg-dark-grey text-white p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(0,204,126,0.5)] [text-shadow:_0_0_2px_#C0C0C0,_0_0_4px_#C0C0C0,_0_0_6px_#C0C0C0]">
        Game Center
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-7xl mx-auto">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-gray-700 rounded-lg p-3 sm:p-4 lg:p-6 hover:bg-gray-700 transition-colors duration-300 cursor-pointer flex flex-col items-center justify-center text-center"
            onClick={() => openGame(game.id)}
          >
            <img
              src={game.image}
              alt={`${game.name} screenshot`}
              className="w-full h-32 sm:h-40 md:h-48 lg:h-60 object-contain rounded-lg mb-2 sm:mb-3 lg:mb-4 shadow-lg hover:shadow-bright-green/20 transition-shadow duration-300"
            />
            <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(0,204,126,0.5)] mb-1 sm:mb-2">
              {game.name}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mb-2 sm:mb-3 lg:mb-4">
              {game.description}
            </p>
            <button
              className="mt-auto bg-gradient-to-r from-bright-green to-emerald-600 text-dark-grey px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:from-emerald-600 hover:to-bright-green transition-all duration-300 shadow-[0_0_15px_rgba(0,204,126,0.3)] hover:shadow-[0_0_20px_rgba(0,204,126,0.5)] text-sm sm:text-base"
              onClick={(e) => {
                e.stopPropagation();
                openGame(game.id);
              }}
            >
              Play Now
            </button>
          </div>
        ))}
      </div>

      {showCheckers && <Checkers onClose={() => setShowCheckers(false)} />}
      {showMemoryMatch && (
        <MemoryMatch onClose={() => setShowMemoryMatch(false)} />
      )}
      {showMinesweeper && (
        <Minesweeper onClose={() => setShowMinesweeper(false)} />
      )}
      {showBackgammon && (
        <Backgammon onClose={() => setShowBackgammon(false)} />
      )}
      {showTetris && <Tetris onClose={() => setShowTetris(false)} />}
      {showSolitaire && <Solitaire onClose={() => setShowSolitaire(false)} />}
      {showMastermind && (
        <Mastermind onClose={() => setShowMastermind(false)} />
      )}
      {showConnectFour && (
        <ConnectFour onClose={() => setShowConnectFour(false)} />
      )}
    </div>
  );
}

export default App;
