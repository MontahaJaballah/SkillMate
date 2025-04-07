import React, { useState, useEffect, useRef } from 'react';
import ChessSidebar from '../../../components/Chess/ChessSidebar';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { motion } from 'framer-motion';
import { Chessboard } from 'react-chessboard';
import * as ChessModule from 'chess.js';

const ChessAnalyticsView = () => {
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/5n5/8/8/5N5/PPPPPPPP/RNBQKB1R w KQkq - 0 1');
    const [analysis, setAnalysis] = useState([]);
    const stockfishRef = useRef(null);

    // Function to load games from local storage
    const loadGames = () => {
        const storedGames = JSON.parse(localStorage.getItem('chessGames')) || [];
        console.log('Loading games from local storage:', storedGames);
        setGames(storedGames);
    };

    // Load games on mount
    useEffect(() => {
        loadGames();
    }, []);

    // Listen for changes to local storage
    useEffect(() => {
        const handleStorageChange = (event) => {
            console.log('Storage event detected:', event);
            if (event.key === 'chessGames' || !event.key) { // Handle both cross-tab and same-tab events
                loadGames();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Initialize Stockfish for analysis
    useEffect(() => {
        const initStockfish = () => {
            try {
                const worker = new Worker('/stockfish/stockfish-nnue-16-single.js', { type: 'module' });
                worker.onmessage = (event) => {
                    const message = event.data;
                    console.log('Stockfish message:', message); // Debug: Log all Stockfish messages
                    if (message.startsWith('info')) {
                        const match = message.match(/score (cp|mate) (-?\d+)/);
                        if (match) {
                            const scoreType = match[1];
                            const scoreValue = parseInt(match[2]);
                            const evaluation = scoreType === 'mate' ? (scoreValue > 0 ? `Mate in ${scoreValue}` : `Mated in ${-scoreValue}`) : scoreValue / 100;
                            stockfishRef.current.evaluation = evaluation;
                        }
                        const bestMoveMatch = message.match(/pv (\S+)/);
                        if (bestMoveMatch) {
                            stockfishRef.current.bestMove = bestMoveMatch[1];
                        }
                    } else if (message === 'readyok') {
                        worker.postMessage('ucinewgame');
                        worker.postMessage('setoption name UCI_LimitStrength value false'); // Full strength for analysis
                    }
                };
                stockfishRef.current = worker;
                worker.postMessage('uci');
                worker.postMessage('isready');
            } catch (err) {
                console.error('Failed to initialize Stockfish:', err);
            }
        };

        initStockfish();

        return () => {
            if (stockfishRef.current) {
                stockfishRef.current.terminate();
                stockfishRef.current = null;
            }
        };
    }, []);

    const analyzeGame = async (game) => {
        if (!stockfishRef.current) {
            console.error('Stockfish is not initialized.');
            setAnalysis([]); // Clear analysis to avoid infinite "Analyzing game..." message
            return;
        }

        const chess = new ChessModule.Chess();
        const analysisResults = [];
        let previousEval = 0;

        for (let i = 0; i < game.moveHistory.length; i++) {
            const move = game.moveHistory[i];
            chess.move(move.san);

            stockfishRef.current.evaluation = null;
            stockfishRef.current.bestMove = null;

            // Send position to Stockfish
            stockfishRef.current.postMessage(`position fen ${chess.fen()}`);
            stockfishRef.current.postMessage('go movetime 1000');

            // Wait for evaluation with a timeout
            const evaluationPromise = new Promise((resolve) => {
                const startTime = Date.now();
                const checkEvaluation = setInterval(() => {
                    if (stockfishRef.current.evaluation !== null && stockfishRef.current.bestMove !== null) {
                        clearInterval(checkEvaluation);
                        resolve();
                    } else if (Date.now() - startTime > 5000) { // Timeout after 5 seconds
                        clearInterval(checkEvaluation);
                        console.warn(`Timeout waiting for evaluation for move ${move.san}`);
                        stockfishRef.current.evaluation = 0; // Default to 0 if no evaluation
                        stockfishRef.current.bestMove = move.san; // Fallback to the played move
                        resolve();
                    }
                }, 100);
            });

            await evaluationPromise;

            const currentEval = stockfishRef.current.evaluation || 0;
            const bestMove = stockfishRef.current.bestMove || move.san;

            // Convert best move to SAN notation
            let bestMoveSan = bestMove;
            try {
                const tempChess = new ChessModule.Chess(chess.fen());
                const moveResult = tempChess.move({
                    from: bestMove.substring(0, 2),
                    to: bestMove.substring(2, 4),
                    promotion: bestMove.length > 4 ? bestMove[4] : undefined,
                });
                bestMoveSan = moveResult ? moveResult.san : bestMove;
            } catch (err) {
                console.error(`Error converting best move ${bestMove} to SAN:`, err);
            }

            let annotation = '';
            if (i > 0) {
                const evalDiff = (move.color === 'w' ? previousEval - currentEval : currentEval - previousEval) || 0;
                if (evalDiff > 1) {
                    annotation = `Blunder: You played ${move.san}, better was ${bestMoveSan}`;
                } else if (evalDiff > 0.5) {
                    annotation = `Mistake: You played ${move.san}, better was ${bestMoveSan}`;
                }
            }

            analysisResults.push({ move: move.san, evaluation: currentEval, annotation });
            previousEval = currentEval;

            // Update the analysis state incrementally to show progress
            setAnalysis([...analysisResults]);
        }

        // Final update to ensure the UI reflects the complete analysis
        setAnalysis([...analysisResults]);
    };

    const handleReviewGame = (game) => {
        setSelectedGame(game);
        setCurrentMoveIndex(-1);
        setFen('rnbqkbnr/pppppppp/5n5/8/8/5N5/PPPPPPPP/RNBQKB1R w KQkq - 0 1');
        setAnalysis([]);
        analyzeGame(game);
    };

    const handleMoveNavigation = (direction) => {
        if (!selectedGame) return;

        const newIndex = direction === 'next' 
            ? Math.min(currentMoveIndex + 1, selectedGame.moveHistory.length - 1)
            : Math.max(currentMoveIndex - 1, -1);

        setCurrentMoveIndex(newIndex);

        const chess = new ChessModule.Chess();
        for (let i = 0; i <= newIndex; i++) {
            chess.move(selectedGame.moveHistory[i].san);
        }
        setFen(chess.fen());
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
                        Chess Analytics
                    </h1>
                    <p className="text-lg text-gray-300 mb-12">
                        Review and analyze your past games to improve your chess skills!
                    </p>

                    <div className="mb-6">
                        <button
                            onClick={loadGames}
                            className="px-6 py-2 rounded text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-glow"
                        >
                            Refresh Game History
                        </button>
                    </div>

                    <div className="bg-gray-900 bg-opacity-80 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Game History</h2>
                        {games.length === 0 ? (
                            <p className="text-gray-400">No games found. Play a game to see it here!</p>
                        ) : (
                            <div className="space-y-4">
                                {games.map((game) => (
                                    <motion.div
                                        key={game.id}
                                        className="bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-300"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <h3 className="text-lg font-semibold">
                                            Game on {new Date(game.date).toLocaleString()}
                                        </h3>
                                        <p className="text-gray-300">Result: {game.result}</p>
                                        <p className="text-gray-300">
                                            Time: White {formatTime(game.whiteTime)} | Black {formatTime(game.blackTime)}
                                        </p>
                                        <p className="text-gray-300">Moves: {game.moveHistory.length}</p>
                                        <button
                                            onClick={() => handleReviewGame(game)}
                                            className="mt-2 px-4 py-2 rounded text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-glow"
                                        >
                                            Review
                                        </button>

                                        {selectedGame && selectedGame.id === game.id && (
                                            <div className="mt-4">
                                                <h4 className="text-xl font-semibold mb-2 text-cyan-400">Game Analysis</h4>
                                                <div className="flex gap-4">
                                                    <div>
                                                        <Chessboard
                                                            position={fen}
                                                            boardWidth={350}
                                                            customBoardStyle={{
                                                                borderRadius: '10px',
                                                                boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                                                            }}
                                                            customDarkSquareStyle={{ backgroundColor: '#2b2b2b' }}
                                                            customLightSquareStyle={{ backgroundColor: '#e0e0e0' }}
                                                        />
                                                        <div className="mt-2 flex justify-between">
                                                            <button
                                                                onClick={() => handleMoveNavigation('prev')}
                                                                disabled={currentMoveIndex === -1}
                                                                className="px-4 py-2 rounded text-white bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                                                            >
                                                                Previous
                                                            </button>
                                                            <button
                                                                onClick={() => handleMoveNavigation('next')}
                                                                disabled={currentMoveIndex === selectedGame.moveHistory.length - 1}
                                                                className="px-4 py-2 rounded text-white bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="text-lg font-semibold mb-2">Move Analysis</h5>
                                                        {analysis.length === 0 ? (
                                                            <p className="text-gray-400">Analyzing game...</p>
                                                        ) : (
                                                            <ol className="list-decimal list-inside text-gray-300 max-h-96 overflow-y-auto">
                                                                {analysis.map((item, index) => (
                                                                    <li key={index} className="text-left">
                                                                        {Math.floor(index / 2) + 1}. {index % 2 === 0 ? 'White: ' : 'Black: '}{' '}
                                                                        {item.move} (Eval: {item.evaluation})
                                                                        {item.annotation && (
                                                                            <span className="text-red-400 block">{item.annotation}</span>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                .shadow-glow {
                    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
};

export default ChessAnalyticsView;