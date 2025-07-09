import { useState, useEffect } from "react";
import sharkImage from "../assets/memory-animals/Shark.jpg";
import jellyfishImage from "../assets/memory-animals/Jellyfish.jpg";
import otterImage from "../assets/memory-animals/Otter.jpg";
import penguinImage from "../assets/memory-animals/Penguin.jpg";
import elephantImage from "../assets/memory-animals/Elephant.jpg";
import lionImage from "../assets/memory-animals/Lion.jpg";
import catImage from "../assets/memory-animals/Cat.jpg";
import giraffeImage from "../assets/memory-animals/Giraffe.jpg";
import tigerImage from "../assets/memory-animals/Tiger.jpg";
import pandaImage from "../assets/memory-animals/Panda.jpg";
import flamingoImage from "../assets/memory-animals/Flamingo.jpg";
import deerImage from "../assets/memory-animals/Deer.jpg";
import koalaImage from "../assets/memory-animals/Koala.jpg";
import owlImage from "../assets/memory-animals/Owl.jpg";
import hummingbirdImage from "../assets/memory-animals/Hummingbird.jpg";
import peacockImage from "../assets/memory-animals/Peacock.jpg";
import greyDogImage from "../assets/memory-animals/Grey Dog.jpg";
import polarBearImage from "../assets/memory-animals/Polar Bear.jpg";

const animals = [
  {
    id: 1,
    name: "Shark",
    image: sharkImage,
  },
  {
    id: 2,
    name: "Jellyfish",
    image: jellyfishImage,
  },
  {
    id: 3,
    name: "Otter",
    image: otterImage,
  },
  {
    id: 4,
    name: "Penguin",
    image: penguinImage,
  },
  {
    id: 5,
    name: "Elephant",
    image: elephantImage,
  },
  {
    id: 6,
    name: "Lion",
    image: lionImage,
  },
  {
    id: 7,
    name: "Cat",
    image: catImage,
  },
  {
    id: 8,
    name: "Giraffe",
    image: giraffeImage,
  },
  {
    id: 9,
    name: "Tiger",
    image: tigerImage,
  },
  {
    id: 10,
    name: "Panda",
    image: pandaImage,
  },
  {
    id: 11,
    name: "Flamingo",
    image: flamingoImage,
  },
  {
    id: 12,
    name: "Deer",
    image: deerImage,
  },
  {
    id: 13,
    name: "Koala",
    image: koalaImage,
  },
  {
    id: 14,
    name: "Owl",
    image: owlImage,
  },
  {
    id: 15,
    name: "Hummingbird",
    image: hummingbirdImage,
  },
  {
    id: 16,
    name: "Peacock",
    image: peacockImage,
  },
  {
    id: 17,
    name: "Grey Dog",
    image: greyDogImage,
  },
  {
    id: 18,
    name: "Polar Bear",
    image: polarBearImage,
  },
];

const MemoryMatch = ({ onClose }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerScores, setPlayerScores] = useState({ 1: 0, 2: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize the game
  useEffect(() => {
    resetGame();
  }, []);

  // Handle card click
  const handleCardClick = (clickedCard) => {
    // Don't allow clicking if:
    // 1. Card is already flipped
    // 2. Two cards are already flipped
    // 3. Card is already matched
    // 4. Game is processing (waiting for cards to flip back)
    if (
      flippedCards.includes(clickedCard.uniqueId) ||
      flippedCards.length === 2 ||
      matchedPairs.includes(clickedCard.id) ||
      isProcessing
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, clickedCard.uniqueId];
    setFlippedCards(newFlippedCards);

    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      setIsProcessing(true);

      const [firstCard, secondCard] = newFlippedCards.map((id) =>
        cards.find((card) => card.uniqueId === id)
      );

      if (firstCard.id === secondCard.id) {
        // Match found
        setMatchedPairs((prev) => [...prev, firstCard.id]);
        setFlippedCards([]);
        setIsProcessing(false);

        // Update player score
        setPlayerScores((prev) => ({
          ...prev,
          [currentPlayer]: prev[currentPlayer] + 1,
        }));

        // Check if all pairs are matched
        if (matchedPairs.length + 1 === animals.length) {
          setGameWon(true);
        }
      } else {
        // No match, flip cards back after a delay and switch players
        setTimeout(() => {
          setFlippedCards([]);
          setIsProcessing(false);
          setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
        }, 1000);
      }
    }
  };

  // Reset the game
  const resetGame = () => {
    const gameAnimals = animals.slice(0, 18); // Use only the first 18 animals
    const gameCards = [...gameAnimals, ...gameAnimals]
      .map((card, index) => ({ ...card, uniqueId: index }))
      .sort(() => Math.random() - 0.5);
    setCards(gameCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameWon(false);
    setCurrentPlayer(1);
    setPlayerScores({ 1: 0, 2: 0 });
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent">
            Memory Match
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="text-gray-300">Player {currentPlayer}'s Turn</div>
          <div className="text-gray-300">
            Player 1:{" "}
            <span className="text-bright-green">{playerScores[1]}</span> |
            Player 2:{" "}
            <span className="text-bright-green">{playerScores[2]}</span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2 mb-4">
          {cards.map((card) => (
            <div
              key={card.uniqueId}
              className={`
                relative w-20 h-20 cursor-pointer transition-transform duration-500 transform-style-3d
                ${
                  flippedCards.includes(card.uniqueId) ||
                  matchedPairs.includes(card.id)
                    ? "rotate-y-180"
                    : ""
                }
                ${isProcessing ? "pointer-events-none" : ""}
              `}
              onClick={() => handleCardClick(card)}
            >
              {/* Front of the card (face down) */}
              <div
                className={`
                  absolute inset-0 w-full h-full backface-hidden rounded-lg
                  ${
                    flippedCards.includes(card.uniqueId) ||
                    matchedPairs.includes(card.id)
                      ? "hidden"
                      : "block"
                  }
                  flex items-center justify-center
                `}
              >
                <img
                  src="/Memory Green Card.png"
                  alt="Card back"
                  className="w-full h-full object-cover rounded-lg"
                  draggable="false"
                />
              </div>
              {/* Back of the card (face up - animal image) */}
              <div
                className={`
                  absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg overflow-hidden
                  ${
                    flippedCards.includes(card.uniqueId) ||
                    matchedPairs.includes(card.id)
                      ? "block"
                      : "hidden"
                  }
                  bg-gray-700 flex items-center justify-center
                `}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-[75px] h-[75px] object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={resetGame}
            className="px-3 py-1 bg-transparent border border-white rounded-md transition-colors hover:bg-gray-700/50"
          >
            <span className="bg-gradient-to-r from-bright-green to-emerald-600 bg-clip-text text-transparent text-sm">
              Restart
            </span>
          </button>
          <div className="text-gray-300">
            Moves: <span className="text-bright-green">{moves}</span>
          </div>
        </div>

        {gameWon && (
          <div className="mt-4 text-center">
            <p className="text-bright-green font-bold text-xl">
              {playerScores[1] > playerScores[2]
                ? "Player 1 wins!"
                : playerScores[2] > playerScores[1]
                ? "Player 2 wins!"
                : "It's a tie!"}
            </p>
            <p className="text-gray-300 mt-2">
              Final Score - Player 1: {playerScores[1]} | Player 2:{" "}
              {playerScores[2]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryMatch;
