import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthNavbar from '../components/AuthNavbar';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#00f0f0'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#f0f000'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#a000f0'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#f0a000'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#0000f0'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#00f000'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#f00000'
  }
};

export default function Tetris() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [binBucks, setBinBucks] = useState(85);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [highScores] = useState([
    { name: "Player 1", score: 1200 },
    { name: "Player 2", score: 800 },
    { name: "Player 3", score: 500 }
  ]);
  const canvasRef = useRef();
  const gameLoopRef = useRef();

  function createEmptyBoard() {
    return Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
  }

  function getRandomTetromino() {
    const pieces = Object.keys(TETROMINOS);
    const tetromino = TETROMINOS[pieces[Math.floor(Math.random() * pieces.length)]];
    return {
      shape: tetromino.shape,
      color: tetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0
    };
  }

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = cell;
          ctx.fillRect(
            x * CELL_SIZE,
            y * CELL_SIZE,
            CELL_SIZE - 1,
            CELL_SIZE - 1
          );
        }
      });
    });

    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            ctx.fillRect(
              (currentPiece.x + x) * CELL_SIZE,
              (currentPiece.y + y) * CELL_SIZE,
              CELL_SIZE - 1,
              CELL_SIZE - 1
            );
          }
        });
      });
    }
  }, [board, currentPiece]);

  const moveDown = useCallback(() => {
    if (!currentPiece) return;

    const newY = currentPiece.y + 1;
    if (isValidMove(currentPiece.shape, currentPiece.x, newY)) {
      setCurrentPiece({ ...currentPiece, y: newY });
    } else {
      // Lock the piece
      const newBoard = [...board];
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            newBoard[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
          }
        });
      });

      // Check for completed lines
      let linesCleared = 0;
      for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (newBoard[y].every(cell => cell !== 0)) {
          newBoard.splice(y, 1);
          newBoard.unshift(Array(BOARD_WIDTH).fill(0));
          linesCleared++;
          y++;
        }
      }

      // Update score
      if (linesCleared > 0) {
        setScore(prev => prev + (linesCleared * 100));
      }

      setBoard(newBoard);
      const nextPiece = getRandomTetromino();
      
      // Check for game over
      if (!isValidMove(nextPiece.shape, nextPiece.x, nextPiece.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      setCurrentPiece(nextPiece);
    }
  }, [board, currentPiece]);

  function isValidMove(shape, x, y) {
    return shape.every((row, dy) =>
      row.every((cell, dx) =>
        !cell || // Empty cell in piece
        (
          y + dy >= 0 &&
          y + dy < BOARD_HEIGHT &&
          x + dx >= 0 &&
          x + dx < BOARD_WIDTH &&
          !board[y + dy][x + dx]
        )
      )
    );
  }

  const moveHorizontal = useCallback((direction) => {
    if (!currentPiece) return;

    const newX = currentPiece.x + direction;
    if (isValidMove(currentPiece.shape, newX, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, x: newX });
    }
  }, [currentPiece]);

  const rotate = useCallback(() => {
    if (!currentPiece) return;

    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );

    if (isValidMove(rotated, currentPiece.x, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  }, [currentPiece]);

  const startGame = () => {
    if (!hasUnlocked) {
      setBinBucks(prev => prev - 75);
      setHasUnlocked(true);
    } else {
      setBinBucks(prev => prev - 5);
    }
    setBoard(createEmptyBoard());
    setCurrentPiece(getRandomTetromino());
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      const handleKeyPress = (e) => {
        switch (e.key) {
          case 'ArrowLeft':
            moveHorizontal(-1);
            break;
          case 'ArrowRight':
            moveHorizontal(1);
            break;
          case 'ArrowDown':
            moveDown();
            break;
          case 'ArrowUp':
            rotate();
            break;
          default:
            break;
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      gameLoopRef.current = setInterval(moveDown, 1000);

      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        clearInterval(gameLoopRef.current);
      };
    }
  }, [isPlaying, moveDown, moveHorizontal, rotate]);

  useEffect(() => {
    if (canvasRef.current) {
      drawGame();
    }
  }, [board, currentPiece, drawGame]);

  return (
    <>
      <AuthNavbar />
      <div className="min-h-screen bg-black pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-900/50 rounded-lg p-8"
          >
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Tetris</h2>
              <p className="text-emerald-400">binbucks: {binBucks}</p>
              
              {!isPlaying && (
                <div>
                  {!hasUnlocked && binBucks < 75 ? (
                    <p className="mt-4 text-red-400">You need 75 binbucks to unlock this game!</p>
                  ) : hasUnlocked && binBucks < 5 ? (
                    <p className="mt-4 text-red-400">You need 5 binbucks to play!</p>
                  ) : (
                    <button
                      onClick={startGame}
                      className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors"
                    >
                      {!hasUnlocked ? 'Unlock and Play (75 binbucks)' : 'Play (5 binbucks)'}
                    </button>
                  )}
                </div>
              )}

              {isPlaying && <p className="mt-4 text-emerald-400">Score: {score}</p>}

              {gameOver && (
                <div className="mt-4">
                  <p className="text-red-400 mb-2">Game Over! Final Score: {score}</p>
                  {binBucks >= 5 && (
                    <button
                      onClick={startGame}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors"
                    >
                      Play Again (5 binbucks)
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center mb-8">
              <canvas
                ref={canvasRef}
                width={BOARD_WIDTH * CELL_SIZE}
                height={BOARD_HEIGHT * CELL_SIZE}
                className="border-2 border-emerald-600 rounded-lg"
              />
            </div>

            <div className="bg-black/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Leaderboard</h3>
              <div className="space-y-2">
                {highScores.map((entry, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-emerald-900/30 p-3 rounded"
                  >
                    <span className="text-emerald-300">{entry.name}</span>
                    <span className="text-white font-bold">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}