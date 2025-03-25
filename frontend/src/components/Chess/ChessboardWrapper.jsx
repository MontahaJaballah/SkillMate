import React, { useState } from 'react';
import Chessboard from 'chessboardjsx';

const ChessboardWrapper = ({ position, onDrop }) => {
    const [theme, setTheme] = useState('magical');

    const themes = {
        classic: {
            lightSquare: '#fff',
            darkSquare: '#4b739b',
            pieceStyle: 'wikipedia',
            boardStyle: {
                border: '5px solid #2e8b57',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            },
        },
        magical: {
            lightSquare: 'rgba(255, 255, 255, 0.8)',
            darkSquare: 'rgba(75, 115, 155, 0.8)',
            pieceStyle: 'alpha',
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
                position={position || 'start'}
                onDrop={onDrop || (() => {})}
                lightSquareStyle={{ backgroundColor: themes[theme].lightSquare }}
                darkSquareStyle={{ backgroundColor: themes[theme].darkSquare }}
                pieces={themes[theme].pieceStyle}
                boardStyle={themes[theme].boardStyle}
                transitionDuration={300}
                pieceClassName="hover:scale-110 transition-transform duration-300 hover:drop-shadow-[0_0_10px_#ff69b4] hover:drop-shadow-[0_0_20px_#00bfff]"
            />
        </div>
    );
};

export default ChessboardWrapper;