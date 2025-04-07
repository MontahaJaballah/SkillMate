import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const BattleResultModal = ({
  open,
  result,
  winner,
  eloChange,
  onRematch,
  onReplay,
  onExit,
}) => {
  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        Game Over
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          {winner && (
            <Box sx={{ mb: 3 }}>
              <EmojiEventsIcon
                sx={{ fontSize: 48, color: 'warning.main', mb: 1 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Avatar src={winner.avatar} alt={winner.name} />
                <Typography variant="h6">
                  {winner.name} wins!
                </Typography>
              </Box>
            </Box>
          )}

          <Typography variant="body1" color="text.secondary" gutterBottom>
            {result === 'draw' ? 'The game ended in a draw!' : result}
          </Typography>

          {eloChange && (
            <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
              ELO Change: {eloChange > 0 ? '+' : ''}{eloChange}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onReplay}
          sx={{ minWidth: 100 }}
        >
          View Replay
        </Button>
        <Button
          variant="contained"
          onClick={onRematch}
          color="primary"
          sx={{ minWidth: 100 }}
        >
          Rematch
        </Button>
        <Button
          variant="outlined"
          onClick={onExit}
          color="secondary"
          sx={{ minWidth: 100 }}
        >
          Exit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BattleResultModal;
