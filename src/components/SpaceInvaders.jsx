import React, { useState, useEffect, useRef, useCallback } from "react";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const ALIEN_WIDTH = 30;
const ALIEN_HEIGHT = 25;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 10;
const ALIEN_ROWS = 5;
const ALIEN_COLS = 11;
const ALIEN_START_X = 50;
const ALIEN_START_Y = 50;
const ALIEN_SPACING = 35;

const SpaceInvaders = ({ onClose }) => {
  const [gameState, setGameState] = useState("playing");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  // Player state
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [playerBullets, setPlayerBullets] = useState([]);

  // Aliens state
  const [aliens, setAliens] = useState([]);
  const [alienDirection, setAlienDirection] = useState(1); // 1 = right, -1 = left
  const [alienSpeed, setAlienSpeed] = useState(1);
  const [alienBullets, setAlienBullets] = useState([]);

  const gameLoopRef = useRef();
  const keysRef = useRef({});
  const lastShotRef = useRef(0);
  const lastAlienMoveRef = useRef(0);

  // Initialize aliens with proper scoring
  const initializeAliens = useCallback(() => {
    const newAliens = [];
    for (let row = 0; row < ALIEN_ROWS; row++) {
      for (let col = 0; col < ALIEN_COLS; col++) {
        newAliens.push({
          id: `${row}-${col}`,
          x: ALIEN_START_X + col * ALIEN_SPACING,
          y: ALIEN_START_Y + row * ALIEN_SPACING,
          alive: true,
          points: (ALIEN_ROWS - row) * 10, // Top row = 50, bottom row = 10
        });
      }
    }
    setAliens(newAliens);
  }, []);

  // Initialize game
  useEffect(() => {
    initializeAliens();

    const handleKeyDown = (e) => {
      keysRef.current[e.code] = true;
      if (e.code === "Space" && gameState === "playing") {
        e.preventDefault();
        const now = Date.now();
        if (now - lastShotRef.current > 300) {
          setPlayerBullets((prev) => [
            ...prev,
            {
              id: Date.now(),
              x: playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
              y: GAME_HEIGHT - PLAYER_HEIGHT - 20,
            },
          ]);
          lastShotRef.current = now;
        }
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, playerX, initializeAliens]);

  // Player movement
  useEffect(() => {
    if (gameState !== "playing") return;

    const playerLoop = () => {
      if (keysRef.current["ArrowLeft"] && playerX > 0) {
        setPlayerX((prev) => Math.max(0, prev - 5));
      }
      if (
        keysRef.current["ArrowRight"] &&
        playerX < GAME_WIDTH - PLAYER_WIDTH
      ) {
        setPlayerX((prev) => Math.min(GAME_WIDTH - PLAYER_WIDTH, prev + 5));
      }
    };

    const playerInterval = setInterval(playerLoop, 16);
    return () => clearInterval(playerInterval);
  }, [gameState, playerX]);

  // Bullet movement
  useEffect(() => {
    if (gameState !== "playing") return;

    const bulletLoop = () => {
      // Move player bullets
      setPlayerBullets((prev) =>
        prev
          .map((bullet) => ({ ...bullet, y: bullet.y - 8 }))
          .filter((bullet) => bullet.y > -BULLET_HEIGHT)
      );

      // Move alien bullets
      setAlienBullets((prev) =>
        prev
          .map((bullet) => ({ ...bullet, y: bullet.y + 4 }))
          .filter((bullet) => bullet.y < GAME_HEIGHT)
      );
    };

    const bulletInterval = setInterval(bulletLoop, 16);
    return () => clearInterval(bulletInterval);
  }, [gameState]);

  // Alien movement
  useEffect(() => {
    if (gameState !== "playing") return;

    const alienLoop = () => {
      const now = Date.now();
      if (now - lastAlienMoveRef.current > 200) {
        // Move every 200ms
        setAliens((prev) => {
          const aliveAliens = prev.filter((alien) => alien.alive);
          if (aliveAliens.length === 0) return prev;

          let shouldChangeDirection = false;
          const newAliens = prev.map((alien) => {
            if (!alien.alive) return alien;

            let newX = alien.x + alienSpeed * alienDirection;

            // Check if any alien hits the edges
            if (newX <= 0 || newX >= GAME_WIDTH - ALIEN_WIDTH) {
              shouldChangeDirection = true;
            }

            return { ...alien, x: newX };
          });

          if (shouldChangeDirection) {
            setAlienDirection((prev) => -prev);
            setAlienSpeed((prev) => prev + 0.5);
            return newAliens.map((alien) =>
              alien.alive ? { ...alien, y: alien.y + 20 } : alien
            );
          }

          return newAliens;
        });
        lastAlienMoveRef.current = now;
      }
    };

    const alienInterval = setInterval(alienLoop, 16);
    return () => clearInterval(alienInterval);
  }, [gameState, alienDirection, alienSpeed]);

  // Alien shooting
  useEffect(() => {
    if (gameState !== "playing") return;

    const shootingLoop = () => {
      if (Math.random() < 0.003) {
        // 0.3% chance per frame
        setAliens((currentAliens) => {
          const aliveAliens = currentAliens.filter((alien) => alien.alive);
          if (aliveAliens.length > 0) {
            const randomAlien =
              aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
            setAlienBullets((prev) => [
              ...prev,
              {
                id: Date.now(),
                x: randomAlien.x + ALIEN_WIDTH / 2 - BULLET_WIDTH / 2,
                y: randomAlien.y + ALIEN_HEIGHT,
              },
            ]);
          }
          return currentAliens;
        });
      }
    };

    const shootingInterval = setInterval(shootingLoop, 16);
    return () => clearInterval(shootingInterval);
  }, [gameState]);

  // Collision detection
  useEffect(() => {
    if (gameState !== "playing") return;

    const checkCollisions = () => {
      // Check player bullets hitting aliens
      setPlayerBullets((prev) => {
        const newBullets = [...prev];

        setAliens((currentAliens) => {
          const newAliens = [...currentAliens];
          newBullets.forEach((bullet, bulletIndex) => {
            for (
              let alienIndex = 0;
              alienIndex < newAliens.length;
              alienIndex++
            ) {
              const alien = newAliens[alienIndex];
              if (
                alien.alive &&
                bullet.x < alien.x + ALIEN_WIDTH &&
                bullet.x + BULLET_WIDTH > alien.x &&
                bullet.y < alien.y + ALIEN_HEIGHT &&
                bullet.y + BULLET_HEIGHT > alien.y
              ) {
                // Hit! Only hit one alien per bullet
                newAliens[alienIndex] = { ...alien, alive: false };
                newBullets.splice(bulletIndex, 1); // Remove this bullet
                setScore((prev) => prev + alien.points);
                break; // Exit the loop after hitting one alien
              }
            }
          });
          return newAliens;
        });

        return newBullets;
      });

      // Check alien bullets hitting player
      setAlienBullets((prev) => {
        const newBullets = [...prev];
        newBullets.forEach((bullet, bulletIndex) => {
          if (
            bullet.x < playerX + PLAYER_WIDTH &&
            bullet.x + BULLET_WIDTH > playerX &&
            bullet.y < GAME_HEIGHT - PLAYER_HEIGHT + ALIEN_HEIGHT &&
            bullet.y + BULLET_HEIGHT > GAME_HEIGHT - PLAYER_HEIGHT
          ) {
            // Player hit!
            newBullets.splice(bulletIndex, 1);
            setLives((prev) => prev - 1);
          }
        });
        return newBullets;
      });
    };

    const collisionInterval = setInterval(checkCollisions, 16);
    return () => clearInterval(collisionInterval);
  }, [gameState, playerX]);

  // Win/lose conditions
  useEffect(() => {
    if (gameState !== "playing") return;

    const checkGameState = () => {
      setAliens((currentAliens) => {
        const aliveAliens = currentAliens.filter((alien) => alien.alive);

        if (aliveAliens.length === 0) {
          setGameState("won");
          setLevel((prev) => prev + 1);
        } else if (lives <= 0) {
          setGameState("gameOver");
        } else if (
          aliveAliens.some(
            (alien) =>
              alien.y + ALIEN_HEIGHT >= GAME_HEIGHT - PLAYER_HEIGHT - 50
          )
        ) {
          setGameState("gameOver");
        }

        return currentAliens;
      });
    };

    const gameStateInterval = setInterval(checkGameState, 100);
    return () => clearInterval(gameStateInterval);
  }, [gameState, lives]);

  const newGame = () => {
    setGameState("playing");
    setScore(0);
    setLives(3);
    setLevel(1);
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    setPlayerBullets([]);
    setAlienBullets([]);
    setAlienDirection(1);
    setAlienSpeed(1);
    lastAlienMoveRef.current = 0;
    initializeAliens();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 p-2 sm:p-4 rounded-lg shadow-xl relative flex flex-col items-center w-full max-w-[900px] min-w-[320px]">
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
          Space Invaders
        </h2>

        {/* Game stats */}
        <div className="flex justify-between w-full mb-4 text-sm sm:text-base">
          <div className="text-bright-green">Score: {score}</div>
          <div className="text-bright-green">Level: {level}</div>
          <div className="text-bright-green">Lives: {lives}</div>
        </div>

        {/* Game canvas */}
        <div
          className="relative border-2 border-amber-700 bg-black rounded-lg overflow-hidden"
          style={{
            width: Math.min(GAME_WIDTH, window.innerWidth - 100),
            height: Math.min(GAME_HEIGHT, window.innerHeight - 200),
            maxWidth: "100%",
          }}
        >
          {/* Player */}
          <div
            className="absolute bg-gradient-to-r from-bright-green to-emerald-600 rounded-t-lg"
            style={{
              left: (playerX / GAME_WIDTH) * 100 + "%",
              bottom: "10px",
              width: (PLAYER_WIDTH / GAME_WIDTH) * 100 + "%",
              height: (PLAYER_HEIGHT / GAME_HEIGHT) * 100 + "%",
            }}
          />

          {/* Player bullets */}
          {playerBullets.map((bullet) => (
            <div
              key={bullet.id}
              className="absolute bg-bright-green rounded-sm"
              style={{
                left: (bullet.x / GAME_WIDTH) * 100 + "%",
                top: (bullet.y / GAME_HEIGHT) * 100 + "%",
                width: (BULLET_WIDTH / GAME_WIDTH) * 100 + "%",
                height: (BULLET_HEIGHT / GAME_HEIGHT) * 100 + "%",
              }}
            />
          ))}

          {/* Aliens */}
          {aliens.map(
            (alien) =>
              alien.alive && (
                <div
                  key={alien.id}
                  className="absolute bg-gray-600 rounded-lg flex items-center justify-center"
                  style={{
                    left: (alien.x / GAME_WIDTH) * 100 + "%",
                    top: (alien.y / GAME_HEIGHT) * 100 + "%",
                    width: (ALIEN_WIDTH / GAME_WIDTH) * 100 + "%",
                    height: (ALIEN_HEIGHT / GAME_HEIGHT) * 100 + "%",
                  }}
                >
                  <div className="w-2 h-2 bg-gray-800 rounded-full mx-1"></div>
                  <div className="w-2 h-2 bg-gray-800 rounded-full mx-1"></div>
                  <div className="w-1 h-1 bg-gray-800 rounded-full mx-0.5"></div>
                </div>
              )
          )}

          {/* Alien bullets */}
          {alienBullets.map((bullet) => (
            <div
              key={bullet.id}
              className="absolute bg-red-400 rounded-sm"
              style={{
                left: (bullet.x / GAME_WIDTH) * 100 + "%",
                top: (bullet.y / GAME_HEIGHT) * 100 + "%",
                width: (BULLET_WIDTH / GAME_WIDTH) * 100 + "%",
                height: (BULLET_HEIGHT / GAME_HEIGHT) * 100 + "%",
              }}
            />
          ))}

          {/* Game over overlay */}
          {gameState === "gameOver" && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-red-400 mb-4">
                  Game Over!
                </h3>
                <p className="text-white mb-4">Final Score: {score}</p>
                <button
                  onClick={newGame}
                  className="px-4 py-2 bg-gradient-to-r from-bright-green to-emerald-600 text-dark-grey rounded-md border border-bright-green hover:from-emerald-600 hover:to-bright-green transition-all duration-300 shadow-[0_0_10px_rgba(0,204,126,0.3)]"
                >
                  New Game
                </button>
              </div>
            </div>
          )}

          {/* Win overlay */}
          {gameState === "won" && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-bright-green mb-4">
                  Level Complete!
                </h3>
                <p className="text-white mb-4">Score: {score}</p>
                <button
                  onClick={newGame}
                  className="px-4 py-2 bg-gradient-to-r from-bright-green to-emerald-600 text-dark-grey rounded-md border border-bright-green hover:from-emerald-600 hover:to-bright-green transition-all duration-300 shadow-[0_0_10px_rgba(0,204,126,0.3)]"
                >
                  Next Level
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 text-center text-sm text-gray-300">
          <p>Use ← → arrows to move, SPACE to shoot</p>
        </div>
      </div>
    </div>
  );
};

export default SpaceInvaders;
