import React from 'react';
import { motion } from 'framer-motion';
import RubikLeaderboardComponent from '../../../components/Rubik/RubikLeaderboard';
import '../../../components/Rubik/rubikleaderboard.css';

const RubikLeaderboard = () => {
    return (
        <div className="rubik-leaderboard-view">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="leaderboard-container"
            >
                <RubikLeaderboardComponent />
            </motion.div>
        </div>
    );
};

export default RubikLeaderboard;
