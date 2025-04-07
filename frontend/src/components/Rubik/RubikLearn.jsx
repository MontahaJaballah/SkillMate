import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './rubiklearn.css';

const RubikLearn = () => {
    const [activeStep, setActiveStep] = useState(0);

    const tutorials = [
        {
            title: "White Cross",
            description: "Start by creating a white cross on the first layer",
            steps: [
                "Find the white center piece - this will be your starting face",
                "Locate white edge pieces around the cube",
                "Match edge colors with their center colors",
                "Place edges correctly using F, U, R, U' moves"
            ],
            tips: "Focus on one edge at a time. Make sure the colors match on both sides.",
            videoUrl: "https://www.youtube.com/embed/7Ron6MN45LY"
        },
        {
            title: "First Layer Corners",
            description: "Complete the first layer by placing white corners",
            steps: [
                "Find white corner pieces",
                "Position corners above their correct spot",
                "Use R U R' U' sequence to place corners",
                "Repeat for all four corners"
            ],
            tips: "If a corner is in the right spot but wrongly oriented, treat it as if it wasn't there.",
            videoUrl: "https://www.youtube.com/embed/HWIQdX8vHcE"
        },
        {
            title: "Second Layer",
            description: "Solve the middle layer using edge pieces",
            steps: [
                "Find an edge piece that doesn't have a yellow sticker",
                "Match the front color with the center",
                "Use U R U' R' U' F' U F for right placement",
                "Use U' L' U L U F U' F' for left placement"
            ],
            tips: "If an edge is in the middle layer but wrong, move it out first.",
            videoUrl: "https://www.youtube.com/embed/Q2uWq2q3Xoc"
        },
        {
            title: "Yellow Cross",
            description: "Create a yellow cross on the top face",
            steps: [
                "Hold yellow center on top",
                "Observe yellow stickers pattern",
                "Use F R U R' U' F' algorithm",
                "Repeat if necessary until you have a yellow cross"
            ],
            tips: "The pattern might look like a dot, L-shape, or line before becoming a cross.",
            videoUrl: "https://www.youtube.com/embed/FzBZA_Gj8Mg"
        },
        {
            title: "Final Layer",
            description: "Complete the cube by solving the yellow face",
            steps: [
                "Position corners correctly using R U R' U R U2 R'",
                "Orient corners with R' D' R D",
                "Adjust the top layer",
                "Celebrate your success!"
            ],
            tips: "Be patient with corner orientation - it might take multiple repetitions.",
            videoUrl: "https://www.youtube.com/embed/uC5B9xjhzVY"
        }
    ];

    return (
        <div className="rubik-learn">
            <motion.div 
                className="learn-header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h1>Learn to Solve the Rubik's Cube</h1>
                <p>Master the cube step by step with our comprehensive guide</p>
            </motion.div>

            <div className="tutorial-container">
                <div className="steps-navigation">
                    {tutorials.map((tutorial, index) => (
                        <motion.div
                            key={index}
                            className={'step-item ' + (activeStep === index ? 'active' : '')}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setActiveStep(index)}
                        >
                            <div className="step-number">{index + 1}</div>
                            <div className="step-content">
                                <h3>{tutorial.title}</h3>
                                <p>{tutorial.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    className="tutorial-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={activeStep}
                >
                    <div className="content-section">
                        <h2>{tutorials[activeStep].title}</h2>
                        <div className="video-container">
                            <iframe
                                src={tutorials[activeStep].videoUrl}
                                title={tutorials[activeStep].title}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="steps-list">
                            <h3>Steps to Follow:</h3>
                            <ol>
                                {tutorials[activeStep].steps.map((step, index) => (
                                    <motion.li 
                                        key={index}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        {step}
                                    </motion.li>
                                ))}
                            </ol>
                        </div>
                        <div className="tips-section">
                            <h3>💡 Pro Tip:</h3>
                            <p>{tutorials[activeStep].tips}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="navigation-buttons">
                <button 
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                >
                    Previous Step
                </button>
                <button 
                    onClick={() => setActiveStep(Math.min(tutorials.length - 1, activeStep + 1))}
                    disabled={activeStep === tutorials.length - 1}
                >
                    Next Step
                </button>
            </div>
        </div>
    );
};

export default RubikLearn;
