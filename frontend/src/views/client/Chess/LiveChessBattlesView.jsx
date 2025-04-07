import React, { useState, useEffect } from 'react';
import { Box, Container, Paper } from '@mui/material';
import { io } from 'socket.io-client';
import ChessSidebar from '../../../components/Chess/ChessSidebar';
import LiveChessBoard from '../../../components/Chess/LiveBattle/LiveChessBoard';
import Matchmaking from '../../../components/Chess/LiveBattle/Matchmaking';
import BattleChat from '../../../components/Chess/LiveBattle/BattleChat';
import BattleResultModal from '../../../components/Chess/LiveBattle/BattleResultModal';

const LiveChessBattlesView = () => {
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState('idle'); // idle, searching, playing
    const [gameData, setGameData] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [gameResult, setGameResult] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5001');
        setSocket(newSocket);

        // Debug Socket.IO connection
        newSocket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });
        newSocket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
        });

        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('match-found', (data) => {
            console.log('match-found event received:', data);
            setGameState('playing');
            setGameData(data);
        });

        socket.on('game-over', (result) => {
            console.log('game-over event received:', result);
            setGameResult(result);
            setShowResultModal(true);
        });

        return () => {
            socket.off('match-found');
            socket.off('game-over');
        };
    }, [socket]);

    const handleFindMatch = () => {
        console.log('Finding match...');
        setGameState('searching');
        socket?.emit('find-match');
    };

    const handleCancelSearch = () => {
        console.log('Canceling search...');
        setGameState('idle');
        socket?.emit('cancel-search');
    };

    const handleRematch = () => {
        console.log('Requesting rematch...');
        setShowResultModal(false);
        handleFindMatch();
    };

    const handleExit = () => {
        console.log('Exiting game...');
        setShowResultModal(false);
        setGameState('idle');
        setGameData(null);
        setGameResult(null);
    };

    return (
        <Box className="flex min-h-screen bg-gray-900">
            <ChessSidebar />

            <Container maxWidth="xl" sx={{ ml: '240px', py: 4 }}>
                {gameState === 'playing' && gameData ? (
                    <Box sx={{ display: 'flex', gap: 4 }}>
                        <Box sx={{ flex: 1 }}>
                            <LiveChessBoard
                                socket={socket}
                                gameId={gameData.gameId}
                                playerColor={gameData.playerColor}
                                player={gameData.player}
                                opponent={gameData.opponent}
                                onGameEnd={(result) => setGameResult(result)}
                            />
                        </Box>

                        <Box sx={{ width: 320 }}>
                            <BattleChat
                                socket={socket}
                                gameId={gameData.gameId}
                                player={gameData.player}
                            />
                        </Box>
                    </Box>
                ) : (
                    <Matchmaking
                        isSearching={gameState === 'searching'}
                        onFindMatch={handleFindMatch}
                        onCancel={handleCancelSearch}
                    />
                )}

                <BattleResultModal
                    open={showResultModal}
                    result={gameResult?.type}
                    winner={gameResult?.winner}
                    eloChange={gameResult?.eloChange}
                    onRematch={handleRematch}
                    onReplay={() => {}} // TODO: Implement replay functionality
                    onExit={handleExit}
                />
            </Container>
        </Box>
    );
};

export default LiveChessBattlesView;