import React from 'react';
import { motion } from 'framer-motion';
import RubikHomeComponent from '../../../components/Rubik/RubikHome';
import '../../../components/Rubik/rubik.css';

const RubikHome = () => {
    return (
        <div className="rubik-home-view">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="home-container"
            >
                <RubikHomeComponent />
            </motion.div>
        </div>
    );
};

export default RubikHome;
