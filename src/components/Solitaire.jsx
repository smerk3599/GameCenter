import React, { useState } from "react";

const SUITS = ["♠", "♥", "♦", "♣"];
const COLORS = { "♠": "black", "♣": "black", "♥": "red", "♦": "red" };
const CARD_COLORS = {
  red: "bg-gradient-to-br from-bright-green to-emerald-600 text-white border-amber-700",
  black: "bg-black text-bright-green border-amber-700",
};
const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

function createDeck() {
  const deck = [];
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      deck.push({ suit, rank, color: COLORS[suit], faceUp: false });
    }
  }
  return deck;
}

function shuffle(deck) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function dealTableau(deck) {
  const tableau = Array(7)
    .fill(0)
    .map(() => []);
  let deckIdx = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[deckIdx], faceUp: row === col };
      tableau[col].push(card);
      deckIdx++;
    }
  }
  return { tableau, rest: deck.slice(deckIdx) };
}

const Solitaire = ({ onClose }) => {
  const [tableau, setTableau] = useState([]);
  const [foundations, setFoundations] = useState([[], [], [], []]);
  const [stock, setStock] = useState([]);
  const [waste, setWaste] = useState([]);
  const [selected, setSelected] = useState(null); // {from: 'tableau'|'waste', col, row}
  const [gameWon, setGameWon] = useState(false);

  // New game setup
  const newGame = () => {
    const deck = shuffle(createDeck());
    const { tableau, rest } = dealTableau(deck);
    setTableau(tableau);
    setFoundations([[], [], [], []]);
    setStock(rest.map((c) => ({ ...c, faceUp: false })));
    setWaste([]);
    setSelected(null);
    setGameWon(false);
  };

  React.useEffect(() => {
    newGame();
    // eslint-disable-next-line
  }, []);

  // Move card from waste to tableau/foundation or tableau to tableau/foundation
  const handleCardClick = (from, col, row) => {
    if (from === "waste") {
      if (waste.length === 0) return;
      const card = waste[waste.length - 1];
      // Try to move to foundation first (auto-play)
      for (let f = 0; f < 4; f++) {
        if (canMoveToFoundation(card, foundations[f])) {
          moveWasteToFoundation(f);
          return;
        }
      }
      // Try to move to tableau
      for (let t = 0; t < 7; t++) {
        if (canMoveToTableau(card, tableau[t])) {
          moveWasteToTableau(t);
          return;
        }
      }
    } else if (from === "tableau") {
      // Auto-play to foundation if possible
      if (!tableau[col][row].faceUp) return;
      const card = tableau[col][row];

      // Check if this card can be auto-played to foundation
      for (let f = 0; f < 4; f++) {
        if (canMoveToFoundation(card, foundations[f])) {
          moveTableauToFoundation(col, row, f);
          return;
        }
      }

      // Check if this card can be auto-moved to another tableau column
      for (let t = 0; t < 7; t++) {
        if (t !== col && canMoveToTableau(card, tableau[t])) {
          moveTableauToTableau(col, row, t);
          return;
        }
      }

      // If not auto-played, handle selection/movement
      if (!selected) {
        setSelected({ from, col, row });
      } else {
        // Try to move selected to this column
        if (
          selected.from === "tableau" &&
          selected.col === col &&
          selected.row === row
        ) {
          setSelected(null);
          return;
        }
        const movingCards = tableau[selected.col].slice(selected.row);
        if (canMoveToTableau(movingCards[0], tableau[col])) {
          moveTableauToTableau(selected.col, selected.row, col);
          setSelected(null);
        } else {
          setSelected(null);
        }
      }
    }
  };

  // Helper: can a tableau card be played to any foundation?
  function canAutoPlayToFoundation(card) {
    return foundations.some((foundation) =>
      canMoveToFoundation(card, foundation)
    );
  }

  // Auto-play all possible tableau cards to foundations
  function autoPlayAllToFoundations() {
    let changed = false;
    let newTableau = tableau.map((col) => [...col]);
    let newFoundations = foundations.map((f) => [...f]);
    let keepGoing = true;
    while (keepGoing) {
      keepGoing = false;
      for (let colIdx = 0; colIdx < newTableau.length; colIdx++) {
        const col = newTableau[colIdx];
        if (col.length > 0 && col[col.length - 1].faceUp) {
          const card = col[col.length - 1];
          for (let fIdx = 0; fIdx < 4; fIdx++) {
            if (canMoveToFoundation(card, newFoundations[fIdx])) {
              newFoundations[fIdx].push(card);
              newTableau[colIdx] = col.slice(0, -1);
              // Flip next card if needed
              if (
                newTableau[colIdx].length &&
                !newTableau[colIdx][newTableau[colIdx].length - 1].faceUp
              ) {
                newTableau[colIdx][newTableau[colIdx].length - 1].faceUp = true;
              }
              changed = true;
              keepGoing = true;
              break;
            }
          }
        }
      }
    }
    setTableau(newTableau);
    setFoundations(newFoundations);
    if (changed && newTableau.every((col) => col.length === 0)) {
      setGameWon(true);
    }
  }

  // Stock click: deal to waste or auto-play if empty
  const handleStockClick = () => {
    if (stock.length === 0) {
      if (waste.length === 0) {
        // Try to auto-play all tableau cards to foundations
        const allFaceUp = tableau.every((col) =>
          col.every((card) => card.faceUp)
        );
        if (allFaceUp) {
          autoPlayAllToFoundations();
        }
        return;
      }
      setStock(waste.map((c) => ({ ...c, faceUp: false })).reverse());
      setWaste([]);
    } else {
      // Deal three cards at a time
      const cardsToDeal = Math.min(3, stock.length);
      const newCards = stock
        .slice(-cardsToDeal)
        .map((card) => ({ ...card, faceUp: true }));
      setStock(stock.slice(0, -cardsToDeal));
      setWaste([...waste, ...newCards]);
    }
  };

  // Foundation click: allow moving selected tableau card to foundation or reverse from foundation
  const handleFoundationClick = (fIdx) => {
    // If a tableau card is selected, try to move it to this foundation
    if (selected && selected.from === "tableau") {
      const card = tableau[selected.col][selected.row];
      if (canMoveToFoundation(card, foundations[fIdx])) {
        moveTableauToFoundation(selected.col, selected.row, fIdx);
        setSelected(null);
      }
    }
    // If no tableau card is selected, try to move foundation card to tableau
    else if (foundations[fIdx].length > 0) {
      const card = foundations[fIdx][foundations[fIdx].length - 1];
      // Try to move to tableau
      for (let t = 0; t < 7; t++) {
        if (canMoveToTableau(card, tableau[t])) {
          moveFoundationToTableau(fIdx, t);
          return;
        }
      }
    }
  };

  // Move logic helpers
  function canMoveToFoundation(card, foundation) {
    if (!card) return false;
    if (foundation.length === 0) return card.rank === "A";
    const top = foundation[foundation.length - 1];
    return (
      top.suit === card.suit &&
      RANKS.indexOf(card.rank) === RANKS.indexOf(top.rank) + 1
    );
  }
  function canMoveToTableau(card, col) {
    if (!card) return false;
    if (col.length === 0) return card.rank === "K";
    const top = col[col.length - 1];
    return (
      COLORS[top.suit] !== COLORS[card.suit] &&
      RANKS.indexOf(card.rank) === RANKS.indexOf(top.rank) - 1
    );
  }
  function moveWasteToFoundation(fIdx) {
    const card = waste[waste.length - 1];
    setWaste(waste.slice(0, -1));
    setFoundations((f) => {
      const copy = f.map((pile, i) => (i === fIdx ? [...pile, card] : pile));
      return copy;
    });
  }
  function moveWasteToTableau(tIdx) {
    const card = waste[waste.length - 1];
    setWaste(waste.slice(0, -1));
    setTableau((t) => {
      const copy = t.map((col, i) => (i === tIdx ? [...col, card] : col));
      return copy;
    });
  }
  function moveTableauToTableau(fromCol, fromRow, toCol) {
    setTableau((t) => {
      const moving = t[fromCol].slice(fromRow);
      const newFrom = t[fromCol].slice(0, fromRow);
      if (newFrom.length && !newFrom[newFrom.length - 1].faceUp)
        newFrom[newFrom.length - 1].faceUp = true;
      const copy = t.map((col, i) => {
        if (i === fromCol) return newFrom;
        if (i === toCol) return [...col, ...moving];
        return col;
      });
      return copy;
    });
  }
  function moveTableauToFoundation(fromCol, fromRow, toFoundation) {
    const card = tableau[fromCol][fromRow];
    setFoundations((f) => {
      const copy = f.map((pile, i) =>
        i === toFoundation ? [...pile, card] : pile
      );
      return copy;
    });
    setTableau((t) => {
      const newCol = t[fromCol].slice(0, fromRow);
      // Flip next card if needed
      if (newCol.length && !newCol[newCol.length - 1].faceUp)
        newCol[newCol.length - 1].faceUp = true;
      return t.map((col, i) => (i === fromCol ? newCol : col));
    });
  }
  function moveFoundationToTableau(fromFoundation, toCol) {
    const card =
      foundations[fromFoundation][foundations[fromFoundation].length - 1];
    setFoundations((f) => {
      const copy = f.map((pile, i) =>
        i === fromFoundation ? pile.slice(0, -1) : pile
      );
      return copy;
    });
    setTableau((t) => {
      const copy = t.map((col, i) => (i === toCol ? [...col, card] : col));
      return copy;
    });
  }

  // Card rendering
  const renderCard = (card, isSelected) => (
    <div
      className={`w-12 h-18 sm:w-16 sm:h-24 rounded-lg border-2 flex flex-col items-center justify-center text-sm sm:text-xl font-bold shadow-md select-none cursor-pointer
        ${CARD_COLORS[card.color]} ${isSelected ? "ring-4 ring-yellow-400" : ""}
        ${!card.faceUp ? "bg-gray-700 border-gray-500 text-gray-700" : ""}
      `}
      style={{
        marginTop: window.innerWidth < 640 ? "-1.8rem" : "-2.2rem",
        zIndex: isSelected ? 10 : undefined,
      }}
    >
      {card.faceUp ? (
        <>
          <span className="text-xs sm:text-base">{card.rank}</span>
          <span className="text-xs sm:text-base">{card.suit}</span>
        </>
      ) : (
        <span className="text-gray-400 text-sm sm:text-base">🂠</span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 p-2 sm:p-4 rounded-lg shadow-xl relative flex flex-col items-center w-full max-w-[1200px] min-w-[320px] max-h-[95vh] overflow-y-auto">
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
          Solitaire
        </h2>
        {/* Foundations, Stock, and Waste above tableau, aligned to columns */}
        <div
          className="w-full flex flex-row justify-center mb-6 sm:mb-8 lg:mb-12 relative"
          style={{ minHeight: "80px", paddingTop: "25px" }}
        >
          {/* 7 columns: 2 for stock/waste, 1 spacer, 4 for foundations */}
          <div className="flex flex-row w-full max-w-[560px] mx-auto px-2">
            {/* Stock above col 0 */}
            <div className="flex flex-col items-center w-12 sm:w-16 mr-2 sm:mr-6">
              <div
                className="w-12 h-18 sm:w-16 sm:h-24 rounded-lg border-2 border-amber-700 bg-black flex flex-col items-center justify-center cursor-pointer mb-2"
                onClick={handleStockClick}
              >
                {stock.length === 0 ? (
                  <span className="text-gray-700 text-lg sm:text-2xl">↺</span>
                ) : (
                  <span className="text-gray-400 text-lg sm:text-2xl">🂠</span>
                )}
              </div>
            </div>
            {/* Waste above col 1 */}
            <div className="flex flex-col items-center w-12 sm:w-16 mr-4 sm:mr-12">
              <div
                className="w-12 h-18 sm:w-16 sm:h-24 rounded-lg border-2 border-amber-700 bg-black flex flex-col items-center justify-center cursor-pointer mb-2"
                onClick={() => handleCardClick("waste")}
              >
                {waste.length > 0 && renderCard(waste[waste.length - 1])}
              </div>
            </div>
            {/* Spacer for columns 2-3 */}
            <div className="w-12 sm:w-16 mr-2 sm:mr-6" />
            {/* Foundations above cols 3-6 */}
            {foundations.map((pile, i) => (
              <div
                key={i}
                className="flex flex-col items-center w-12 sm:w-16 mr-2 sm:mr-6 last:mr-0"
              >
                <div
                  className="w-12 h-18 sm:w-16 sm:h-24 rounded-lg border-2 border-amber-700 bg-black flex flex-col items-center justify-center cursor-pointer mb-2"
                  onClick={() => handleFoundationClick(i)}
                >
                  {pile.length === 0 ? (
                    <span className="text-gray-700 text-lg sm:text-2xl">A</span>
                  ) : (
                    renderCard(pile[pile.length - 1])
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Tableau, spaced below the row above */}
        <div className="flex space-x-2 sm:space-x-4 lg:space-x-6 w-full justify-center mt-4 sm:mt-6 px-2">
          {tableau.map((col, colIdx) => (
            <div
              key={colIdx}
              className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[470px] w-12 sm:w-16"
              style={{ minHeight: "320px" }}
            >
              {col.length === 0 ? (
                <div
                  className="absolute top-0 left-0 w-full h-18 sm:h-24 flex items-center justify-center border-2 border-dashed border-amber-700 bg-black bg-opacity-30 cursor-pointer"
                  style={{ minHeight: "72px" }}
                  onClick={() => {
                    if (
                      selected &&
                      selected.from === "tableau" &&
                      tableau[selected.col][selected.row].rank === "K"
                    ) {
                      moveTableauToTableau(selected.col, selected.row, colIdx);
                      setSelected(null);
                    }
                  }}
                >
                  <span className="text-amber-700 text-sm sm:text-lg select-none">
                    K
                  </span>
                </div>
              ) : null}
              {col.map((card, rowIdx) => (
                <div
                  key={rowIdx}
                  onClick={() => handleCardClick("tableau", colIdx, rowIdx)}
                  style={{
                    position: "absolute",
                    top: rowIdx * (window.innerWidth < 640 ? 28 : 38),
                    left: 0,
                    width: "100%",
                    zIndex: rowIdx,
                  }}
                >
                  {renderCard(
                    card,
                    selected &&
                      selected.from === "tableau" &&
                      selected.col === colIdx &&
                      selected.row === rowIdx
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        {gameWon && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
              <h2 className="text-4xl font-bold text-bright-green mb-4">
                You Win!
              </h2>
              <div className="mt-6">
                <button
                  onClick={newGame}
                  className="px-4 py-2 bg-gradient-to-r from-bright-green to-emerald-600 text-dark-grey rounded-md border border-bright-green hover:from-emerald-600 hover:to-bright-green transition-all duration-300 shadow-[0_0_10px_rgba(0,204,126,0.3)]"
                >
                  New Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Solitaire;
