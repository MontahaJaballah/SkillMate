import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chessboard } from 'react-chessboard';
import * as ChessModule from 'chess.js';
import ChessSidebar from '../../../components/Chess/ChessSidebar';
import { Howl } from 'howler';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const AILearningView = () => {
    const [game, setGame] = useState(new ChessModule.Chess());
    const [fen, setFen] = useState(game.fen());
    const [error, setError] = useState('');
    const [moveHistory, setMoveHistory] = useState([]);
    const [gameStatus, setGameStatus] = useState('');
    const [whiteTime, setWhiteTime] = useState(0);
    const [blackTime, setBlackTime] = useState(0);
    const stockfishRef = useRef(null);
    const timerRef = useRef(null);

    const moveSound = new Howl({ src: ['/sounds/move.mp3'] });
    const checkSound = new Howl({ src: ['/sounds/check.mp3'] });
    const checkmateSound = new Howl({ src: ['/sounds/checkmate.mp3'] });

    // Timer logic
    useEffect(() => {
        const startTimer = () => {
            timerRef.current = setInterval(() => {
                if (gameStatus.includes('Game Over')) {
                    clearInterval(timerRef.current);
                    return;
                }
                if (game.turn() === 'w') {
                    setWhiteTime((prev) => prev + 1);
                } else {
                    setBlackTime((prev) => prev + 1);
                }
            }, 1000);
        };

        startTimer();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [game, gameStatus]);

    // Save game to local storage when it ends
    const saveGameToHistory = (result) => {
        console.log('saveGameToHistory called with result:', result);

        try {
            const games = JSON.parse(localStorage.getItem('chessGames')) || [];
            console.log('Current games in local storage before saving:', games);

            const gameData = {
                id: Date.now(),
                date: new Date().toISOString(),
                moveHistory: game.history({ verbose: true }),
                whiteTime,
                blackTime,
                result,
            };

            console.log('New game data to save:', gameData);

            games.push(gameData);
            localStorage.setItem('chessGames', JSON.stringify(games));
            console.log('Game saved to local storage. New local storage content:', localStorage.getItem('chessGames'));

            // Dispatch a custom event to notify other components
            window.dispatchEvent(new Event('gameSaved'));
            console.log('Dispatched gameSaved event');
        } catch (err) {
            console.error('Error saving game to local storage:', err);
        }
    };

    useEffect(() => {
        const initStockfish = () => {
            try {
                console.log('Attempting to initialize Stockfish Web Worker...');
                const worker = new Worker('/stockfish/stockfish-nnue-16-single.js', { type: 'module' });
                console.log('Web Worker created:', worker);

                worker.onerror = (err) => {
                    console.error('Web Worker error:', err);
                    setError('Web Worker failed: ' + err.message);
                };

                worker.onmessage = (event) => {
                    const message = event.data;
                    console.log('Stockfish message:', message);
                    if (message.startsWith('bestmove')) {
                        const bestMove = message.split(' ')[1];
                        console.log('Best move received:', bestMove, 'game.turn():', game.turn());
                        if (bestMove && game.turn() === 'b') {
                            console.log('Calling makeAIMove with bestMove:', bestMove);
                            makeAIMove(bestMove);
                        } else {
                            console.log('makeAIMove not called. bestMove:', bestMove, 'game.turn():', game.turn());
                        }
                    } else if (message === 'readyok') {
                        console.log('Stockfish is ready');
                        worker.postMessage('ucinewgame');
                        worker.postMessage('setoption name UCI_LimitStrength value true');
                        worker.postMessage('setoption name UCI_Elo value 3190');
                    }
                };

                stockfishRef.current = worker;
                console.log('Sending UCI commands to Stockfish...');
                worker.postMessage('uci');
                worker.postMessage('isready');
            } catch (err) {
                console.error('Failed to initialize Stockfish:', err);
                setError('Failed to initialize Stockfish: ' + err.message);
            }
        };

        initStockfish();

        return () => {
            if (stockfishRef.current) {
                console.log('Terminating Stockfish Web Worker on unmount...');
                stockfishRef.current.terminate();
                stockfishRef.current = null;
            }
        };
    }, []);

    const makeAIMove = (bestMove) => {
        console.log('makeAIMove called with bestMove:', bestMove, 'Current FEN:', game.fen(), 'Turn:', game.turn());
        try {
            const tempGame = new ChessModule.Chess(game.fen());
            console.log('Validating move in tempGame:', { from: bestMove.substring(0, 2), to: bestMove.substring(2, 4) });
            const move = tempGame.move({
                from: bestMove.substring(0, 2),
                to: bestMove.substring(2, 4),
                promotion: bestMove.length > 4 ? bestMove[4] : undefined,
            });

            if (move === null) {
                console.error('AI suggested an invalid move:', bestMove, 'Current FEN:', game.fen());
                setError('AI suggested an invalid move');
                return;
            }

            console.log('Applying valid move to game:', { from: bestMove.substring(0, 2), to: bestMove.substring(2, 4) });
            const actualMove = game.move({
                from: bestMove.substring(0, 2),
                to: bestMove.substring(2, 4),
                promotion: bestMove.length > 4 ? bestMove[4] : undefined,
            });

            console.log('AI move applied:', actualMove.san, 'New FEN:', game.fen(), 'Turn:', game.turn());
            setFen(game.fen());
            setMoveHistory([...game.history({ verbose: true })]);

            if (game.inCheck()) {
                checkSound.play();
            } else {
                moveSound.play();
            }

            if (game.isCheckmate()) {
                const result = game.turn() === 'w' ? 'Black Wins' : 'White Wins';
                setGameStatus(`Game Over - Result: ${result}`);
                checkmateSound.play();
                saveGameToHistory(result);
            } else if (game.isDraw()) {
                setGameStatus('Game Over - Result: Draw');
                saveGameToHistory('Draw');
            }
        } catch (e) {
            console.error('Error making AI move:', e, 'Current FEN:', game.fen(), 'Turn:', game.turn());
            setError('Error making AI move: Invalid move: ' + JSON.stringify({ from: bestMove.substring(0, 2), to: bestMove.substring(2, 4) }));
        }
    };

    const onDrop = (sourceSquare, targetSquare) => {
        if (game.turn() !== 'w') {
            console.log('Not White\'s turn, rejecting move. Current turn:', game.turn());
            return false;
        }

        try {
            console.log('User attempting move:', { from: sourceSquare, to: targetSquare });
            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            });

            if (move === null) {
                console.log('Invalid user move:', { from: sourceSquare, to: targetSquare });
                return false;
            }

            console.log('User move applied:', move.san, 'Current FEN:', game.fen(), 'Turn:', game.turn());
            setFen(game.fen());
            setMoveHistory([...game.history({ verbose: true })]);

            if (game.inCheck()) {
                checkSound.play();
            } else {
                moveSound.play();
            }

            if (game.isCheckmate()) {
                const result = game.turn() === 'w' ? 'Black Wins' : 'White Wins';
                setGameStatus(`Game Over - Result: ${result}`);
                checkmateSound.play();
                saveGameToHistory(result);
                return true;
            } else if (game.isDraw()) {
                setGameStatus('Game Over - Result: Draw');
                saveGameToHistory('Draw');
                return true;
            }

            if (game.turn() === 'b' && stockfishRef.current) {
                const fenToSend = game.fen();
                console.log('Sending position to Stockfish:', fenToSend);
                stockfishRef.current.postMessage(`position fen ${fenToSend}`);
                stockfishRef.current.postMessage('go movetime 1000');
            } else {
                console.log('Not Black\'s turn after user move, or Stockfish not initialized. Current turn:', game.turn());
            }

            return true;
        } catch (e) {
            console.error('Error making user move:', e, 'Current FEN:', game.fen(), 'Turn:', game.turn());
            return false;
        }
    };

    const resetBoard = () => {
        const newGame = new ChessModule.Chess();
        setGame(newGame);
        setFen(newGame.fen());
        setError('');
        setMoveHistory([]);
        setGameStatus('');
        setWhiteTime(0);
        setBlackTime(0);
        console.log('Board reset, FEN:', newGame.fen(), 'Turn:', newGame.turn());
        if (stockfishRef.current) {
            stockfishRef.current.postMessage('ucinewgame');
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const particlesInit = async (engine) => {
        await loadSlim(engine);
    };

    return (
        <div className="flex min-h-screen bg-black text-white relative overflow-hidden">
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={{
                    background: {
                        color: {
                            value: "transparent",
                        },
                    },
                    fpsLimit: 60,
                    particles: {
                        number: {
                            value: 50,
                            density: {
                                enable: true,
                                value_area: 800,
                            },
                        },
                        color: {
                            value: ["#00ffcc", "#ff00cc", "#00ccff"],
                        },
                        shape: {
                            type: "circle",
                        },
                        opacity: {
                            value: 0.5,
                            random: true,
                        },
                        size: {
                            value: 3,
                            random: true,
                        },
                        move: {
                            enable: true,
                            speed: 2,
                            direction: "none",
                            random: true,
                            straight: false,
                            out_mode: "out",
                        },
                    },
                    interactivity: {
                        events: {
                            onhover: {
                                enable: true,
                                mode: "repulse",
                            },
                        },
                        modes: {
                            repulse: {
                                distance: 100,
                                duration: 0.4,
                            },
                        },
                    },
                    detectRetina: true,
                }}
                className="absolute inset-0 z-0"
            />

            <ChessSidebar />

            <div className="flex-1 ml-64 p-6 relative z-10">
                <motion.div
                    className="max-w-5xl mx-auto"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">
                        AI Learning: Battle the Master
                    </h1>
                    <p className="text-lg text-gray-300 mb-12">
                        Challenge the AI at Expert level (Elo 3190) and elevate your chess skills!
                    </p>

                    <div className="flex justify-center gap-4 items-start">
                        <motion.div
                            className={`relative ${game.turn() === 'b' ? 'animate-glow' : ''}`}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex justify-between mb-4">
                                <div className="text-center">
                                    <h3 className="text-lg text-cyan-400">White</h3>
                                    <div className={`text-2xl font-mono ${game.turn() === 'w' ? 'text-white animate-pulse' : 'text-gray-400'}`}>
                                        {formatTime(whiteTime)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg text-pink-400">Black</h3>
                                    <div className={`text-2xl font-mono ${game.turn() === 'b' ? 'text-white animate-pulse' : 'text-gray-400'}`}>
                                        {formatTime(blackTime)}
                                    </div>
                                </div>
                            </div>

                            <Chessboard
                                position={fen}
                                onPieceDrop={onDrop}
                                boardWidth={450}
                                showCapturedPieces={false}
                                customBoardStyle={{
                                    borderRadius: '10px',
                                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                                }}
                                customDarkSquareStyle={{ backgroundColor: '#2b2b2b' }}
                                customLightSquareStyle={{ backgroundColor: '#e0e0e0' }}
                            />
                            <button
                                onClick={resetBoard}
                                className="mt-4 w-full px-6 py-2 rounded text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-glow"
                            >
                                Reset Board
                            </button>
                        </motion.div>

                        <div className="flex-1 max-w-xs">
                            <h3 className="text-xl mb-2 text-cyan-400">Current Turn</h3>
                            <div
                                className={`p-2 rounded-lg text-white text-center mb-4 ${
                                    game.turn() === 'w' ? 'bg-gray-200 text-black' : 'bg-gray-800'
                                }`}
                            >
                                {game.turn() === 'w' ? 'White' : 'Black'}'s Turn
                            </div>

                            <h3 className="text-xl mb-2 text-cyan-400">Move History</h3>
                            <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                {moveHistory.length === 0 ? (
                                    <p className="text-gray-400">No moves yet.</p>
                                ) : (
                                    <ol className="list-decimal list-inside text-gray-300">
                                        {moveHistory.map((move, index) => {
                                            const isLastMove = index === moveHistory.length - 1;
                                            const displayMove = isLastMove && game.isCheckmate() ? `${move.san}#` : move.san;
                                            return (
                                                <li key={index} className="text-left">
                                                    {Math.floor(index / 2) + 1}. {index % 2 === 0 ? 'White: ' : 'Black: '}{' '}
                                                    {displayMove}
                                                </li>
                                            );
                                        })}
                                    </ol>
                                )}
                            </div>

                            <div className="mt-4">
                                <h3 className="text-xl mb-2 text-cyan-400">Game Status</h3>
                                <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg shadow-lg">
                                    <p className="text-gray-300">
                                        {gameStatus || (game.turn() === 'w' ? 'Your turn!' : 'AI is thinking...')}
                                    </p>
                                    {gameStatus.includes('Game Over') && (
                                        <div className="mt-2">
                                            <p className="text-gray-300">
                                                Time: White {formatTime(whiteTime)} | Black {formatTime(blackTime)}
                                            </p>
                                            <p className="text-gray-300">Moves: {moveHistory.length}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 p-4 bg-red-900 bg-opacity-80 text-red-300 rounded-lg">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {gameStatus.includes('Game Over') && (
                            <motion.div
                                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.div
                                    className="bg-gradient-to-r from-cyan-500 to-pink-500 p-8 rounded-lg shadow-lg text-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 100 }}
                                >
                                    <h2 className="text-4xl font-bold text-white mb-4">
                                        {gameStatus.includes('Checkmate')
                                            ? 'Checkmate!'
                                            : 'Game Over!'}
                                    </h2>
                                    <p className="text-lg text-gray-200 mb-2">
                                        {gameStatus.includes('Result') ? gameStatus.split('Result: ')[1] : 'Draw'}
                                    </p>
                                    <p className="text-gray-200 mb-6">
                                        Time: White {formatTime(whiteTime)} | Black {formatTime(blackTime)} | Moves: {moveHistory.length}
                                    </p>
                                    <button
                                        onClick={resetBoard}
                                        className="px-6 py-3 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300"
                                    >
                                        Play Again
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <style jsx>{`
                .animate-glow {
                    animation: glow 1.5s infinite alternate;
                }

                @keyframes glow {
                    from {
                        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3), 0 0 20px rgba(0, 255, 255, 0.2);
                    }
                    to {
                        box-shadow: 0 0 20px rgba(0, 255, 255, 0.7), 0 0 40px rgba(0, 255, 255, 0.5);
                    }
                }

                .shadow-glow {
                    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
                }

                .animate-pulse {
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default AILearningView;