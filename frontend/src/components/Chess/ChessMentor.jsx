import React, { useState, useEffect, useRef } from 'react';
import ChessboardWrapper from './ChessboardWrapper';
import { Chess } from 'chess.js';
import axios from 'axios';

const ChessMentor = ({ user }) => {
    const [chess] = useState(() => {
        const game = new Chess();
        game.reset();
        return game;
    });
    const [fen, setFen] = useState(chess.fen());
    const [gameOver, setGameOver] = useState(false);
    const [lastSavedGame, setLastSavedGame] = useState(null);
    const [pendingPromotion, setPendingPromotion] = useState(null);
    const [moveHistory, setMoveHistory] = useState([]);
    const [fenHistory, setFenHistory] = useState([chess.fen()]);
    const [redoHistory, setRedoHistory] = useState([]);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [lastCheckFen, setLastCheckFen] = useState(null);
    const [checkmatePlayed, setCheckmatePlayed] = useState(false);
    const checkSoundRef = useRef(null);
    const checkmateSoundRef = useRef(null);

    // Removed the window click event listener since we'll handle interaction in onDrop

    // Find the square of the king in check
    const getKingInCheckSquare = () => {
        if (!chess.inCheck()) return null;
        const board = chess.board();
        const turn = chess.turn();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.type === 'k' && piece.color === turn) {
                    return `${String.fromCharCode(97 + col)}${8 - row}`;
                }
            }
        }
        return null;
    };

    const customSquareStyles = {};
    const kingSquare = getKingInCheckSquare();
    if (kingSquare) {
        customSquareStyles[kingSquare] = {
            boxShadow: '0 0 10px 3px rgba(255, 0, 0, 0.8)',
            border: '3px solid red'
        };
    }

    // Play sound effects when in check or checkmate
    useEffect(() => {
        if (!hasInteracted) {
            console.log('Audio playback blocked: Waiting for user interaction');
            return;
        }

        if (chess.inCheck() && !gameOver && fen !== lastCheckFen) {
            console.log('Playing check sound');
            checkSoundRef.current.volume = 1.0;
            checkSoundRef.current.currentTime = 0;
            checkSoundRef.current
                .play()
                .then(() => console.log('Check sound played successfully'))
                .catch(error => console.error('Error playing check sound:', error));
            setLastCheckFen(fen);
        } else if (!chess.inCheck()) {
            setLastCheckFen(null);
        }

        if (gameOver && chess.isCheckmate() && !checkmatePlayed) {
            console.log('Playing checkmate sound');
            checkmateSoundRef.current.volume = 1.0;
            checkmateSoundRef.current.currentTime = 0;
            checkmateSoundRef.current
                .play()
                .then(() => console.log('Checkmate sound played successfully'))
                .catch(error => console.error('Error playing checkmate sound:', error));
            setCheckmatePlayed(true);
        }
    }, [fen, gameOver, hasInteracted, lastCheckFen, checkmatePlayed]);

    const onDrop = (sourceSquare, targetSquare) => {
        if (gameOver || pendingPromotion) {
            console.log('Game is over or promotion pending, move rejected:', { from: sourceSquare, to: targetSquare });
            return false;
        }

        // Set hasInteracted to true on the first move
        if (!hasInteracted) {
            console.log('User interaction detected: First move made');
            setHasInteracted(true);
        }

        console.log('Attempting move:', { from: sourceSquare, to: targetSquare });
        console.log('Current turn:', chess.turn() === 'w' ? 'White' : 'Black');
        console.log('Current board state (FEN):', chess.fen());

        try {
            const piece = chess.get(sourceSquare);
            const isPawn = piece && piece.type === 'p';
            const isPromotion = isPawn && (
                (piece.color === 'w' && targetSquare.charAt(1) === '8') ||
                (piece.color === 'b' && targetSquare.charAt(1) === '1')
            );

            if (isPromotion) {
                setPendingPromotion({ from: sourceSquare, to: targetSquare });
                return false;
            }

            const move = chess.move({
                from: sourceSquare,
                to: targetSquare
            });

            if (move) {
                console.log('Move successful:', move);
                setFen(chess.fen());
                setMoveHistory(chess.history());
                setFenHistory([...fenHistory, chess.fen()]);
                setRedoHistory([]);
                if (chess.isGameOver()) {
                    const result = chess.isCheckmate() ? (chess.turn() === 'w' ? 'loss' : 'win') : 'draw';
                    console.log('Game over! Result:', result);
                    setGameOver(true);
                    saveGame(result);
                }
                return true;
            }
            console.log('Move rejected by chess.js');
            return false;
        } catch (error) {
            console.error('Invalid move attempted:', error.message);
            console.log('Current board state (FEN):', chess.fen());
            console.log('Attempted move:', { from: sourceSquare, to: targetSquare });
            return false;
        }
    };

    const handlePromotion = (promotionPiece) => {
        if (!pendingPromotion) {
            console.log('No pending promotion to handle');
            return;
        }

        console.log('Handling promotion:', { from: pendingPromotion.from, to: pendingPromotion.to, promotionPiece });

        try {
            const piece = chess.get(pendingPromotion.from);
            console.log('Piece at source square:', piece);
            if (!piece || piece.type !== 'p') {
                console.error('No pawn found at source square for promotion');
                setPendingPromotion(null);
                return;
            }

            const move = chess.move({
                from: pendingPromotion.from,
                to: pendingPromotion.to,
                promotion: promotionPiece
            });

            if (move) {
                console.log('Move with promotion successful:', move);
                setFen(chess.fen());
                setMoveHistory(chess.history());
                setFenHistory([...fenHistory, chess.fen()]);
                setRedoHistory([]);
                if (chess.isGameOver()) {
                    const result = chess.isCheckmate() ? (chess.turn() === 'w' ? 'loss' : 'win') : 'draw';
                    console.log('Game over! Result:', result);
                    setGameOver(true);
                    saveGame(result);
                }
            } else {
                console.log('Move with promotion failed: No move returned');
            }
        } catch (error) {
            console.error('Invalid promotion move:', error.message);
            console.log('Current board state (FEN):', chess.fen());
        } finally {
            console.log('Clearing pending promotion');
            setPendingPromotion(null);
        }
    };

    const undoMove = () => {
        if (gameOver || fenHistory.length <= 1) {
            console.log('Cannot undo: Game is over or no moves to undo');
            return;
        }

        const newFenHistory = fenHistory.slice(0, -1);
        const previousFen = newFenHistory[newFenHistory.length - 1];
        const undoneFen = fenHistory[fenHistory.length - 1];

        chess.load(previousFen);
        setFen(chess.fen());
        setFenHistory(newFenHistory);
        setMoveHistory(chess.history());
        setRedoHistory([...redoHistory, undoneFen]);
        console.log('Undo successful. Current board state (FEN):', chess.fen());
    };

    const redoMove = () => {
        if (gameOver || redoHistory.length === 0) {
            console.log('Cannot redo: Game is over or no moves to redo');
            return;
        }

        const nextFen = redoHistory[redoHistory.length - 1];
        const newRedoHistory = redoHistory.slice(0, -1);

        chess.load(nextFen);
        setFen(chess.fen());
        setFenHistory([...fenHistory, chess.fen()]);
        setMoveHistory(chess.history());
        setRedoHistory(newRedoHistory);
        console.log('Redo successful. Current board state (FEN):', chess.fen());
    };

    const saveGame = async (result) => {
        try {
            const response = await axios.post('http://localhost:5000/api/chess/save-game', {
                moves: chess.history(),
                fenHistory: [chess.fen()],
                result
            }, { withCredentials: true });
            console.log('Game saved:', response.data);
            setLastSavedGame(response.data.game);
            alert('Game saved!');
        } catch (error) {
            console.error('Error saving game:', error);
            alert('Failed to save game.');
        }
    };

    const resetGame = () => {
        chess.reset();
        setFen(chess.fen());
        setGameOver(false);
        setLastSavedGame(null);
        setPendingPromotion(null);
        setMoveHistory([]);
        setFenHistory([chess.fen()]);
        setRedoHistory([]);
        setLastCheckFen(null);
        setCheckmatePlayed(false);
        setHasInteracted(false); // Reset interaction state for new game
        console.log('Game reset. New board state (FEN):', chess.fen());
    };

    return (
        <div className="bg-gradient-to-r from-chess-pink/10 to-chess-blue/10 p-5 rounded-2xl shadow-[0_0_20px_#ff69b4] text-center text-white">
            <h2 className="text-4xl text-shadow-lg animate-glow">Chess Mentor</h2>
            {!gameOver && (
                <>
                    <p className="mt-2 text-lg">
                        Current Turn: {chess.turn() === 'w' ? 'White' : 'Black'}
                    </p>
                    {chess.inCheck() && (
                        <p className="mt-2 text-lg text-red-500 animate-pulse">
                            Check! {chess.turn() === 'w' ? 'White' : 'Black'} king is in check!
                        </p>
                    )}
                </>
            )}
            <div className="flex justify-center gap-4">
                <ChessboardWrapper
                    position={fen}
                    onDrop={onDrop}
                    allowDrag={!gameOver && !pendingPromotion}
                    customSquareStyles={customSquareStyles}
                />
                <div className="mt-4">
                    <h3 className="text-xl mb-2">Move History</h3>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                        {moveHistory.length === 0 ? (
                            <p>No moves yet.</p>
                        ) : (
                            <ol className="list-decimal list-inside">
                                {moveHistory.map((move, index) => (
                                    <li key={index} className="text-left">
                                        {Math.floor(index / 2) + 1}. {index % 2 === 0 ? 'White: ' : 'Black: '} {move}
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                    {!gameOver && (
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={undoMove}
                                disabled={fenHistory.length <= 1}
                                className={`px-4 py-2 rounded text-white ${fenHistory.length <= 1 ? 'bg-gray-500 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                            >
                                Undo Last Move
                            </button>
                            <button
                                onClick={redoMove}
                                disabled={redoHistory.length === 0}
                                className={`px-4 py-2 rounded text-white ${redoHistory.length === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                            >
                                Redo Move
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {pendingPromotion && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-lg">
                    <p className="text-lg mb-2">Promote your pawn to:</p>
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => handlePromotion('q')}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Queen
                        </button>
                        <button
                            onClick={() => handlePromotion('r')}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Rook
                        </button>
                        <button
                            onClick={() => handlePromotion('b')}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Bishop
                        </button>
                        <button
                            onClick={() => handlePromotion('n')}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Knight
                        </button>
                    </div>
                </div>
            )}
            {gameOver && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-lg animate-pulse">
                    <p className={`text-2xl ${chess.isCheckmate() ? 'text-yellow-400' : 'text-gray-400'}`}>
                        Game Over! Result: {chess.isCheckmate() ? (chess.turn() === 'w' ? 'Black Wins by Checkmate! 🎉' : 'White Wins by Checkmate! 🎉') : 'Draw'}
                    </p>
                    {lastSavedGame && (
                        <div className="mt-2">
                            <p>Game Saved! Game ID: {lastSavedGame._id}</p>
                            <p>Moves: {lastSavedGame.moves.join(', ')}</p>
                        </div>
                    )}
                    <button
                        onClick={resetGame}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Play Again
                    </button>
                </div>
            )}
            <audio ref={checkSoundRef} src="/sounds/check.mp3" preload="auto" />
            <audio ref={checkmateSoundRef} src="/sounds/checkmate.mp3" preload="auto" />
        </div>
    );
};

export default ChessMentor;