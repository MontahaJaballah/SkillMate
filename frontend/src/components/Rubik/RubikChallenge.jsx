import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import RubikGame from './RubikGame';
import './rubikchallenge.css';

const RubikChallenge = () => {
    const [challenges, setChallenges] = useState([]);
    const [showNewChallengeForm, setShowNewChallengeForm] = useState(false);
    const [friendUsername, setFriendUsername] = useState('');
    const [timeLimit, setTimeLimit] = useState(300); // 5 minutes default
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const response = await axios.get('/api/rubik/challenges');
            setChallenges(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load challenges');
            setLoading(false);
            toast.error('Failed to load challenges');
        }
    };

    const handleCreateChallenge = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('/api/rubik/challenge', {
                receiverUsername: friendUsername,
                timeLimit
            });

            setChallenges([response.data, ...challenges]);
            setShowNewChallengeForm(false);
            setFriendUsername('');
            setTimeLimit(300);
            toast.success('Challenge sent successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create challenge');
        }
    };

    const handleAcceptChallenge = async (challengeId) => {
        try {
            const response = await axios.post(`/api/rubik/challenge/${challengeId}/accept`);
            setChallenges(challenges.map(challenge => 
                challenge._id === challengeId 
                    ? response.data
                    : challenge
            ));
            toast.success('Challenge accepted!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept challenge');
        }
    };

    const handleCompleteChallenge = async (challengeId, gameId, completionTime) => {
        try {
            const response = await axios.post(`/api/rubik/challenge/${challengeId}/complete`, {
                gameId,
                completionTime
            });
            setChallenges(challenges.map(challenge => 
                challenge._id === challengeId 
                    ? response.data
                    : challenge
            ));
            toast.success('Challenge completed!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to complete challenge');
        }
    };

    return (
        <div className="rubik-challenge">
            <motion.div 
                className="challenge-header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h1>Challenge Friends</h1>
                <p>Compete with your friends to solve the cube faster!</p>
            </motion.div>

            <div className="challenge-content">
                <motion.button
                    className="new-challenge-button"
                    onClick={() => setShowNewChallengeForm(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Create New Challenge
                </motion.button>

                {showNewChallengeForm && (
                    <motion.div 
                        className="challenge-form"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h3>Challenge a Friend</h3>
                        <form onSubmit={handleCreateChallenge}>
                            <div className="form-group">
                                <label>Friend's Username</label>
                                <input
                                    type="text"
                                    value={friendUsername}
                                    onChange={(e) => setFriendUsername(e.target.value)}
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Time Limit (seconds)</label>
                                <select
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                                >
                                    <option value={180}>3 minutes</option>
                                    <option value={300}>5 minutes</option>
                                    <option value={600}>10 minutes</option>
                                </select>
                            </div>
                            <div className="form-buttons">
                                <button type="submit">Send Challenge</button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowNewChallengeForm(false)}
                                    className="cancel"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="challenges-list">
                    <h2>Your Challenges</h2>
                    {challenges.length === 0 ? (
                        <p className="no-challenges">No challenges yet. Create one to get started!</p>
                    ) : (
                        challenges.map(challenge => (
                            <motion.div
                                key={challenge._id}
                                className={`challenge-card ${challenge.status}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="challenge-info">
                                    <h3>{challenge.friend}</h3>
                                    <p>Time Limit: {challenge.timeLimit} seconds</p>
                                    <p>Status: {challenge.status}</p>
                                    <p>Created: {new Date(challenge.created).toLocaleDateString()}</p>
                                </div>
                                {challenge.status === 'pending' && (
                                    <motion.button
                                        onClick={() => handleAcceptChallenge(challenge._id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Accept Challenge
                                    </motion.button>
                                )}
                                {challenge.status === 'active' && (
                                    <div className="active-challenge">
                                        <RubikGame 
                                            timeLimit={challenge.timeLimit}
                                            onComplete={(time) => {
                                                handleCompleteChallenge(challenge._id, gameId, time);
                                            }}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default RubikChallenge;
