import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chessboard } from 'react-chessboard';
import * as ChessModule from 'chess.js';
import ChessSidebar from '../../../components/Chess/ChessSidebar';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import io from 'socket.io-client';

// Connect to the Socket.IO server
const socket = io('http://localhost:5001');

const ChessChallengesView = () => {
    const [playerName, setPlayerName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [game, setGame] = useState(new ChessModule.Chess());
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1');
    const [puzzle, setPuzzle] = useState(null);
    const [players, setPlayers] = useState([]);
    const [winner, setWinner] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [feedback, setFeedback] = useState('');

    // Initialize particles
    const particlesInit = async (engine) => {
        await loadSlim(engine);
    };

    // Handle joining a challenge room
    const handleJoinChallenge = () => {
        if (!playerName || !roomId) {
            setFeedback('Please enter your name and a room ID.');
            return;
        }
        socket.emit('joinChallenge', { roomId, playerName });
    };

    // Socket.IO event listeners
    useEffect(() => {
        socket.on('roomUpdate', ({ players, puzzle, winner }) => {
            setPlayers(players);
            setPuzzle(puzzle);
            setWinner(winner);

            // Load the puzzle position
            if (puzzle) {
                const newGame = new ChessModule.Chess();
                newGame.load(puzzle.fen);
                setGame(newGame);
                setFen(puzzle.fen);
            }
        });

        socket.on('startChallenge', ({ startTime }) => {
            setStartTime(startTime);
            setFeedback('Challenge started! Solve the puzzle as fast as you can!');
        });

        socket.on('challengeResult', ({ winner, timeTaken }) => {
            setWinner(winner);
            setFeedback(`Challenge ended! ${winner} solved the puzzle in ${timeTaken.toFixed(2)} seconds!`);
        });

        socket.on('roomFull', ({ message }) => {
            setFeedback(message);
        });

        return () => {
            socket.off('roomUpdate');
            socket.off('startChallenge');
            socket.off('challengeResult');
            socket.off('roomFull');
        };
    }, []);

    // Update elapsed time
    useEffect(() => {
        if (startTime && !winner) {
            const interval = setInterval(() => {
                setTimeElapsed((Date.now() - startTime) / 1000);
            }, 100);
            return () => clearInterval(interval);
        }
    }, [startTime, winner]);

    // Handle piece drop on the board
    const onDrop = (sourceSquare, targetSquare) => {
        if (winner || !startTime) return false;

        try {
            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            });

            if (move === null) return false;

            setFen(game.fen());

            // Submit the move to the server
            socket.emit('submitMove', { roomId, move });

            return true;
        } catch (e) {
            console.error('Error making move:', e);
            return false;
        }
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
                        Chess Challenges
                    </h1>
                    <p className="text-lg text-gray-300 mb-12">
                        Compete against another player to solve chess puzzles in real-time!
                    </p>

                    {!puzzle && (
                        <div className="mb-6">
                            <div className="flex gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-cyan-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter room ID"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                            <button
                                onClick={handleJoinChallenge}
                                className="px-6 py-2 rounded text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-glow"
                            >
                                Join Challenge
                            </button>
                        </div>
                    )}

                    {puzzle && (
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
                            </motion.div>

                            <div className="flex-1 max-w-xs">
                                <h3 className="text-xl mb-2 text-cyan-400">Challenge Details</h3>
                                <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg shadow-lg mb-4">
                                    <p className="text-gray-300">{puzzle.description}</p>
                                    <p className="text-gray-300">Players: {players.map(p => p.name).join(' vs ')}</p>
                                    <p className="text-gray-300">Time: {timeElapsed.toFixed(1)}s</p>
                                    {winner && (
                                        <p className="text-green-400">Winner: {winner}</p>
                                    )}
                                </div>

                                <h3 className="text-xl mb-2 text-cyan-400">Feedback</h3>
                                <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg shadow-lg">
                                    <p className={`text-gray-300 ${feedback.includes('Challenge ended') ? 'text-green-400' : ''}`}>
                                        {feedback || 'Waiting for another player...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
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

export default ChessChallengesView;