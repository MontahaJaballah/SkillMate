const mongoose = require('mongoose');

const rubikGameSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moves: [String],
    cubeState: {
        front: [[String]],
        back: [[String]],
        up: [[String]],
        down: [[String]],
        left: [[String]],
        right: [[String]]
    },
    timeElapsed: Number,
    isSolved: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RubikGame', rubikGameSchema);
