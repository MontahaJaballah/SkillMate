import React, { useState, useEffect } from 'react';
import ChessboardWrapper from './ChessboardWrapper';
import * as ChessModule from 'chess.js';
import { Howl } from 'howler';

const ChessMentor = () => {
    const [chess] = useState(new ChessModule.Chess());
    console.log('Chess instance methods:', Object.getOwnPropertyNames(ChessModule.Chess.prototype));
    const [fen, setFen] = useState(chess.fen());
    const [moveHistory, setMoveHistory] = useState([]);
    const [fenHistory, setFenHistory] = useState([chess.fen()]);
    const [redoHistory, setRedoHistory] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [pendingPromotion, setPendingPromotion] = useState(null);
    const [customSquareStyles, setCustomSquareStyles] = useState({});
    const [boardOrientation, setBoardOrientation] = useState('white');
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [isInCheck, setIsInCheck] = useState(false);
    const [currentTurn, setCurrentTurn] = useState('White');

    const moveSound = new Howl({ src: ['/sounds/move.mp3'] });
    const checkSound = new Howl({ src: ['/sounds/check.mp3'] });
    const checkmateSound = new Howl({ src: ['/sounds/checkmate.mp3'] });
    const horseSound = new Howl({ src: ['/sounds/horse.mp3'] });

    const onDrop = (sourceSquare, targetSquare, piece) => {
        if (gameOver) return false;

        console.log('Attempting move:', { from: sourceSquare, to: targetSquare });
        const move = chess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q',
        });

        if (!move) {
            console.log('Invalid move:', { from: sourceSquare, to: targetSquare });
            return false;
        }

        if (move.flags.includes('p')) {
            chess.undo();
            setPendingPromotion({ from: sourceSquare, to: targetSquare });
            return false;
        }

        handleMove(move, sourceSquare, targetSquare);
        setSelectedPiece(null);
        setCustomSquareStyles({});
        return true;
    };

    const handleMove = (move, sourceSquare, targetSquare) => {
        console.log('Move made:', move);
        console.log('New FEN:', chess.fen());
        setFen(chess.fen());
        setMoveHistory([...moveHistory, move.san]);
        setFenHistory([...fenHistory, chess.fen()]);
        setRedoHistory([]);

        setCustomSquareStyles({
            [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
            [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
        });

        // Update check status
        const inCheck = chess.isCheck();
        setIsInCheck(inCheck);

        // Update current turn
        const turn = chess.turn();
        setCurrentTurn(turn === 'w' ? 'White' : 'Black');

        // Play sounds
        // 1. Play move sound by default
        let playMoveSound = true;

        // 2. Play horse sound instead of move sound if knight captures
        if (move.piece === 'n' && move.flags.includes('c')) {
            horseSound.play();
            playMoveSound = false; // Skip the default move sound
        }

        // 3. Play the default move sound if not overridden
        if (playMoveSound) {
            moveSound.play();
        }

        // 4. Play check or checkmate sound in addition to the move sound
        if (chess.isCheckmate()) {
            checkmateSound.play();
            setGameOver(true);
        } else if (inCheck) {
            checkSound.play();
        }
    };

    const handlePromotion = (piece) => {
        if (!pendingPromotion) return;

        const { from, to } = pendingPromotion;
        const move = chess.move({
            from,
            to,
            promotion: piece,
        });

        if (move) {
            handleMove(move, from, to);
            setPendingPromotion(null);
            setSelectedPiece(null);
            setCustomSquareStyles({});
        }
    };

    const undoMove = () => {
        if (fenHistory.length <= 1) return;

        const newFenHistory = [...fenHistory];
        const newMoveHistory = [...moveHistory];
        const lastFen = newFenHistory[newFenHistory.length - 2];
        const lastMove = newMoveHistory.pop();

        chess.load(lastFen);
        setFen(lastFen);
        setFenHistory(newFenHistory.slice(0, -1));
        setMoveHistory(newMoveHistory);
        setRedoHistory([...redoHistory, { fen: fenHistory[fenHistory.length - 1], move: lastMove }]);
        setCustomSquareStyles({});
        setSelectedPiece(null);
        setIsInCheck(chess.isCheck());
        const turn = chess.turn();
        setCurrentTurn(turn === 'w' ? 'White' : 'Black');
    };

    const redoMove = () => {
        if (redoHistory.length === 0) return;

        const newRedoHistory = [...redoHistory];
        const { fen, move } = newRedoHistory.pop();

        chess.load(fen);
        setFen(fen);
        setFenHistory([...fenHistory, fen]);
        setMoveHistory([...moveHistory, move]);
        setRedoHistory(newRedoHistory);
        setCustomSquareStyles({});
        setSelectedPiece(null);
        setIsInCheck(chess.isCheck());
        const turn = chess.turn();
        setCurrentTurn(turn === 'w' ? 'White' : 'Black');
    };

    const flipBoard = () => {
        setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white');
    };

    const highlightLegalMoves = (square) => {
        console.log(`Highlighting legal moves for square: ${square}`);
        const piece = chess.get(square);
        if (!piece) {
            console.log('No piece on this square');
            return;
        }

        if (piece.color !== chess.turn()) {
            console.log(`Not your turn! Current turn: ${chess.turn()}, Piece color: ${piece.color}`);
            return;
        }

        setSelectedPiece(square);
        const moves = chess.moves({ square, verbose: true });
        console.log(`Legal moves for ${square}:`, moves);

        const legalSquares = moves.reduce((styles, move) => {
            styles[move.to] = {
                background: 'rgba(0, 255, 0, 0.5)',
                borderRadius: '50%',
            };
            return styles;
        }, {});

        legalSquares[square] = {
            background: 'rgba(255, 255, 0, 0.6)',
        };

        console.log('Setting custom square styles:', legalSquares);
        setCustomSquareStyles(legalSquares);
    };

    const clearHighlights = () => {
        console.log('Clearing highlights');
        setSelectedPiece(null);
        setCustomSquareStyles({});
    };

    const onSquareClick = (square) => {
        console.log(`Square clicked: ${square}`);
        if (gameOver || pendingPromotion) {
            console.log('Game over or pending promotion, ignoring click');
            return;
        }

        const piece = chess.get(square);
        console.log(`Piece on ${square}:`, piece);

        if (selectedPiece) {
            if (selectedPiece === square) {
                clearHighlights();
                return;
            }

            console.log(`Attempting move from ${selectedPiece} to ${square}`);
            const move = chess.move({
                from: selectedPiece,
                to: square,
                promotion: 'q',
            });

            if (move) {
                console.log('Move successful:', move);
                if (move.flags.includes('p')) {
                    chess.undo();
                    setPendingPromotion({ from: selectedPiece, to: square });
                } else {
                    handleMove(move, selectedPiece, square);
                }
                setSelectedPiece(null);
                setCustomSquareStyles({});
            } else {
                console.log('Move failed');
                if (piece && piece.color === chess.turn()) {
                    highlightLegalMoves(square);
                } else {
                    clearHighlights();
                }
            }
        } else {
            if (piece && piece.color === chess.turn()) {
                highlightLegalMoves(square);
            }
        }
    };

    const onPieceDragBegin = (piece, sourceSquare) => {
        console.log(`Drag started on piece: ${piece} from square: ${sourceSquare}`);
        if (gameOver || pendingPromotion) return;
        highlightLegalMoves(sourceSquare);
    };

    const onPieceDragEnd = (piece, sourceSquare) => {
        console.log(`Drag ended for piece: ${piece} from square: ${sourceSquare}`);
        if (!selectedPiece) {
            clearHighlights();
        }
    };

    return (
        <div className="flex justify-center gap-4 items-start">
            <ChessboardWrapper
                position={fen}
                onDrop={onDrop}
                allowDrag={!gameOver && !pendingPromotion}
                customSquareStyles={customSquareStyles}
                boardOrientation={boardOrientation}
                onPieceDragBegin={onPieceDragBegin}
                onPieceDragEnd={onPieceDragEnd}
                onSquareClick={onSquareClick}
                isInCheck={isInCheck}
            />
            <div className="mt-4 flex-1 max-w-xs">
                <h3 className="text-xl mb-2">Current Turn</h3>
                <div className={`p-2 rounded-lg text-white text-center mb-4 ${currentTurn === 'White' ? 'bg-gray-200 text-black' : 'bg-gray-800'}`}>
                    {currentTurn}'s Turn
                </div>
                <h3 className="text-xl mb-2">Move History</h3>
                <div className="bg-white p-4 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {moveHistory.length === 0 ? (
                        <p>No moves yet.</p>
                    ) : (
                        <ol className="list-decimal list-inside">
                            {moveHistory.map((move, index) => {
                                const isLastMove = index === moveHistory.length - 1;
                                const displayMove = isLastMove && chess.isCheckmate() ? `${move}#` : move;
                                return (
                                    <li key={index} className="text-left">
                                        {Math.floor(index / 2) + 1}. {index % 2 === 0 ? 'White: ' : 'Black: '} {displayMove}
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </div>
                {!gameOver && (
                    <div className="mt-4 flex gap-2 flex-wrap">
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
                        <button
                            onClick={flipBoard}
                            className="px-4 py-2 rounded text-white bg-purple-500 hover:bg-purple-600"
                        >
                            Flip to {boardOrientation === 'white' ? 'Black' : 'White'}
                        </button>
                    </div>
                )}
                {pendingPromotion && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-lg">
                        <p className="text-white mb-2">Promote your pawn to:</p>
                        <div className="flex gap-2">
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
            </div>
        </div>
    );
};

export default ChessMentor;