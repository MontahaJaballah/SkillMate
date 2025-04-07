const RubikGame = require('../models/RubikGame');
const RubikChallenge = require('../models/RubikChallenge');
const User = require('../models/User');

// Initialize a new Rubik's cube game
exports.initializeGame = async (req, res) => {
    try {
        const initialState = {
            front: Array(3).fill().map(() => Array(3).fill('red')),
            back: Array(3).fill().map(() => Array(3).fill('orange')),
            up: Array(3).fill().map(() => Array(3).fill('white')),
            down: Array(3).fill().map(() => Array(3).fill('yellow')),
            left: Array(3).fill().map(() => Array(3).fill('green')),
            right: Array(3).fill().map(() => Array(3).fill('blue'))
        };

        const newGame = new RubikGame({
            userId: req.user.id,
            cubeState: initialState,
            moves: [],
            timeElapsed: 0
        });

        await newGame.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get game state
exports.getGameState = async (req, res) => {
    try {
        const game = await RubikGame.findById(req.params.gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Make a move
exports.makeMove = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { move } = req.body;

        const game = await RubikGame.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Add move to history
        game.moves.push(move);
        
        // Update cube state based on move
        game.cubeState = applyMove(game.cubeState, move);
        
        // Check if cube is solved
        game.isSolved = checkIfSolved(game.cubeState);
        
        await game.save();
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to apply a move to the cube state
function applyMove(cubeState, move) {
    // Deep copy the current state
    const newState = JSON.parse(JSON.stringify(cubeState));
    
    // Implement move logic here based on standard cube notation
    // This is a simplified version - you'll need to implement the actual rotation logic
    switch(move) {
        case 'R': // Right face clockwise
        case 'L': // Left face clockwise
        case 'U': // Up face clockwise
        case 'D': // Down face clockwise
        case 'F': // Front face clockwise
        case 'B': // Back face clockwise
            // Implement rotation logic
            break;
    }
    
    return newState;
}

// Helper function to check if cube is solved
function checkIfSolved(cubeState) {
    // Check if each face has all the same color
    return Object.values(cubeState).every(face => 
        face.every(row => 
            row.every(cell => cell === row[0])
        )
    );
}

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const { timeframe = 'all', limit = 10 } = req.query;

        let dateFilter = {};
        const now = new Date();

        switch (timeframe) {
            case 'daily':
                dateFilter = {
                    date: {
                        $gte: new Date(now.setHours(0, 0, 0, 0))
                    }
                };
                break;
            case 'weekly':
                dateFilter = {
                    date: {
                        $gte: new Date(now.setDate(now.getDate() - 7))
                    }
                };
                break;
            case 'monthly':
                dateFilter = {
                    date: {
                        $gte: new Date(now.setMonth(now.getMonth() - 1))
                    }
                };
                break;
        }

        // Get solved games with minimum completion time for each user
        const leaderboard = await RubikGame.aggregate([
            { 
                $match: { 
                    ...dateFilter,
                    isSolved: true,
                    timeElapsed: { $gt: 0 }
                } 
            },
            {
                $group: {
                    _id: '$userId',
                    bestTime: { $min: '$timeElapsed' },
                    gamesPlayed: { $sum: 1 },
                    lastPlayed: { $max: '$date' }
                }
            },
            {
                $sort: { bestTime: 1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    username: '$user.username',
                    bestTime: 1,
                    gamesPlayed: 1,
                    lastPlayed: 1,
                    rank: { $add: [{ $indexOfArray: ['$_id', '$_id'] }, 1] }
                }
            }
        ]);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Save game data
exports.saveGame = async (req, res) => {
    try {
        const { moves, timeElapsed, isSolved, cubeState } = req.body;
        const userId = req.user.id;

        const game = new RubikGame({
            userId,
            moves,
            timeElapsed,
            isSolved,
            cubeState
        });

        await game.save();
        res.status(201).json(game);
    } catch (error) {
        console.error('Error saving game:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create a new challenge
exports.createChallenge = async (req, res) => {
    try {
        const { receiverUsername, timeLimit } = req.body;
        const senderId = req.user.id;

        // Find receiver by username
        const receiver = await User.findOne({ username: receiverUsername });
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if there's already a pending challenge
        const existingChallenge = await RubikChallenge.findOne({
            senderId,
            receiverId: receiver._id,
            status: 'pending'
        });

        if (existingChallenge) {
            return res.status(400).json({ message: 'You already have a pending challenge with this user' });
        }

        // Create the challenge
        const challenge = await RubikChallenge.create({
            senderId,
            receiverId: receiver._id,
            timeLimit,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
        });

        await challenge.populate('senderId', 'username');
        await challenge.populate('receiverId', 'username');

        res.status(201).json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all challenges for a user
exports.getChallenges = async (req, res) => {
    try {
        const userId = req.user._id;

        const challenges = await RubikChallenge.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        })
        .populate('senderId', 'username')
        .populate('receiverId', 'username')
        .populate('winner', 'username')
        .sort('-createdAt');

        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Accept a challenge
exports.acceptChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const userId = req.user._id;

        const challenge = await RubikChallenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        if (challenge.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (challenge.status !== 'pending') {
            return res.status(400).json({ message: 'Challenge cannot be accepted' });
        }

        challenge.status = 'accepted';
        await challenge.save();

        await challenge.populate('senderId', 'username');
        await challenge.populate('receiverId', 'username');

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Complete a challenge
exports.completeChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const { gameId, completionTime } = req.body;
        const userId = req.user._id;

        const challenge = await RubikChallenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        if (![challenge.senderId.toString(), challenge.receiverId.toString()].includes(userId.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (challenge.status !== 'accepted') {
            return res.status(400).json({ message: 'Challenge must be accepted first' });
        }

        // Update the challenge with the game result
        if (userId.toString() === challenge.senderId.toString()) {
            challenge.senderGame = gameId;
        } else {
            challenge.receiverGame = gameId;
        }

        // If both players have completed, determine the winner
        if (challenge.senderGame && challenge.receiverGame) {
            const senderGame = await RubikGame.findById(challenge.senderGame);
            const receiverGame = await RubikGame.findById(challenge.receiverGame);

            if (senderGame.timeElapsed < receiverGame.timeElapsed) {
                challenge.winner = challenge.senderId;
            } else {
                challenge.winner = challenge.receiverId;
            }
            challenge.status = 'completed';
        }

        await challenge.save();
        await challenge.populate('senderId', 'username');
        await challenge.populate('receiverId', 'username');
        await challenge.populate('winner', 'username');

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};