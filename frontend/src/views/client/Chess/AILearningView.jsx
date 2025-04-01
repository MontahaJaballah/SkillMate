import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const AILearningView = () => {
    const [game, setGame] = useState(new Chess()); // Chess.js instance for game state
    const [fen, setFen] = useState(game.fen()); // Current FEN position
    const [error, setError] = useState(''); // Track any errors
    const stockfishRef = useRef(null); // Use a ref to store the Web Worker
    const isUserTurnRef = useRef(true); // Use a ref to track whose turn it is

    // Initialize Stockfish Web Worker when the component mounts
    useEffect(() => {
        const initStockfish = () => {
            if (stockfishRef.current) {
                console.log('Stockfish Web Worker already initialized, skipping...');
                return;
            }

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
                        console.log('Best move received:', bestMove, 'isUserTurnRef.current:', isUserTurnRef.current);
                        if (bestMove && !isUserTurnRef.current) {
                            console.log('Calling makeAIMove with bestMove:', bestMove);
                            makeAIMove(bestMove);
                        } else {
                            console.log('makeAIMove not called. bestMove:', bestMove, '!isUserTurnRef.current:', !isUserTurnRef.current);
                        }
                    } else if (message === 'readyok') {
                        console.log('Stockfish is ready');
                        worker.postMessage('ucinewgame');
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
                console.log('Terminating Stockfish Web Worker...');
                stockfishRef.current.terminate();
                stockfishRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // Handle user moves
    const onDrop = (sourceSquare, targetSquare) => {
        if (!isUserTurnRef.current) return false; // Prevent user from moving during AI's turn

        try {
            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q', // Auto-promote to queen for simplicity
            });

            if (move === null) return false; // Invalid move

            setFen(game.fen());
            isUserTurnRef.current = false; // AI's turn
            console.log('User move made, isUserTurnRef.current set to false:', isUserTurnRef.current);

            // Trigger AI move after a short delay
            setTimeout(() => {
                if (stockfishRef.current) {
                    console.log('Sending position to Stockfish:', game.fen());
                    stockfishRef.current.postMessage(`position fen ${game.fen()}`);
                    stockfishRef.current.postMessage('go movetime 1000'); // AI thinks for 1 second
                } else {
                    console.error('Stockfish is not initialized');
                    setError('Stockfish is not initialized');
                    isUserTurnRef.current = true; // Allow user to try again
                }
            }, 500);

            return true;
        } catch (e) {
            return false; // Invalid move
        }
    };

    // AI makes a move
    const makeAIMove = (bestMove) => {
        console.log('AI best move:', bestMove);
        try {
            const move = game.move({
                from: bestMove.substring(0, 2),
                to: bestMove.substring(2, 4),
                promotion: bestMove.length > 4 ? bestMove[4] : undefined,
            });

            if (move === null) {
                console.error('AI suggested an invalid move:', bestMove);
                setError('AI suggested an invalid move');
                isUserTurnRef.current = true; // Allow user to continue
                return;
            }

            setFen(game.fen());
            isUserTurnRef.current = true; // User's turn
            console.log('AI move made, isUserTurnRef.current set to true:', isUserTurnRef.current);
        } catch (e) {
            console.error('Error making AI move:', e);
            setError('Error making AI move: ' + e.message);
            isUserTurnRef.current = true; // Allow user to continue
        }
    };

    // Reset the board
    const resetBoard = () => {
        const newGame = new Chess();
        setGame(newGame);
        setFen(newGame.fen());
        isUserTurnRef.current = true;
        setError('');
        if (stockfishRef.current) {
            stockfishRef.current.postMessage('ucinewgame');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-20 px-4 sm:px-6 lg:px-8">
            <motion.div
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-8">
                    AI Learning: Chess Mastery
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12">
                    Play against an AI bot and improve your chess skills!
                </p>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Chessboard */}
                    <div className="flex-1">
                        <Chessboard
                            position={fen}
                            onPieceDrop={onDrop}
                            boardWidth={400}
                        />
                        <button
                            onClick={resetBoard}
                            className="mt-4 w-full px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                        >
                            Reset Board
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-6">
                        <p className="text-gray-600 dark:text-gray-300">
                            {isUserTurnRef.current ? "Your turn!" : "AI is thinking..."}
                        </p>
                        {error && (
                            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AILearningView;