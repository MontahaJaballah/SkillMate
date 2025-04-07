import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './rubikleaderboard.css';

const RubikLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [timeframe, setTimeframe] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
    }, [timeframe]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/rubik/leaderboard?timeframe=${timeframe}&limit=10`);
            setLeaderboard(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load leaderboard');
            setLoading(false);
            toast.error('Failed to load leaderboard');
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const timeframeOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'daily', label: 'Daily' }
    ];

    return (
        <div className="rubik-leaderboard">
            <motion.div
                className="leaderboard-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2>Leaderboard</h2>
                <div className="timeframe-selector">
                    {timeframeOptions.map(option => (
                        <motion.button
                            key={option.value}
                            className={`timeframe-button ${timeframe === option.value ? 'active' : ''}`}
                            onClick={() => setTimeframe(option.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {option.label}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <motion.div
                    className="leaderboard-table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="table-header">
                        <div className="rank">Rank</div>
                        <div className="username">Player</div>
                        <div className="best-time">Best Time</div>
                        <div className="games">Games</div>
                        <div className="last-played">Last Played</div>
                    </div>
                    {leaderboard.map((entry, index) => (
                        <motion.div
                            key={entry._id}
                            className="table-row"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="rank">
                                {index + 1}
                                {index < 3 && (
                                    <span className={`trophy trophy-${index + 1}`}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                    </span>
                                )}
                            </div>
                            <div className="username">{entry.username}</div>
                            <div className="best-time">{formatTime(entry.bestTime)}</div>
                            <div className="games">{entry.gamesPlayed}</div>
                            <div className="last-played">{formatDate(entry.lastPlayed)}</div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default RubikLeaderboard;
