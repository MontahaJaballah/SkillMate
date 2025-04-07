const mongoose = require('mongoose');

const chessGameSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    opponentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moves: [String],
    fenHistory: [String],
    result: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChessGame', chessGameSchema);