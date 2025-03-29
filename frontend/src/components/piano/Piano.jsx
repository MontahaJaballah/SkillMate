// src/components/piano/Piano.jsx
import React, { useState, useEffect } from 'react';
import { pianoController } from '../../../../backend/controllers/pianoController';
import './Piano.css';

// Dans Piano.jsx
const notes = [
    // Octave 0 (A0 à B0) - Notes graves extrêmes
    { name: 'A0', frequency: 27.50, type: 'white', key: 'z' },
    { name: 'A#0', frequency: 29.14, type: 'black', key: 's' },
    { name: 'B0', frequency: 30.87, type: 'white', key: 'x' },

    // Octave 1 (C1 à B1)
    { name: 'C1', frequency: 32.70, type: 'white', key: 'c' },
    { name: 'C#1', frequency: 34.65, type: 'black', key: 'f' },
    { name: 'D1', frequency: 36.71, type: 'white', key: 'v' },
    { name: 'D#1', frequency: 38.89, type: 'black', key: 'g' },
    { name: 'E1', frequency: 41.20, type: 'white', key: 'b' },
    { name: 'F1', frequency: 43.65, type: 'white', key: 'n' },
    { name: 'F#1', frequency: 46.25, type: 'black', key: 'j' },
    { name: 'G1', frequency: 49.00, type: 'white', key: 'm' },
    { name: 'G#1', frequency: 51.91, type: 'black', key: 'k' },
    { name: 'A1', frequency: 55.00, type: 'white', key: ',' },
    { name: 'A#1', frequency: 58.27, type: 'black', key: 'l' },
    { name: 'B1', frequency: 61.74, type: 'white', key: '.' },

    // Octave 2 (C2 à B2)
    { name: 'C2', frequency: 65.41, type: 'white', key: 'q' },
    { name: 'C#2', frequency: 69.30, type: 'black', key: '2' },
    { name: 'D2', frequency: 73.42, type: 'white', key: 'w' },
    { name: 'D#2', frequency: 77.78, type: 'black', key: '3' },
    { name: 'E2', frequency: 82.41, type: 'white', key: 'e' },
    { name: 'F2', frequency: 87.31, type: 'white', key: 'r' },
    { name: 'F#2', frequency: 92.50, type: 'black', key: '5' },
    { name: 'G2', frequency: 98.00, type: 'white', key: 't' },
    { name: 'G#2', frequency: 103.83, type: 'black', key: '6' },
    { name: 'A2', frequency: 110.00, type: 'white', key: 'y' },
    { name: 'A#2', frequency: 116.54, type: 'black', key: '7' },
    { name: 'B2', frequency: 123.47, type: 'white', key: 'u' },

    // Octave 3 (C3 à B3) - Début du clavier principal
    { name: 'C3', frequency: 130.81, type: 'white', key: 'a' },
    { name: 'C#3', frequency: 138.59, type: 'black', key: 'w' },
    { name: 'D3', frequency: 146.83, type: 'white', key: 's' },
    { name: 'D#3', frequency: 155.56, type: 'black', key: 'e' },
    { name: 'E3', frequency: 164.81, type: 'white', key: 'd' },
    { name: 'F3', frequency: 174.61, type: 'white', key: 'f' },
    { name: 'F#3', frequency: 185.00, type: 'black', key: 't' },
    { name: 'G3', frequency: 196.00, type: 'white', key: 'g' },
    { name: 'G#3', frequency: 207.65, type: 'black', key: 'y' },
    { name: 'A3', frequency: 220.00, type: 'white', key: 'h' },
    { name: 'A#3', frequency: 233.08, type: 'black', key: 'u' },
    { name: 'B3', frequency: 246.94, type: 'white', key: 'j' },

    // Octave 4 (C4 à B4) - "La 440Hz" ici (A4)
    { name: 'C4', frequency: 261.63, type: 'white', key: 'k' },
    { name: 'C#4', frequency: 277.18, type: 'black', key: 'o' },
    { name: 'D4', frequency: 293.66, type: 'white', key: 'l' },
    { name: 'D#4', frequency: 311.13, type: 'black', key: 'p' },
    { name: 'E4', frequency: 329.63, type: 'white', key: ';' },
    { name: 'F4', frequency: 349.23, type: 'white', key: "'" },
    { name: 'F#4', frequency: 369.99, type: 'black', key: '[' },
    { name: 'G4', frequency: 392.00, type: 'white', key: 'Enter' },
    { name: 'G#4', frequency: 415.30, type: 'black', key: ']' },
    { name: 'A4', frequency: 440.00, type: 'white', key: '' }, // La 440Hz
    { name: 'A#4', frequency: 466.16, type: 'black', key: '' },
    { name: 'B4', frequency: 493.88, type: 'white', key: '' },

    // Octave 5 (C5 à B5)
    { name: 'C5', frequency: 523.25, type: 'white', key: 'm' },
    { name: 'C#5', frequency: 554.37, type: 'black', key: ',' },
    { name: 'D5', frequency: 587.33, type: 'white', key: '.' },
    { name: 'D#5', frequency: 622.25, type: 'black', key: '/' },
    { name: 'E5', frequency: 659.25, type: 'white', key: '' },
    { name: 'F5', frequency: 698.46, type: 'white', key: '' },
    { name: 'F#5', frequency: 739.99, type: 'black', key: '' },
    { name: 'G5', frequency: 783.99, type: 'white', key: '' },
    { name: 'G#5', frequency: 830.61, type: 'black', key: '' },
    { name: 'A5', frequency: 880.00, type: 'white', key: '' },
    { name: 'A#5', frequency: 932.33, type: 'black', key: '' },
    { name: 'B5', frequency: 987.77, type: 'white', key: '' },

    // Octave 6 (C6 à B6)
    { name: 'C6', frequency: 1046.50, type: 'white', key: '' },
    { name: 'C#6', frequency: 1108.73, type: 'black', key: '' },
    { name: 'D6', frequency: 1174.66, type: 'white', key: '' },
    { name: 'D#6', frequency: 1244.51, type: 'black', key: '' },
    { name: 'E6', frequency: 1318.51, type: 'white', key: '' },
    { name: 'F6', frequency: 1396.91, type: 'white', key: '' },
    { name: 'F#6', frequency: 1479.98, type: 'black', key: '' },
    { name: 'G6', frequency: 1567.98, type: 'white', key: '' },
    { name: 'G#6', frequency: 1661.22, type: 'black', key: '' },
    { name: 'A6', frequency: 1760.00, type: 'white', key: '' },
    { name: 'A#6', frequency: 1864.66, type: 'black', key: '' },
    { name: 'B6', frequency: 1975.53, type: 'white', key: '' },

    // Octave 7 (C7 à C8) - Notes aiguës extrêmes
    { name: 'C7', frequency: 2093.00, type: 'white', key: '' },
    { name: 'C#7', frequency: 2217.46, type: 'black', key: '' },
    { name: 'D7', frequency: 2349.32, type: 'white', key: '' },
    { name: 'D#7', frequency: 2489.02, type: 'black', key: '' },
    { name: 'E7', frequency: 2637.02, type: 'white', key: '' },
    { name: 'F7', frequency: 2793.83, type: 'white', key: '' },
    { name: 'F#7', frequency: 2959.96, type: 'black', key: '' },
    { name: 'G7', frequency: 3135.96, type: 'white', key: '' },
    { name: 'G#7', frequency: 3322.44, type: 'black', key: '' },
    { name: 'A7', frequency: 3520.00, type: 'white', key: '' },
    { name: 'A#7', frequency: 3729.31, type: 'black', key: '' },
    { name: 'B7', frequency: 3951.07, type: 'white', key: '' },
    { name: 'C8', frequency: 4186.01, type: 'white', key: '' } // Note la plus aiguë
];

