import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './rubik.css';

const RubikHome = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            title: 'Play Now',
            description: 'Start solving the Rubik\'s cube',
            icon: '🎮',
            path: '/rubik/play',
            color: '#4CAF50'
        },
        {
            title: 'Competitions',
            description: 'Join weekly competitions',
            icon: '🏆',
            path: '/rubik/competitions',
            color: '#2196F3'
        },
        {
            title: 'Leaderboard',
            description: 'See top scores of the week',
            icon: '📊',
            path: '/rubik/leaderboard',
            color: '#9C27B0'
        },
        {
            title: 'Challenge Friends',
            description: 'Challenge your friends to solve',
            icon: '🤝',
            path: '/rubik/challenge',
            color: '#FF9800'
        },
        {
            title: 'Learn',
            description: 'Master Rubik\'s cube techniques',
            icon: '📚',
            path: '/rubik/learn',
            color: '#E91E63'
        }
    ];

    const bestTime = localStorage.getItem('rubikBestTime');
    const puzzlesSolved = localStorage.getItem('rubikPuzzlesSolved') || '0';
    const weeklyRank = localStorage.getItem('rubikWeeklyRank') || '---';

    const formatTime = (seconds) => {
        if (!seconds) return '---';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="rubik-home">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="rubik-header"
            >
                <h1>Welcome to Rubik&apos;s World</h1>
                <p>Challenge yourself, compete with friends, and master the cube!</p>
            </motion.div>

            <div className="rubik-menu-grid">
                {menuItems.map((item, index) => (
                    <motion.div
                        key={item.title}
                        className="rubik-menu-item"
                        style={{ backgroundColor: item.color }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(item.path)}
                    >
                        <div className="menu-item-icon">{item.icon}</div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                    </motion.div>
                ))}
            </div>

            <motion.div 
                className="quick-stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <div className="stat-item">
                    <h4>Your Best Time</h4>
                    <p>{formatTime(bestTime)}</p>
                </div>
                <div className="stat-item">
                    <h4>Weekly Rank</h4>
                    <p>#{weeklyRank}</p>
                </div>
                <div className="stat-item">
                    <h4>Puzzles Solved</h4>
                    <p>{puzzlesSolved}</p>
                </div>
            </motion.div>
        </div>
    );
};

export default RubikHome;
