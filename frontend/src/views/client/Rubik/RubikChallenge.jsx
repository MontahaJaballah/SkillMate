import React from 'react';
import RubikChallengeComponent from '../../../components/Rubik/RubikChallenge';
import { motion } from 'framer-motion';
import '../../../components/Rubik/rubikchallenge.css';

const RubikChallenge = () => {
    return (
        <div className="rubik-challenge-view">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="challenge-container"
            >
                <RubikChallengeComponent />
            </motion.div>
        </div>
    );
};

export default RubikChallenge;
