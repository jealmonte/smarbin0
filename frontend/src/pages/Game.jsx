import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthNavbar from '../components/AuthNavbar';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 100;

export default function Game() {
  const navigate = useNavigate();
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState([
    { name: "Player 1", score: 25 },
    { name: "Player 2", score: 18 },
    { name: "Player 3", score: 15 }
  ]);
  const [binBucks, setBinBucks] = useState(85);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameLoopRef = useRef();
  const canvasRef = useRef();

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
    setBinBucks(prev => prev - 5);
  }, [generateFood]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw snake
    ctx.fillStyle = '#10b981';
    snake.forEach(segment => {
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );
    });

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(
      food.x * CELL_SIZE,
      food.y * CELL_SIZE,
      CELL_SIZE - 1,
      CELL_SIZE - 1
    );
  }, [snake, food]);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const head = snake[0];
    const newHead = {
      x: head.x + direction.x,
      y: head.y + direction.y
    };

    // Check wall collision
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      setGameOver(true);
      return;
    }

    // Check collision with self
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      setGameOver(true);
      return;
    }

    const newSnake = [newHead, ...snake];

    // Check if food is eaten
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore(prev => prev + 1);
      setFood(generateFood());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying) return;

      const keyDirections = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };

      const newDirection = keyDirections[e.key];
      if (newDirection) {
        const isOpposite = (
          newDirection.x === -direction.x && 
          newDirection.y === -direction.y
        );
        if (!isOpposite) {
          setDirection(newDirection);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
      return () => clearInterval(gameLoopRef.current);
    }
  }, [isPlaying, moveSnake]);

  useEffect(() => {
    if (gameOver) {
      clearInterval(gameLoopRef.current);
      setIsPlaying(false);
      if (score > highScores[highScores.length - 1]?.score) {
        const newHighScores = [...highScores, { name: "You", score }]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        setHighScores(newHighScores);
      }
    }
  }, [gameOver, score, highScores]);

  useEffect(() => {
    if (canvasRef.current) {
      drawGame();
    }
  }, [snake, food, drawGame]);

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
              <h2 className="text-2xl font-bold text-white mb-2">Snake Game</h2>
              <p className="text-emerald-400">binbucks: {binBucks}</p>
              {!isPlaying && binBucks >= 5 && !gameOver && (
                <button
                  onClick={resetGame}
                  className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors"
                >
                  Play (5 binbucks)
                </button>
              )}
              {binBucks < 5 && !isPlaying && (
                <p className="mt-4 text-red-400">You need at least 5 binbucks to play!</p>
              )}
              {isPlaying && <p className="mt-4 text-emerald-400">Score: {score}</p>}
              {gameOver && (
                <div className="mt-4">
                  <p className="text-red-400 mb-2">Game Over! Final Score: {score}</p>
                  {binBucks >= 5 && (
                    <button
                      onClick={resetGame}
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
                width={GRID_SIZE * CELL_SIZE}
                height={GRID_SIZE * CELL_SIZE}
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