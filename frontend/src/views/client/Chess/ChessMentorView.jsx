import React from 'react';
import ChessMentor from '../../../components/Chess/ChessMentor.jsx'; 
const ChessMentorView = ({ user }) => {
    return (
        <div className="min-h-screen bg-gradient-to-r from-chess-pink/10 to-chess-blue/10 p-10 flex flex-col items-center">
            <h1 className="text-5xl text-white text-shadow-lg animate-glow">Chess Mentor</h1>
            <ChessMentor user={user} />
        </div>
    );
};

export default ChessMentorView;