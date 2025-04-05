import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

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

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Live Chat</Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.map((msg, i) => (
          <Box
            key={i}
            sx={{
              alignSelf: msg.sender === player.name ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {msg.sender}
            </Typography>
            <Paper
              sx={{
                p: 1,
                bgcolor: msg.sender === player.name ? 'primary.main' : 'grey.100',
                color: msg.sender === player.name ? 'white' : 'text.primary',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ bgcolor: 'background.paper' }}
        />
        <IconButton type="submit" color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default BattleChat;
