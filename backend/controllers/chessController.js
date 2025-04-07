const { Chess } = require('chess.js');
const ChessGame = require('../models/ChessGame');

// Save a game
exports.saveGame = async (req, res) => {
    try {
        const { moves, fenHistory, result } = req.body;
        const chessGame = new ChessGame({
            userId: req.user.id,
            moves,
            fenHistory,
            result
        });
        await chessGame.save();
        res.json({ success: true, game: chessGame });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save game' });
    }
};

// Get game history
exports.getGameHistory = async (req, res) => {
    try {
        const chessGames = await ChessGame.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(chessGames);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch game history' });
    }
};