const Piano = () => {
    const [activeNotes, setActiveNotes] = useState({});

    const handleKeyDown = (note) => {
        if (!activeNotes[note.name]) {
            const noteId = pianoController.playNote(note.frequency);
            setActiveNotes(prev => ({ ...prev, [note.name]: noteId }));
        }
    };

    const handleKeyUp = (note) => {
        if (activeNotes[note.name]) {
            pianoController.stopNote(activeNotes[note.name]);
            setActiveNotes(prev => {
                const newActive = { ...prev };
                delete newActive[note.name];
                return newActive;
            });
        }
    };

    return (
        <div className="piano-container">
            <h1>Piano Avancé 🎹</h1>
            <div className="piano">
                {notes.map((note) => (
                    <button
                        key={note.name}
                        className={`piano-key ${note.type} ${activeNotes[note.name] ? 'active' : ''}`}
                        onMouseDown={() => {
                            pianoController.playNote(note.frequency);
                            setActiveNotes((prev) => ({ ...prev, [note.name]: true }));
                        }}
                        onMouseUp={() => {
                            setActiveNotes((prev) => {
                                const newActive = { ...prev };
                                delete newActive[note.name];
                                return newActive;
                            });
                        }}
                        onMouseLeave={() => {
                            if (activeNotes[note.name]) {
                                setActiveNotes((prev) => {
                                    const newActive = { ...prev };
                                    delete newActive[note.name];
                                    return newActive;
                                });
                            }
                        }}
                    >
                        {note.type === 'white' && (
                            <span className="note-label">{note.name}</span>
                        )}
                    </button>
                ))}
            </div>
            <div className="piano-display">
                Notes jouées : {Object.keys(activeNotes).join(', ')}
            </div>
        </div>
    );
};


export default Piano;