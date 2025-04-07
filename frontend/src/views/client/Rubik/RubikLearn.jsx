import React from 'react';
import RubikLearnComponent from '../../../components/Rubik/RubikLearn';
import { motion } from 'framer-motion';
import '../../../components/Rubik/rubiklearn.css';

const RubikLearn = () => {
    return (
        <div className="rubik-learn-view">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="learn-container"
            >
                <RubikLearnComponent />
            </motion.div>
        </div>
    );
};

export default RubikLearn;
