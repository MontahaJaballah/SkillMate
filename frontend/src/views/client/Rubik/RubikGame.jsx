import React from 'react';
import RubikGameComponent from '../../../components/Rubik/RubikGame';
import { motion } from 'framer-motion';
import '../../../components/Rubik/rubikgame.css';

const RubikGame = () => {
    return (
        <div className="rubik-game-view">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="game-container"
            >
                <RubikGameComponent />
            </motion.div>
        </div>
    );
};

export default RubikGame;
