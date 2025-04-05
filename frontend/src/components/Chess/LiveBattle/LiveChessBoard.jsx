import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Box, Typography, Avatar, CircularProgress } from '@mui/material';

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

  const PlayerInfo = ({ player, time, isBottom }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        mb: isBottom ? 0 : 2,
        mt: isBottom ? 2 : 0,
      }}
    >
      <Avatar src={player.avatar} alt={player.name} />
      <Box>
        <Typography variant="subtitle1">{player.name}</Typography>
        <Typography variant="caption">ELO: {player.elo}</Typography>
      </Box>
      <Typography variant="h6" ml="auto">
        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <PlayerInfo
        player={playerColor === 'white' ? opponent : player}
        time={timeLeft[playerColor === 'white' ? 'black' : 'white']}
      />
      
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={playerColor}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      />

      <PlayerInfo
        player={playerColor === 'white' ? player : opponent}
        time={timeLeft[playerColor === 'white' ? 'white' : 'black']}
        isBottom
      />
    </Box>
  );
};

export default LiveChessBoard;
