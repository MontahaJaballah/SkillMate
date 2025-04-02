const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Your React app's URL
        methods: ['GET', 'POST'],
    },
});

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL (update if needed)
    credentials: true,
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Parse JSON bodies
app.use(express.json());

// Sample puzzles (same as in Chess Puzzle Mode)
const puzzles = [
    {
        id: 1,
        fen: 'rnbqkb1r/pppp1ppp/8/5p2/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 2',
        description: 'White to play and checkmate in 1',
        solution: ['Qh5#'],
    },
    {
        id: 2,
        fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 2',
        description: 'White to play and win material in 1',
        solution: ['Nxe5'],
    },
    {
        id: 3,
        fen: '8/5pk1/5p1p/2R3p1/8/8/5PPP/6K1 w - - 0 1',
        description: 'White to play and checkmate in 1',
        solution: ['Rc7#'],
    },
];

// Store active challenge rooms
const challengeRooms = new Map();

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Join a challenge room
    socket.on('joinChallenge', ({ roomId, playerName }) => {
        let room = challengeRooms.get(roomId);

        if (!room) {
            // Create a new room with a random puzzle
            const puzzleIndex = Math.floor(Math.random() * puzzles.length);
            room = {
                players: [],
                puzzle: puzzles[puzzleIndex],
                winner: null,
                startTime: null,
            };
            challengeRooms.set(roomId, room);
        }

        // Add player to the room
        if (room.players.length < 2 && !room.players.find(p => p.id === socket.id)) {
            room.players.push({ id: socket.id, name: playerName, solved: false });
            socket.join(roomId);

            // Notify all players in the room
            io.to(roomId).emit('roomUpdate', {
                players: room.players,
                puzzle: room.puzzle,
                winner: room.winner,
            });

            // Start the challenge if two players are in the room
            if (room.players.length === 2 && !room.startTime) {
                room.startTime = Date.now();
                io.to(roomId).emit('startChallenge', { startTime: room.startTime });
            }
        } else {
            socket.emit('roomFull', { message: 'This challenge room is full.' });
        }
    });

    // Handle a player's move
    socket.on('submitMove', ({ roomId, move }) => {
        const room = challengeRooms.get(roomId);
        if (!room || room.winner) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        // Check if the move solves the puzzle
        const expectedMove = room.puzzle.solution[0].replace('#', '').replace('+', '');
        if (move.san.replace('+', '') === expectedMove) {
            player.solved = true;
            room.winner = player.name;

            // Notify all players in the room
            io.to(roomId).emit('challengeResult', {
                winner: room.winner,
                timeTaken: (Date.now() - room.startTime) / 1000, // Time in seconds
            });

            // Clean up the room after a short delay
            setTimeout(() => {
                challengeRooms.delete(roomId);
            }, 5000);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Disconnected:', socket.id);
        for (const [roomId, room] of challengeRooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                io.to(roomId).emit('roomUpdate', {
                    players: room.players,
                    puzzle: room.puzzle,
                    winner: room.winner,
                });

                if (room.players.length === 0) {
                    challengeRooms.delete(roomId);
                }
            }
        }
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});