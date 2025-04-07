import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Matchmaking = ({ isSearching, onFindMatch, onCancel }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        textAlign: 'center',
        maxWidth: 400,
        mx: 'auto',
        mt: 4,
        borderRadius: 2,
      }}
    >
      {isSearching ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={48} />
          <Typography variant="h6">Finding an opponent...</Typography>
          <Typography variant="body2" color="text.secondary">
            This may take a few moments
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancel}
            sx={{ mt: 2 }}
          >
            Cancel
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <SearchIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h6">Ready to Play?</Typography>
          <Typography variant="body2" color="text.secondary">
            Click below to find an opponent for a live chess battle
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onFindMatch}
            sx={{ mt: 2 }}
          >
            Find Opponent
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default Matchmaking;
