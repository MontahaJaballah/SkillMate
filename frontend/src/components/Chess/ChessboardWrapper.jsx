import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';

const ChessboardWrapper = ({ position, onDrop, allowDrag = true, customSquareStyles = {} }) => {
    const [theme, setTheme] = useState('magical');

    const themes = {
        classic: {
            lightSquare: '#fff',
            darkSquare: '#4b739b',
            boardStyle: {
                border: '5px solid #2e8b57',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            },
        },
        magical: {
            lightSquare: 'rgba(255, 255, 255, 0.8)',
            darkSquare: 'rgba(75, 115, 155, 0.8)',
            boardStyle: {
                border: '5px solid #ff69b4',
                boxShadow: '0 0 20px #ff69b4, 0 0 30px #00bfff',
                background: 'linear-gradient(45deg, rgba(255, 105, 180, 0.2), rgba(0, 191, 255, 0.2))',
            },
        },
    };

    return (
        <div className="flex flex-col items-center my-5">
            <select
                onChange={(e) => setTheme(e.target.value)}
                className="mb-3 p-2 text-white bg-gradient-to-r from-chess-pink to-chess-blue rounded-md shadow-lg"
            >
                <option value="classic">Classic</option>
                <option value="magical">Magical</option>
            </select>
            <Chessboard
                key={position}
                position={position || 'start'}
                onPieceDrop={onDrop || (() => true)}
                arePiecesDraggable={allowDrag}
                customLightSquareStyle={{ backgroundColor: themes[theme].lightSquare }}
                customDarkSquareStyle={{ backgroundColor: themes[theme].darkSquare }}
                customBoardStyle={themes[theme].boardStyle}
                customSquareStyles={customSquareStyles} // Pass custom square styles
                boardWidth={400}
                animationDuration={300}
            />
        </div>
    );
};

export default ChessboardWrapper;