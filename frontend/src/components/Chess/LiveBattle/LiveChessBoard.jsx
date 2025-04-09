import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion'; // Still needed for the chessboard animation
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Timer icon

const LiveChessBoard = ({ 
    socket, 
    gameId, 
    playerColor, 
    opponent, 
    player, 
    onGameEnd 
}) => {
    const [game, setGame] = useState(new Chess());
    const [timeLeft, setTimeLeft] = useState({ white: 300, black: 300 }); // 5 minutes each
    const [isMyTurn, setIsMyTurn] = useState(playerColor === 'white');

    useEffect(() => {
        if (!socket) return;

        socket.on('move-made', ({ from, to }) => {
            const gameCopy = new Chess(game.fen());
            gameCopy.move({ from, to });
            setGame(gameCopy);
            setIsMyTurn(true);
        });

        socket.on('game-over', ({ result }) => {
            onGameEnd(result);
        });

        return () => {
            socket.off('move-made');
            socket.off('game-over');
        };
    }, [socket, game]);

    // Timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (game.isGameOver()) return prev;

                const currentTurn = game.turn() === 'w' ? 'white' : 'black';
                if ((currentTurn === 'white' && playerColor === 'white') || (currentTurn === 'black' && playerColor === 'black')) {
                    const newTime = prev[currentTurn] - 1;
                    if (newTime <= 0) {
                        socket.emit('game-over', { gameId });
                        return { ...prev, [currentTurn]: 0 };
                    }
                    return { ...prev, [currentTurn]: newTime };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [game, playerColor, socket, gameId]);

    const onDrop = (sourceSquare, targetSquare) => {
        if (!isMyTurn) return false;

        try {
            const gameCopy = new Chess(game.fen());
            const move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
            });

            if (move === null) return false;

            setGame(gameCopy);
            setIsMyTurn(false);

            socket.emit('move-made', {
                gameId,
                from: sourceSquare,
                to: targetSquare,
            });

            if (gameCopy.isGameOver()) {
                socket.emit('game-over', { gameId });
            }

            return true;
        } catch (error) {
            return false;
        }
    };

    const PlayerInfo = ({ player, time, isBottom, isActive }) => {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 2 },
                    p: { xs: 1, sm: 2 },
                    borderRadius: 3,
                    background: isActive
                        ? 'linear-gradient(45deg, #00ffcc, #ff00cc)'
                        : 'linear-gradient(45deg, #2c2c2c, #1a1a1a)',
                    boxShadow: isActive
                        ? '0 0 15px rgba(0, 255, 255, 0.5)'
                        : '0 4px 10px rgba(0, 0, 0, 0.3)',
                    mb: isBottom ? 0 : { xs: 1, sm: 2 },
                    mt: isBottom ? { xs: 1, sm: 2 } : 0,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: `
                            linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
                            linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%),
                            linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%)
                        `,
                        backgroundSize: '20px 20px',
                        opacity: 0.1,
                    },
                }}
            >
                <Avatar
                    src={player.avatar}
                    alt={player.name}
                    sx={{
                        width: { xs: 40, sm: 50 },
                        height: { xs: 40, sm: 50 },
                        border: isActive ? '3px solid #00ffcc' : '3px solid #ffffff33',
                        boxShadow: isActive ? '0 0 10px rgba(0, 255, 255, 0.7)' : 'none',
                    }}
                />
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                    >
                        {player.name}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        }}
                    >
                        ELO: {player.elo}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                    <AccessTimeIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: 16, sm: 20 } }} />
                    <Typography
                        variant="h6"
                        sx={{
                            color: time <= 30 ? '#ff4444' : 'white',
                            fontWeight: 'bold',
                            minWidth: { xs: '50px', sm: '60px' },
                            textAlign: 'right',
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                    >
                        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                    </Typography>
                </Box>
                {/* Timer Progress Bar (Static, No Animation) */}
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px' }}>
                    <Box
                        sx={{
                            width: `${(time / 300) * 100}%`, // Static width based on time
                            height: '100%',
                            background: time <= 30
                                ? 'linear-gradient(45deg, #ff4444, #ff7777)'
                                : 'linear-gradient(45deg, #00ffcc, #ff00cc)',
                            boxShadow: time <= 30
                                ? '0 0 10px rgba(255, 68, 68, 0.7)'
                                : '0 0 10px rgba(0, 255, 255, 0.7)',
                        }}
                    />
                </Box>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: 500, md: 650 },
                mx: 'auto',
                position: 'relative',
                p: { xs: 1, sm: 2 },
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
                borderRadius: 4,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box',
            }}
        >
            <PlayerInfo
                player={playerColor === 'white' ? opponent : player}
                time={timeLeft[playerColor === 'white' ? 'black' : 'white']}
                isActive={game.turn() === (playerColor === 'white' ? 'b' : 'w')}
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                sx={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Chessboard
                    position={game.fen()}
                    onPieceDrop={onDrop}
                    boardOrientation={playerColor}
                    boardWidth={Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6, 650)}
                    customBoardStyle={{
                        borderRadius: '8px',
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                        border: '2px solid #ffffff22',
                    }}
                    customDarkSquareStyle={{
                        backgroundColor: '#3a3a3a',
                        '&:hover': {
                            backgroundColor: '#4a4a4a',
                        },
                    }}
                    customLightSquareStyle={{
                        backgroundColor: '#e0e0e0',
                        '&:hover': {
                            backgroundColor: '#f0f0f0',
                        },
                    }}
                    customPieces={{
                        wK: ({ squareWidth }) => (
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg"
                                alt="White King"
                                style={{ width: squareWidth, height: squareWidth }}
                            />
                        ),
                        bK: ({ squareWidth }) => (
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg"
                                alt="Black King"
                                style={{ width: squareWidth, height: squareWidth }}
                            />
                        ),
                        // Add more custom pieces as needed
                    }}
                />
            </motion.div>

            <PlayerInfo
                player={playerColor === 'white' ? player : opponent}
                time={timeLeft[playerColor === 'white' ? 'white' : 'black']}
                isBottom
                isActive={game.turn() === (playerColor === 'white' ? 'w' : 'b')}
            />
        </Box>
    );
};

export default LiveChessBoard;