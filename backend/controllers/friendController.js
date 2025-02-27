const Friend = require('../models/Friend');
const User = require('../models/User');

// Send a friend request
async function sendRequest(req, res) {
    try {
        const { requesterId, recipientId } = req.body;

        // Check if users exist
        const requester = await User.findById(requesterId);
        const recipient = await User.findById(recipientId);

        if (!requester || !recipient) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if a request already exists
        const existingRequest = await Friend.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ 
                message: 'A friend request already exists between these users',
                status: existingRequest.status
            });
        }

        // Create new friend request
        const newRequest = new Friend({
            requester: requesterId,
            recipient: recipientId
        });

        await newRequest.save();
        res.status(201).json({ message: 'Friend request sent successfully', request: newRequest });
    } catch (error) {
        console.error('Error in sendRequest:', error);
        res.status(500).json({ message: error.message });
    }
}

// Accept a friend request
async function acceptRequest(req, res) {
    try {
        const { requestId } = req.body;

        const request = await Friend.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Request already ${request.status}` });
        }

        request.status = 'accepted';
        request.updatedAt = new Date();
        await request.save();

        res.status(200).json({ message: 'Friend request accepted', request });
    } catch (error) {
        console.error('Error in acceptRequest:', error);
        res.status(500).json({ message: error.message });
    }
}

// Reject a friend request
async function rejectRequest(req, res) {
    try {
        const { requestId } = req.body;

        const request = await Friend.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Request already ${request.status}` });
        }

        request.status = 'rejected';
        request.updatedAt = new Date();
        await request.save();

        res.status(200).json({ message: 'Friend request rejected', request });
    } catch (error) {
        console.error('Error in rejectRequest:', error);
        res.status(500).json({ message: error.message });
    }
}

// Get all pending requests for a user
async function getPendingRequests(req, res) {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const pendingRequests = await Friend.find({
            recipient: userId,
            status: 'pending'
        }).populate('requester', 'firstName lastName username email photoURL');

        res.json(pendingRequests);
    } catch (error) {
        console.error('Error in getPendingRequests:', error);
        res.status(500).json({ message: error.message });
    }
}

// Get all friends for a user
async function getFriends(req, res) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Find all accepted friend connections where the user is either the requester or recipient
        const friends = await Friend.find({
            $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' }
            ]
        }).populate('requester recipient', 'firstName lastName username email photoURL isOnline');

        // Format the response to include the friend's user object
        const formattedFriends = friends.map(friend => {
            const friendUser = friend.requester._id.toString() === userId ? friend.recipient : friend.requester;
            return {
                _id: friend._id,
                user: friendUser,
                status: friend.status,
                createdAt: friend.createdAt
            };
        });

        res.json(formattedFriends);
    } catch (error) {
        console.error('Error in getFriends:', error);
        res.status(500).json({ message: error.message });
    }
}

// Get sent requests by a user
async function getSentRequests(req, res) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const sentRequests = await Friend.find({
            requester: userId,
            status: 'pending'
        }).populate('recipient', 'firstName lastName username email photoURL');

        res.json(sentRequests);
    } catch (error) {
        console.error('Error in getSentRequests:', error);
        res.status(500).json({ message: error.message });
    }
}

// Remove a friend
async function removeFriend(req, res) {
    try {
        const { friendshipId } = req.body;

        const result = await Friend.findByIdAndDelete(friendshipId);
        if (!result) {
            return res.status(404).json({ message: 'Friendship not found' });
        }

        res.json({ message: 'Friend removed successfully' });
    } catch (error) {
        console.error('Error in removeFriend:', error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    sendRequest,
    acceptRequest,
    rejectRequest,
    getPendingRequests,
    getFriends,
    getSentRequests,
    removeFriend
};
