const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Parse JSON bodies
app.use(express.json());

// Matchmaking queue for live chess battles
const matchmakingQueue = [];
const activeGames = new Map();

// Sample puzzles (for Chess Challenges)
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

// Store active challenge rooms (for Chess Challenges)
const challengeRooms = new Map();

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // --- Chess Challenges Logic ---
    socket.on('joinChallenge', ({ roomId, playerName }) => {
        console.log('joinChallenge event received:', { roomId, playerName });
        let room = challengeRooms.get(roomId);

        if (!room) {
            const puzzleIndex = Math.floor(Math.random() * puzzles.length);
            room = {
                players: [],
                puzzle: puzzles[puzzleIndex],
                winner: null,
                startTime: null,
            };
            challengeRooms.set(roomId, room);
            console.log('Created new room:', roomId);
        }

        if (room.players.length < 2 && !room.players.find(p => p.id === socket.id)) {
            room.players.push({ id: socket.id, name: playerName, solved: false });
            socket.join(roomId);
            console.log('Player joined room:', { roomId, playerName, players: room.players });

            io.to(roomId).emit('roomUpdate', {
                players: room.players,
                puzzle: room.puzzle,
                winner: room.winner,
            });

            if (room.players.length === 2 && !room.startTime) {
                room.startTime = Date.now();
                io.to(roomId).emit('startChallenge', { startTime: room.startTime });
                console.log('Challenge started in room:', roomId);
            }
        } else {
            socket.emit('roomFull', { message: 'This challenge room is full.' });
            console.log('Room full:', roomId);
        }
    });

    socket.on('submitMove', ({ roomId, move }) => {
        console.log('submitMove event received:', { roomId, move });
        const room = challengeRooms.get(roomId);
        if (!room || room.winner) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        const expectedMove = room.puzzle.solution[0].replace('#', '').replace('+', '');
        if (move.san.replace('+', '') === expectedMove) {
            player.solved = true;
            room.winner = player.name;

            io.to(roomId).emit('challengeResult', {
                winner: room.winner,
                timeTaken: (Date.now() - room.startTime) / 1000,
            });
            console.log('Challenge ended in room:', { roomId, winner: room.winner });

            setTimeout(() => {
                challengeRooms.delete(roomId);
                console.log('Room deleted:', roomId);
            }, 5000);
        }
    });

    // --- Live Chess Battles Logic ---
    socket.on('find-match', () => {
        console.log('find-match event received from:', socket.id);

        // Add player to the matchmaking queue
        const playerData = {
            socketId: socket.id,
            player: {
                id: socket.id,
                name: `Player_${socket.id.slice(0, 4)}`,
                avatar: '',
                elo: 1500,
            },
        };
        matchmakingQueue.push(playerData);
        console.log('Player added to queue:', playerData);
        console.log('Current matchmaking queue:', matchmakingQueue.map(p => p.socketId));

        // Check if there are at least 2 players in the queue
        if (matchmakingQueue.length >= 2) {
            const player1 = matchmakingQueue.shift();
            const player2 = matchmakingQueue.shift();

            const gameId = uuidv4();
            const playerColor1 = 'white';
            const playerColor2 = 'black';

            // Store the game state
            activeGames.set(gameId, {
                player1: { socketId: player1.socketId, color: playerColor1, player: player1.player },
                player2: { socketId: player2.socketId, color: playerColor2, player: player2.player },
                gameState: 'playing',
            });

            // Emit match-found to both players
            console.log('Emitting match-found to player1:', player1.socketId);
            io.to(player1.socketId).emit('match-found', {
                gameId,
                playerColor: playerColor1,
                player: player1.player,
                opponent: player2.player,
            });

            console.log('Emitting match-found to player2:', player2.socketId);
            io.to(player2.socketId).emit('match-found', {
                gameId,
                playerColor: playerColor2,
                player: player2.player,
                opponent: player1.player,
            });

            console.log('Match found:', { gameId, player1: player1.socketId, player2: player2.socketId });
        } else {
            console.log('Waiting for another player to join the queue...');
        }
    });

    socket.on('cancel-search', () => {
        console.log('cancel-search event received from:', socket.id);
        const index = matchmakingQueue.findIndex(p => p.socketId === socket.id);
        if (index !== -1) {
            matchmakingQueue.splice(index, 1);
            console.log('Player removed from queue:', socket.id);
            console.log('Current matchmaking queue:', matchmakingQueue.map(p => p.socketId));
        }
    });

    socket.on('move-made', ({ gameId, from, to }) => {
        console.log('move-made event received:', { gameId, from, to });
        const game = activeGames.get(gameId);
        if (!game) return;

        const opponentSocketId = game.player1.socketId === socket.id ? game.player2.socketId : game.player1.socketId;
        io.to(opponentSocketId).emit('move-made', { from, to });
    });

    socket.on('game-over', ({ gameId }) => {
        console.log('game-over event received:', { gameId });
        const game = activeGames.get(gameId);
        if (!game) return;

        const result = {
            type: 'win',
            winner: game.player1.socketId === socket.id ? game.player1.player : game.player2.player,
            eloChange: 10,
        };

        io.to(game.player1.socketId).emit('game-over', result);
        io.to(game.player2.socketId).emit('game-over', result);

        activeGames.delete(gameId);
        console.log('Game ended and removed:', gameId);
    });

    socket.on('chat-message', ({ gameId, message }) => {
        console.log('chat-message event received:', { gameId, message });
        const game = activeGames.get(gameId);
        if (!game) return;

        io.to(game.player1.socketId).emit('chat-message', message);
        io.to(game.player2.socketId).emit('chat-message', message);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected:', socket.id);

        // Clean up Chess Challenges
        for (const [roomId, room] of challengeRooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                io.to(roomId).emit('roomUpdate', {
                    players: room.players,
                    puzzle: room.puzzle,
                    winner: room.winner,
                });
                console.log('Player disconnected from room:', { roomId, remainingPlayers: room.players });

                if (room.players.length === 0) {
                    challengeRooms.delete(roomId);
                    console.log('Room deleted due to no players:', roomId);
                }
            }
        }

        // Clean up Live Chess Battles (matchmaking queue)
        const queueIndex = matchmakingQueue.findIndex(p => p.socketId === socket.id);
        if (queueIndex !== -1) {
            matchmakingQueue.splice(queueIndex, 1);
            console.log('Player removed from matchmaking queue:', socket.id);
        }

        // Clean up Live Chess Battles (active games)
        for (const [gameId, game] of activeGames.entries()) {
            if (game.player1.socketId === socket.id || game.player2.socketId === socket.id) {
                const opponentSocketId = game.player1.socketId === socket.id ? game.player2.socketId : game.player1.socketId;
                io.to(opponentSocketId).emit('game-over', {
                    type: 'opponent-disconnected',
                    winner: game.player1.socketId === socket.id ? game.player2.player : game.player1.player,
                    eloChange: 10,
                });
                activeGames.delete(gameId);
                console.log('Game ended due to disconnection:', gameId);
            }
        }
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});