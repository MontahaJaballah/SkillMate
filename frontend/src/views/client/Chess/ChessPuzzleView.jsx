import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chessboard } from 'react-chessboard';
import * as ChessModule from 'chess.js';
import ChessSidebar from '../../../components/Chess/ChessSidebar';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

// Sample puzzles (hardcoded for now)
const puzzles = [
    {
        id: 1,
        fen: 'rnbqkb1r/pppp1ppp/8/5p2/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 2', // FEN for Qh5#
        description: 'White to play and checkmate in 1',
        solution: ['Qh5#'], // Correct move in SAN notation
    },
    {
        id: 2,
        fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 2',
        description: 'White to play and win material in 1',
        solution: ['Nxe5'], // Correct move: Knight captures pawn on e5
    },
    {
        id: 3,
        fen: '8/5pk1/5p1p/2R3p1/8/8/5PPP/6K1 w - - 0 1',
        description: 'White to play and checkmate in 1',
        solution: ['Rc7#'], // Correct move: Rook to c7 for checkmate
    },
];

const ChessPuzzleView = () => {
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
    const [game, setGame] = useState(new ChessModule.Chess());
    const [fen, setFen] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);

    // Load the current puzzle when the component mounts or the puzzle index changes
    useEffect(() => {
        const puzzle = puzzles[currentPuzzleIndex];
        const newGame = new ChessModule.Chess();
        newGame.load(puzzle.fen);
        setGame(newGame);
        setFen(puzzle.fen);
        setFeedback('');
        setIsPuzzleSolved(false);
    }, [currentPuzzleIndex]);

    const onDrop = (sourceSquare, targetSquare) => {
        if (isPuzzleSolved || game.turn() !== puzzles[currentPuzzleIndex].fen.split(' ')[1]) {
            return false; // Prevent moves if puzzle is solved or it's not the player's turn
        }

        try {
            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q', // Auto-promote to queen for simplicity
            });

            if (move === null) {
                return false; // Invalid move
            }

            setFen(game.fen());

            // Check if the move matches the solution
            const puzzle = puzzles[currentPuzzleIndex];
            const expectedMove = puzzle.solution[0].replace('#', '').replace('+', ''); // Remove '#' and '+' for comparison
            if (move.san.replace('+', '') === expectedMove) {
                setFeedback('Correct! Well done!');
                setIsPuzzleSolved(true);
            } else {
                setFeedback('Incorrect. Try again!');
                // Undo the move to let the user try again
                game.undo();
                setFen(game.fen());
                return false;
            }

            return true;
        } catch (e) {
            console.error('Error making move:', e);
            return false;
        }
    };

    const showSolution = () => {
        const puzzle = puzzles[currentPuzzleIndex];
        const solutionMoveSan = puzzle.solution[0].replace('#', '').replace('+', ''); // Remove '#' and '+' from the move

        try {
            // Get all possible moves to find the correct "from" square
            const moves = game.moves({ verbose: true });
            console.log('Possible moves:', moves.map(m => m.san)); // Debug: Log SAN notation of all moves
            const matchingMove = moves.find((m) => m.san.replace('+', '') === solutionMoveSan);

            if (!matchingMove) {
                setFeedback('Error: Could not find the solution move.');
                console.log('Solution move not found:', solutionMoveSan); // Debug: Log the issue
                return;
            }

            // Apply the move using the { from, to } format
            const move = game.move({
                from: matchingMove.from,
                to: matchingMove.to,
                promotion: matchingMove.promotion || 'q', // Default to queen promotion if needed
            });

            if (move) {
                setFen(game.fen());
                setFeedback(`Solution: ${puzzle.solution[0]}`); // Show the original move (with # if present)
                setIsPuzzleSolved(true); // Mark the puzzle as solved so the user can move to the next puzzle
            } else {
                setFeedback('Error showing solution.');
            }
        } catch (e) {
            console.error('Error applying solution move:', e);
            setFeedback('Error showing solution.');
        }
    };

    const nextPuzzle = () => {
        if (currentPuzzleIndex < puzzles.length - 1) {
            setCurrentPuzzleIndex(currentPuzzleIndex + 1);
        } else {
            setFeedback('You have completed all puzzles! Great job!');
        }
    };

    const resetPuzzle = () => {
        const puzzle = puzzles[currentPuzzleIndex];
        const newGame = new ChessModule.Chess();
        newGame.load(puzzle.fen);
        setGame(newGame);
        setFen(puzzle.fen);
        setFeedback('');
        setIsPuzzleSolved(false);
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
                        Chess Puzzle Mode
                    </h1>
                    <p className="text-lg text-gray-300 mb-12">
                        Solve chess puzzles to improve your tactical skills!
                    </p>

                    <div className="flex justify-center gap-4 items-start">
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Chessboard
                                position={fen}
                                onPieceDrop={onDrop}
                                boardWidth={450}
                                customBoardStyle={{
                                    borderRadius: '10px',
                                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                                }}
                                customDarkSquareStyle={{ backgroundColor: '#2b2b2b' }}
                                customLightSquareStyle={{ backgroundColor: '#e0e0e0' }}
                            />
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={resetPuzzle}
                                    className="flex-1 px-6 py-2 rounded text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-glow"
                                >
                                    Reset Puzzle
                                </button>
                                <button
                                    onClick={showSolution}
                                    disabled={isPuzzleSolved}
                                    className="flex-1 px-6 py-2 rounded text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-glow disabled:opacity-50"
                                >
                                    Show Solution
                                </button>
                                <button
                                    onClick={nextPuzzle}
                                    disabled={currentPuzzleIndex === puzzles.length - 1 || !isPuzzleSolved}
                                    className="flex-1 px-6 py-2 rounded text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-glow disabled:opacity-50"
                                >
                                    Next Puzzle
                                </button>
                            </div>
                        </motion.div>

                        <div className="flex-1 max-w-xs">
                            <h3 className="text-xl mb-2 text-cyan-400">Puzzle {currentPuzzleIndex + 1}</h3>
                            <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg shadow-lg mb-4">
                                <p className="text-gray-300">{puzzles[currentPuzzleIndex].description}</p>
                            </div>

                            <h3 className="text-xl mb-2 text-cyan-400">Feedback</h3>
                            <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg shadow-lg">
                                <p className={`text-gray-300 ${feedback.includes('Correct') ? 'text-green-400' : feedback.includes('Incorrect') ? 'text-red-400' : feedback.includes('Solution') ? 'text-yellow-400' : ''}`}>
                                    {feedback || 'Make your move!'}
                                </p>
                            </div>
                        </div>
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

export default ChessPuzzleView;