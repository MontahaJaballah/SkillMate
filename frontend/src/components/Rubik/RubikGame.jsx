import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Rubik2D from './Rubik2D';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './rubikgame.css';

// Confetti animation function
const createConfetti = (color) => {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.backgroundColor = color;
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    confetti.style.opacity = Math.random();
    confetti.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';

    document.body.appendChild(confetti);

    setTimeout(() => {
        confetti.remove();
    }, 5000);
};

const RubikGame = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const [bestTime, setBestTime] = useState(parseInt(localStorage.getItem('rubikBestTime')) || null);
    const [moves, setMoves] = useState(0);

    // Timer logic
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    // Format time to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        setTime(0);
        setMoves(0);
        setIsPlaying(true);
    };

    const handleStop = async () => {
        setIsPlaying(false);
        if (!bestTime || time < bestTime) {
            localStorage.setItem('rubikBestTime', time.toString());
            setBestTime(time);
        }
        // Update puzzles solved count
        const solved = parseInt(localStorage.getItem('rubikPuzzlesSolved') || '0') + 1;
        localStorage.setItem('rubikPuzzlesSolved', solved.toString());

        // Save game data to database
        try {
            await axios.post('/api/rubik/game', {
                moves: [], // Add actual moves if tracking them
                timeElapsed: time,
                isSolved: true,
                cubeState: window.rubikRef ? window.rubikRef.getCubeState() : null
            });
        } catch (error) {
            console.error('Failed to save game:', error);
            toast.error('Failed to save game data');
        }
    };

    const handleReset = () => {
        setIsPlaying(false);
        setTime(0);
        setMoves(0);
        if (window.rubikRef) {
            window.rubikRef.resetAndScramble();
        }
    };

    return (
        <div className="rubik-game">
            <motion.div 
                className="game-header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h1>Rubik's Cube Challenge</h1>
                <div className="stats-container">
                    <div className="stat-box">
                        <h3>Time</h3>
                        <p className="stat-value">{formatTime(time)}</p>
                    </div>
                    <div className="stat-box">
                        <h3>Moves</h3>
                        <p className="stat-value">{moves}</p>
                    </div>

                    {bestTime && (
                        <div className="stat-box">
                            <h3>Best Time</h3>
                            <p className="stat-value">{formatTime(bestTime)}</p>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="game-container">
                <Rubik2D 
                    onMove={() => setMoves(moves + 1)} 
                    onComplete={() => {
                        handleStop();
                        // Add confetti effect when cube is solved
                        const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];
                        for (let i = 0; i < 100; i++) {
                            createConfetti(colors[Math.floor(Math.random() * colors.length)]);
                        }
                    }}
                    onReset={handleReset}
                    ref={(ref) => {
                        if (ref) {
                            window.rubikRef = ref; // Store ref for reset access
                        }
                    }}
                />
            </div>

            <div className="game-controls">
                <motion.button
                    className={`control-button ${isPlaying ? 'stop' : 'start'}`}
                    onClick={isPlaying ? handleStop : handleStart}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isPlaying ? 'Stop Timer' : 'Start Timer'}
                </motion.button>
                <motion.button
                    className="control-button reset"
                    onClick={handleReset}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Reset & Shuffle
                </motion.button>
            </div>
        </div>
    );
};

export default RubikGame;
