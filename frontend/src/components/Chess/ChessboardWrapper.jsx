import React, { useState, useRef, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';

const ChessboardWrapper = ({
    position,
    onDrop,
    allowDrag = true,
    customSquareStyles = {},
    boardOrientation = 'white',
    onPieceDragBegin,
    onPieceDragEnd,
    onSquareClick,
    isInCheck = false, // New prop for check status
}) => {
    const [theme, setTheme] = useState('magical');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedTexture, setSelectedTexture] = useState(null);
    const dropdownRef = useRef(null);

    const themes = {
        classic: {
            lightSquare: '#f0d9b5',
            darkSquare: '#b58863',
            boardStyle: {
                border: 'none',
                boxShadow: 'none',
                borderRadius: '0',
                background: 'none',
            },
        },
        magical: {
            lightSquare: 'rgba(255, 215, 235, 0.9)',
            darkSquare: 'rgba(100, 150, 255, 0.9)',
            boardStyle: {
                border: 'none',
                boxShadow: 'none',
                borderRadius: '0',
                background: 'linear-gradient(45deg, rgba(255, 105, 180, 0.5), rgba(0, 191, 255, 0.5))',
            },
        },
        personalize: {
            lightSquare: 'rgba(255, 255, 255, 0.2)',
            darkSquare: 'rgba(0, 0, 0, 0.2)',
            boardStyle: {
                border: 'none',
                boxShadow: 'none',
                borderRadius: '0',
                background: selectedTexture ? `url(/boards/${selectedTexture})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            },
        },
    };

    const boardTextures = [
        { name: 'Purple', file: 'purple.png' },
        { name: 'Pink Pyramid', file: 'pink-pyramid.png' },
        { name: 'Woody', file: 'woody.jpg' },
        { name: 'Woody Intense', file: 'woody-intense.jpg' },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleThemeChange = (selectedTheme) => {
        if (selectedTheme === 'personalize') {
            setIsPopupOpen(true);
        } else {
            setTheme(selectedTheme);
            setSelectedTexture(null);
        }
        setIsDropdownOpen(false);
    };

    const handleTextureSelect = (textureFile) => {
        setSelectedTexture(textureFile);
        setTheme('personalize');
        setIsPopupOpen(false);
    };

    return (
        <div className="flex flex-col items-center my-5">
            <div className="relative mb-3" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-2 text-white bg-gradient-to-r from-chess-pink to-chess-blue rounded-md shadow-lg w-32"
                >
                    {theme === 'personalize' && selectedTexture
                        ? boardTextures.find((t) => t.file === selectedTexture)?.name
                        : theme.charAt(0).toUpperCase() + theme.slice(1)}{' '}
                    ▼
                </button>
                {isDropdownOpen && (
                    <div className="absolute mt-1 w-32 bg-gray-800 rounded-md shadow-lg z-10">
                        <button
                            onClick={() => handleThemeChange('classic')}
                            className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Classic
                        </button>
                        <button
                            onClick={() => handleThemeChange('magical')}
                            className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Magical
                        </button>
                        <button
                            onClick={() => handleThemeChange('personalize')}
                            className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Personalize
                        </button>
                    </div>
                )}
            </div>

            {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl text-white mb-4">Choose a Board Texture</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {boardTextures.map((texture) => (
                                <div key={texture.file} className="flex flex-col items-center">
                                    <button
                                        onClick={() => handleTextureSelect(texture.file)}
                                        className="w-32 h-32 rounded-lg overflow-hidden mb-2"
                                    >
                                        <img
                                            src={`/boards/${texture.file}`}
                                            alt={texture.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                    <p className="text-white text-sm">{texture.name}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className={`p-2 ${isInCheck ? 'border-4 border-red-500 rounded-lg' : ''}`}>
                <Chessboard
                    key={`${position}-${theme}-${boardOrientation}-${selectedTexture}-${JSON.stringify(customSquareStyles)}`}
                    position={position || 'start'}
                    onPieceDrop={onDrop || (() => true)}
                    arePiecesDraggable={allowDrag}
                    customLightSquareStyle={{
                        background: themes[theme].lightSquare,
                    }}
                    customDarkSquareStyle={{
                        background: themes[theme].darkSquare,
                    }}
                    customBoardStyle={themes[theme].boardStyle}
                    customSquareStyles={customSquareStyles}
                    boardWidth={500}
                    animationDuration={300}
                    boardOrientation={boardOrientation}
                    onPieceDragBegin={onPieceDragBegin}
                    onPieceDragEnd={onPieceDragEnd}
                    onSquareClick={onSquareClick}
                />
            </div>
        </div>
    );
};

export default ChessboardWrapper;