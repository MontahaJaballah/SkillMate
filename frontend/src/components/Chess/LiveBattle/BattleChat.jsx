import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  IconButton,
  Fade,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion'; // For animations

const BattleChat = ({ socket, gameId, player }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      sender: player.name,
      content: message,
      timestamp: new Date().toISOString(),
    };

    socket.emit('chat-message', { gameId, message: newMessage });
    setMessage('');
  };

  // Animation variants for the send button
  const buttonVariants = {
    hover: {
      scale: 1.1,
      boxShadow: '0px 0px 10px rgba(0, 255, 255, 0.5)',
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.9,
    },
  };

  return (
    <Paper
      elevation={4}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)', // Dark gradient background
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',
        position: 'relative',
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
          backgroundSize: '30px 30px',
          opacity: 0.1,
        },
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderBottom: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          bgcolor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(5px)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          Live Chat
        </Typography>
      </Box>

      {/* Chat Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.map((msg, i) => (
          <Fade key={i} in={true} timeout={500}>
            <Box
              sx={{
                alignSelf: msg.sender === player.name ? 'flex-end' : 'flex-start',
                maxWidth: { xs: '85%', sm: '80%' },
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  alignSelf: msg.sender === player.name ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: msg.sender === player.name ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                  color: msg.sender === player.name ? 'white' : 'white',
                  borderRadius: 3,
                  boxShadow: msg.sender === player.name
                    ? '0 0 10px rgba(0, 123, 255, 0.5)'
                    : '0 0 5px rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(5px)',
                  border: msg.sender === player.name ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.85rem', sm: '0.875rem' },
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </Typography>
              </Paper>
            </Box>
          </Fade>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Chat Input */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: { xs: 1, sm: 2 },
          borderTop: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: 1,
          bgcolor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(5px)',
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            '& .MuiInputBase-input': {
              color: 'white',
              fontSize: { xs: '0.85rem', sm: '0.875rem' },
              padding: { xs: '8px 12px', sm: '10px 14px' },
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00ffcc',
                boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
              },
            },
          }}
        />
        <IconButton
          component={motion.button}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          type="submit"
          sx={{
            color: 'white',
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            borderRadius: '50%',
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
          }}
        >
          <SendIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default BattleChat;