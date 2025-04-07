const mongoose = require('mongoose');

const rubikChallengeSchema = new mongoose.Schema({
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    receiverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    timeLimit: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'completed', 'rejected'],
        default: 'pending'
    },
    senderGame: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'RubikGame'
    },
    receiverGame: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'RubikGame'
    },
    winner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

// Create indexes for efficient querying
rubikChallengeSchema.index({ senderId: 1, status: 1 });
rubikChallengeSchema.index({ receiverId: 1, status: 1 });
rubikChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired challenges

module.exports = mongoose.model('RubikChallenge', rubikChallengeSchema);
