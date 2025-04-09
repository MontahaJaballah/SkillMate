import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Fade,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion'; // For animations
import ChessIcon from '@mui/icons-material/EmojiEvents'; // A chess-related icon (you can replace with a custom chess piece icon)

const Matchmaking = ({ isSearching, onFindMatch, onCancel }) => {
  // Animation variants for the button
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: '0px 8px 20px rgba(0, 255, 255, 0.5)',
      transition: {
        duration: 0.3,
        yoyo: Infinity, // Pulsing effect
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  // Animation for the CircularProgress
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'linear',
      },
    },
  };

  return (
    <Paper
      elevation={6}
      sx={{
        p: 5,
        textAlign: 'center',
        maxWidth: 450,
        mx: 'auto',
        mt: 6,
        borderRadius: 4,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)', // Dark gradient background
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        // Chessboard pattern overlay
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
          backgroundSize: '40px 40px',
          opacity: 0.2,
        },
      }}
    >
      {isSearching ? (
        <Fade in={isSearching} timeout={500}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <motion.div variants={spinnerVariants} animate="animate">
              <CircularProgress
                size={60}
                thickness={5}
                sx={{
                  color: 'cyan',
                  filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.7))',
                }}
              />
            </motion.div>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              Finding an Opponent...
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontStyle: 'italic',
              }}
            >
              This may take a few moments
            </Typography>
            <Button
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onCancel}
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'error.main',
                color: 'error.main',
                fontWeight: 'bold',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'error.light',
                  color: 'error.light',
                  background: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Fade>
      ) : (
        <Fade in={!isSearching} timeout={500}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <ChessIcon
                sx={{
                  fontSize: 60,
                  color: 'linear-gradient(45deg, #00ffcc, #ff00cc)',
                  background: 'linear-gradient(45deg, #00ffcc, #ff00cc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))',
                }}
              />
            </motion.div>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              Ready to Play?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                px: 2,
                lineHeight: 1.5,
              }}
            >
              Click below to find an opponent for a live chess battle
            </Typography>
            <Button
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onFindMatch}
              sx={{
                mt: 2,
                px: 5,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #00ffcc, #ff00cc)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: '0 5px 15px rgba(0, 255, 255, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00ffcc, #ff00cc)',
                  boxShadow: '0 8px 20px rgba(0, 255, 255, 0.6)',
                },
              }}
            >
              Find Opponent
            </Button>
          </Box>
        </Fade>
      )}
    </Paper>
  );
};

export default Matchmaking;