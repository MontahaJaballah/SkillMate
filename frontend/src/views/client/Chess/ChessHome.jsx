import React from 'react';
import { Link } from 'react-router-dom';
import ChessboardWrapper from '../../../components/Chess/ChessboardWrapper';
import chessWorldBg from "/src/assets/chess-world-bg.jpg";

const ChessHome = () => {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
            style={{ backgroundImage: `url(${chessWorldBg})` }}
        >
            <div className="absolute inset-0 bg-black/30 z-10"></div>
            <div className="relative z-20 text-center text-white p-5 max-w-2xl">
                <h1 className="text-5xl font-bold text-shadow-lg animate-glow">
                    Welcome to the World of Chess Mastery
                </h1>
                <p className="text-xl mt-5 text-shadow-md">
                    Step into a magical realm where chess comes alive! Learn, battle, and conquer in a universe of strategy and wonder.
                </p>
                <ChessboardWrapper />
                <div className="flex flex-wrap justify-center gap-5 mt-8">
                    <Link
                        to="/chess/mentor"
                        className="px-8 py-4 text-lg text-white bg-gradient-to-r from-chess-pink to-chess-blue rounded-full shadow-lg animate-glow hover:scale-105 transition-transform duration-300"
                    >
                        Chess Mentor (AI Learning)
                    </Link>
                    <Link
                        to="/chess/battle"
                        className="px-8 py-4 text-lg text-white bg-gradient-to-r from-chess-pink to-chess-blue rounded-full shadow-lg animate-glow hover:scale-105 transition-transform duration-300"
                    >
                        Live Chess Battles
                    </Link>
                    <Link
                        to="/chess/analytics"
                        className="px-8 py-4 text-lg text-white bg-gradient-to-r from-chess-pink to-chess-blue rounded-full shadow-lg animate-glow hover:scale-105 transition-transform duration-300"
                    >
                        Chess Analytics
                    </Link>
                    <Link
                        to="/chess/challenges"
                        className="px-8 py-4 text-lg text-white bg-gradient-to-r from-chess-pink to-chess-blue rounded-full shadow-lg animate-glow hover:scale-105 transition-transform duration-300"
                    >
                        Chess Challenges
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ChessHome;