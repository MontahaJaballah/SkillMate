import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AILearningView = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResponse('');

        try {
            
            const apiUrl = 'https://178c-34-83-179-95.ngrok-free.app/chessgpt'; // ngrok URL
            const res = await axios.post(apiUrl, { prompt });
            setResponse(res.data.response);
        } catch (err) {
            setError('Failed to get a response from the AI. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-20 px-4 sm:px-6 lg:px-8">
            <motion.div
                className="max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-8">
                    AI Learning: Chess Mastery
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12">
                    Ask our AI anything about chess to enhance your skills!
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Your Question
                        </label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., What is the best move after 1.e4 c5?"
                            className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                            rows="3"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Ask AI'}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                {response && (
                    <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            AI Response
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">{response}</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AILearningView;