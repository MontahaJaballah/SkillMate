import React, { useState, useEffect } from 'react';
import './rubik2d.css';

const Rubik2D = React.forwardRef(({ onMove, onComplete, onReset }, ref) => {
    // Initial solved state of the cube
    const initialState = [
        Array(9).fill('white'),   // top
        Array(9).fill('yellow'),  // bottom
        Array(9).fill('red'),     // right
        Array(9).fill('orange'),  // left
        Array(9).fill('blue'),    // front
        Array(9).fill('green')    // back
    ];

    const [cube, setCube] = useState(initialState);
    const [isScrambled, setIsScrambled] = useState(false);
    const [moveHistory, setMoveHistory] = useState([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Only handle shortcuts if cube is scrambled
            if (!isScrambled) return;

            // Prevent shortcuts when user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const keyMoves = {
                u: 'U',  // u for Up face
                d: 'D',  // d for Down face
                r: 'R',  // r for Right face
                l: 'L',  // l for Left face
                f: 'F',  // f for Front face
                b: 'B',  // b for Back face
            };

            // Handle move keys
            if (keyMoves[e.key.toLowerCase()]) {
                makeMove(keyMoves[e.key.toLowerCase()]);
                return;
            }

            // Handle undo/redo
            if (e.ctrlKey || e.metaKey) { // Ctrl on Windows/Linux, Cmd on Mac
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        redoMove();
                    } else {
                        undoMove();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isScrambled, currentHistoryIndex, moveHistory]); // Dependencies for the effect

    // Check if the cube is solved
    const checkIfSolved = (currentCube) => {
        return currentCube.every((face, index) => {
            const centerColor = face[4]; // Center piece color
            return face.every(color => color === centerColor);
        });
    };

    // Check if the cube state is valid (each color appears exactly 9 times)
    const isValidCubeState = (currentCube) => {
        const colorCount = {
            white: 0, yellow: 0, red: 0,
            orange: 0, blue: 0, green: 0
        };

        currentCube.forEach(face => {
            face.forEach(color => {
                colorCount[color]++;
            });
        });

        return Object.values(colorCount).every(count => count === 9);
    };


    // Function to rotate a face clockwise
    const rotateFace = (faceIndex, move) => {
        const newCube = cube.map(face => [...face]);
        const face = newCube[faceIndex];
        
        // Rotate the face clockwise
        newCube[faceIndex] = [
            face[6], face[3], face[0],
            face[7], face[4], face[1],
            face[8], face[5], face[2]
        ];

        // Get and update adjacent faces
        const adjacent = getAdjacentFaces(move);
        if (adjacent) {
            const temp = [...newCube[adjacent.affected[0].face].slice(adjacent.affected[0].indices[0], adjacent.affected[0].indices[2] + 1)];
            
            // Rotate adjacent faces
            for (let i = 0; i < adjacent.affected.length - 1; i++) {
                const current = adjacent.affected[i];
                const next = adjacent.affected[i + 1];
                for (let j = 0; j < 3; j++) {
                    newCube[current.face][current.indices[j]] = newCube[next.face][next.indices[j]];
                }
            }
            
            // Complete the cycle
            const last = adjacent.affected[adjacent.affected.length - 1];
            for (let j = 0; j < 3; j++) {
                newCube[last.face][last.indices[j]] = temp[j];
            }
        }

        setCube(newCube);
        addMoveToHistory(move, newCube);
        if (onMove) onMove();

        // Check if cube is solved after the move
        if (isScrambled && checkIfSolved(newCube)) {
            setIsScrambled(false);
            if (onComplete) onComplete();
        }
    };

    // Function to get adjacent faces for a move
    const getAdjacentFaces = (move) => {
        switch (move) {
            case 'U': // Top face
                return {
                    face: 0,
                    affected: [
                        { face: 4, indices: [0, 1, 2] }, // Front
                        { face: 2, indices: [0, 1, 2] }, // Right
                        { face: 5, indices: [0, 1, 2] }, // Back
                        { face: 3, indices: [0, 1, 2] }  // Left
                    ]
                };
            case 'D': // Bottom face
                return {
                    face: 1,
                    affected: [
                        { face: 4, indices: [6, 7, 8] }, // Front
                        { face: 2, indices: [6, 7, 8] }, // Right
                        { face: 5, indices: [6, 7, 8] }, // Back
                        { face: 3, indices: [6, 7, 8] }  // Left
                    ]
                };
            case 'R': // Right face
                return {
                    face: 2,
                    affected: [
                        { face: 4, indices: [2, 5, 8] }, // Front
                        { face: 0, indices: [2, 5, 8] }, // Top
                        { face: 5, indices: [0, 3, 6] }, // Back
                        { face: 1, indices: [2, 5, 8] }  // Bottom
                    ]
                };
            case 'L': // Left face
                return {
                    face: 3,
                    affected: [
                        { face: 4, indices: [0, 3, 6] }, // Front
                        { face: 1, indices: [0, 3, 6] }, // Bottom
                        { face: 5, indices: [2, 5, 8] }, // Back
                        { face: 0, indices: [0, 3, 6] }  // Top
                    ]
                };
            case 'F': // Front face
                return {
                    face: 4,
                    affected: [
                        { face: 0, indices: [6, 7, 8] }, // Top
                        { face: 2, indices: [0, 3, 6] }, // Right
                        { face: 1, indices: [0, 1, 2] }, // Bottom
                        { face: 3, indices: [2, 5, 8] }  // Left
                    ]
                };
            case 'B': // Back face
                return {
                    face: 5,
                    affected: [
                        { face: 0, indices: [0, 1, 2] }, // Top
                        { face: 3, indices: [0, 3, 6] }, // Left
                        { face: 1, indices: [6, 7, 8] }, // Bottom
                        { face: 2, indices: [2, 5, 8] }  // Right
                    ]
                };
            default:
                return null;
        }
    };

    // Add move to history
    const addMoveToHistory = (move, newCube) => {
        const newHistory = moveHistory.slice(0, currentHistoryIndex + 1);
        newHistory.push({ move, cubeState: JSON.parse(JSON.stringify(newCube)) });
        setMoveHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
    };

    // Undo last move
    const undoMove = () => {
        if (currentHistoryIndex >= 0) {
            const prevState = moveHistory[currentHistoryIndex - 1];
            if (prevState) {
                setCube(prevState.cubeState);
                setCurrentHistoryIndex(currentHistoryIndex - 1);
                if (onMove) onMove();
            } else {
                setCube(initialState);
                setCurrentHistoryIndex(-1);
                if (onMove) onMove();
            }
        }
    };

    // Redo previously undone move
    const redoMove = () => {
        if (currentHistoryIndex + 1 < moveHistory.length) {
            const nextState = moveHistory[currentHistoryIndex + 1];
            setCube(nextState.cubeState);
            setCurrentHistoryIndex(currentHistoryIndex + 1);
            if (onMove) onMove();
        }
    };

    // Function to make a move
    const makeMove = (move) => {
        const adjacent = getAdjacentFaces(move);
        if (!adjacent) return;

        // Rotate the main face
        rotateFace(adjacent.face, move);
    };

    // Render a single face of the cube
    const renderFace = (faceIndex, position) => {
        return (
            <div className={`cube-face ${position}`}>
                {cube[faceIndex].map((color, i) => (
                    <div
                        key={i}
                        className="cube-piece"
                        style={{ backgroundColor: color }}
                        onClick={() => rotateFace(faceIndex)}
                    />
                ))}
            </div>
        );
    };

    // Function to scramble the cube
    const scramble = () => {
        setIsScrambled(true);
        const moves = ['U', 'D', 'R', 'L', 'F', 'B'];
        const numMoves = 20;
        
        // Clear history when scrambling
        setMoveHistory([]);
        setCurrentHistoryIndex(-1);
        
        // Generate and apply scramble moves
        for (let i = 0; i < numMoves; i++) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            makeMove(move);
        }
    };

    // Function to reset and scramble the cube
    const resetAndScramble = () => {
        setCube(initialState);
        setMoveHistory([]);
        setCurrentHistoryIndex(-1);
        setTimeout(() => {
            scramble();
        }, 100); // Small delay to ensure state is reset
    };

    // Expose the resetAndScramble function via ref
    React.useImperativeHandle(ref, () => ({
        resetAndScramble
    }));

    return (
        <div className="rubik-2d">
            <div className="cube-container">
                {/* Top face */}
                {renderFace(0, 'top')}
                
                {/* Middle row */}
                <div className="middle-row">
                    {renderFace(3, 'left')}   {/* Left */}
                    {renderFace(4, 'front')}  {/* Front */}
                    {renderFace(2, 'right')}  {/* Right */}
                    {renderFace(5, 'back')}   {/* Back */}
                </div>
                
                {/* Bottom face */}
                {renderFace(1, 'bottom')}
            </div>

            <div className="controls-container">
                <div className="move-buttons">
                    <button onClick={() => makeMove('U')}>U</button>
                    <button onClick={() => makeMove('D')}>D</button>
                    <button onClick={() => makeMove('R')}>R</button>
                    <button onClick={() => makeMove('L')}>L</button>
                    <button onClick={() => makeMove('F')}>F</button>
                    <button onClick={() => makeMove('B')}>B</button>
                    <button 
                        onClick={scramble} 
                        className={`scramble ${isScrambled ? 'active' : ''}`}
                        disabled={isScrambled}
                    >
                        {isScrambled ? 'Scrambled' : 'Scramble'}
                    </button>
                </div>

                <div className="history-controls">
                    <button 
                        onClick={undoMove} 
                        disabled={currentHistoryIndex < 0}
                        className="history-button"
                        title="Undo last move (Ctrl+Z)"
                    >
                        ↩ Undo
                    </button>
                    <div className="move-count">
                        {currentHistoryIndex + 1} / {moveHistory.length} moves
                    </div>
                    <button 
                        onClick={redoMove} 
                        disabled={currentHistoryIndex + 1 >= moveHistory.length}
                        className="history-button"
                        title="Redo last undone move (Ctrl+Shift+Z)"
                    >
                        Redo ↪
                    </button>
                </div>

                <div className="keyboard-shortcuts">
                    <h4>Keyboard Shortcuts</h4>
                    <div className="shortcuts-grid">
                        <div className="shortcut">
                            <kbd>U</kbd> <span>Up face</span>
                        </div>
                        <div className="shortcut">
                            <kbd>D</kbd> <span>Down face</span>
                        </div>
                        <div className="shortcut">
                            <kbd>L</kbd> <span>Left face</span>
                        </div>
                        <div className="shortcut">
                            <kbd>R</kbd> <span>Right face</span>
                        </div>
                        <div className="shortcut">
                            <kbd>F</kbd> <span>Front face</span>
                        </div>
                        <div className="shortcut">
                            <kbd>B</kbd> <span>Back face</span>
                        </div>
                        <div className="shortcut">
                            <kbd>Ctrl</kbd>+<kbd>Z</kbd> <span>Undo</span>
                        </div>
                        <div className="shortcut">
                            <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> <span>Redo</span>
                        </div>
                    </div>
                </div>

                {moveHistory.length > 0 && (
                    <div className="move-history">
                        <h3>Move History</h3>
                        <div className="history-list">
                            {moveHistory.map((historyItem, index) => (
                                <span 
                                    key={index}
                                    className={`history-item ${index === currentHistoryIndex ? 'current' : ''} ${index > currentHistoryIndex ? 'future' : ''}`}
                                >
                                    {historyItem.move}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {isScrambled && checkIfSolved(cube) && (
                <div className="solved-message">
                    Congratulations! You solved the cube!
                </div>
            )}
        </div>
    );
}); // Close forwardRef

export default Rubik2D;
