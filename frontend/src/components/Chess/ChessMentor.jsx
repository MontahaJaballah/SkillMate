import React, { useState } from 'react';
import ChessboardWrapper from './ChessboardWrapper';
import { Chess } from 'chess.js';
import axios from 'axios';

const ChessMentor = ({ user }) => {
    const [chess] = useState(new Chess());
    const [fen, setFen] = useState(chess.fen());

    const onDrop = ({ sourceSquare, targetSquare }) => {
        const move = chess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
        });

        if (move) {
            setFen(chess.fen());
            if (chess.isGameOver()) {
                const result = chess.isCheckmate() ? (chess.turn() === 'w' ? 'loss' : 'win') : 'draw';
                saveGame(result);
            }
        }
    };

    const saveGame = async (result) => {
        try {
            await axios.post('http://localhost:5000/api/chess/save-game', {
                moves: chess.history(),
                fenHistory: [chess.fen()],
                result
            }, { withCredentials: true });
            alert('Game saved!');
        } catch (error) {
            console.error('Error saving game:', error);
            alert('Failed to save game.');
        }
    };

    return (
        <div className="bg-gradient-to-r from-chess-pink/10 to-chess-blue/10 p-5 rounded-2xl shadow-[0_0_20px_#ff69b4] text-center text-white">
            <h2 className="text-4xl text-shadow-lg animate-glow">Chess Mentor</h2>
            <ChessboardWrapper position={fen} onDrop={onDrop} />
        </div>
    );
};

export default ChessMentor;