import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, Timer } from 'lucide-react';
import AuthNavbar from '../components/AuthNavbar';

const GRID_SIZE = 16;
const MINES_COUNT = 40;

function createBoard() {
  const board = Array(GRID_SIZE).fill().map(() => 
    Array(GRID_SIZE).fill().map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0
    }))
  );

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < MINES_COUNT) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    
    if (!board[y][x].isMine) {
      board[y][x].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbor mines
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!board[y][x].isMine) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE) {
              if (board[ny][nx].isMine) count++;
            }
          }
        }
        board[y][x].neighborMines = count;
      }
    }
  }

  return board;
}

function revealCell(board, x, y) {
  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return board;
  if (board[y][x].isRevealed || board[y][x].isFlagged) return board;

  const newBoard = JSON.parse(JSON.stringify(board));
  newBoard[y][x].isRevealed = true;

  if (newBoard[y][x].neighborMines === 0 && !newBoard[y][x].isMine) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        revealCell(newBoard, x + dx, y + dy);
      }
    }
  }

  return newBoard;
}

export default function Minesweeper() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(createBoard());
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [binBucks, setBinBucks] = useState(85);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [hasUnlocked, setHasUnlocked] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying && !gameOver && !gameWon) {
      timer = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, gameWon]);

  const startGame = () => {
    if (!hasUnlocked) {
      setBinBucks(prev => prev - 50);
      setHasUnlocked(true);
    } else {
      setBinBucks(prev => prev - 5);
    }
    setBoard(createBoard());
    setGameOver(false);
    setGameWon(false);
    setTime(0);
    setFlagsPlaced(0);
    setIsPlaying(true);
  };

  const handleCellClick = (x, y) => {
    if (!isPlaying || gameOver || gameWon) return;

    const cell = board[y][x];
    if (cell.isFlagged) return;

    if (cell.isMine) {
      setGameOver(true);
      return;
    }

    const newBoard = revealCell(board, x, y);
    setBoard(newBoard);

    // Check for win
    const unrevealedSafeCells = newBoard.flat().filter(
      cell => !cell.isRevealed && !cell.isMine
    ).length;

    if (unrevealedSafeCells === 0) {
      setGameWon(true);
    }
  };

  const handleRightClick = (e, x, y) => {
    e.preventDefault();
    if (!isPlaying || gameOver || gameWon) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    const cell = newBoard[y][x];

    if (!cell.isRevealed) {
      cell.isFlagged = !cell.isFlagged;
      setBoard(newBoard);
      setFlagsPlaced(prev => cell.isFlagged ? prev + 1 : prev - 1);
    }
  };

  const getCellColor = (cell) => {
    if (cell.isRevealed) {
      if (cell.isMine) return 'bg-red-600';
      return cell.neighborMines === 0 ? 'bg-emerald-900' : 'bg-emerald-800';
    }
    return 'bg-emerald-700 hover:bg-emerald-600';
  };

  const getCellContent = (cell) => {
    if (!cell.isRevealed) return cell.isFlagged ? <Flag size={14} /> : null;
    if (cell.isMine) return '💣';
    return cell.neighborMines || '';
  };

  const getNumberColor = (number) => {
    const colors = ['text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400'];
    return colors[(number - 1) % colors.length];
  };

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
              <h2 className="text-2xl font-bold text-white mb-2">Minesweeper</h2>
              <p className="text-emerald-400">binbucks: {binBucks}</p>
              
              {!isPlaying && (
                <div>
                  {!hasUnlocked && binBucks < 50 ? (
                    <p className="mt-4 text-red-400">You need 50 binbucks to unlock this game!</p>
                  ) : hasUnlocked && binBucks < 5 ? (
                    <p className="mt-4 text-red-400">You need 5 binbucks to play!</p>
                  ) : (
                    <button
                      onClick={startGame}
                      className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition-colors"
                    >
                      {!hasUnlocked ? 'Unlock and Play (50 binbucks)' : 'Play (5 binbucks)'}
                    </button>
                  )}
                </div>
              )}

              {isPlaying && (
                <div className="flex justify-center items-center gap-8 mt-4 mb-6">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Timer size={20} />
                    <span>{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Flag size={20} />
                    <span>{flagsPlaced}/{MINES_COUNT}</span>
                  </div>
                </div>
              )}

              {gameOver && (
                <div className="mt-4">
                  <p className="text-red-400 mb-2">Game Over!</p>
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

              {gameWon && (
                <div className="mt-4">
                  <p className="text-emerald-400 mb-2">
                    Congratulations! Time: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                  </p>
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

            <div className="flex justify-center">
              <div className="grid grid-cols-16 gap-1 bg-black p-2 rounded-lg">
                {board.map((row, y) => (
                  row.map((cell, x) => (
                    <button
                      key={`${x}-${y}`}
                      onClick={() => handleCellClick(x, y)}
                      onContextMenu={(e) => handleRightClick(e, x, y)}
                      className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${getCellColor(cell)} transition-colors rounded`}
                      disabled={!isPlaying || gameOver || gameWon}
                    >
                      <span className={cell.neighborMines > 0 ? getNumberColor(cell.neighborMines) : ''}>
                        {getCellContent(cell)}
                      </span>
                    </button>
                  ))
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}