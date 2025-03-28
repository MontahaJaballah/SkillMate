import React, { useState, useEffect, useRef } from 'react';
import * as mm from '@magenta/music';

const MusicGenerator = () => {
    const [model, setModel] = useState(null);
    const [sequence, setSequence] = useState(null);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        style: 'classical',
        level: 'beginner',
        duration: 4
    });
    const playerRef = useRef(null);

    // Load model
    useEffect(() => {
        const loadModel = async () => {
            try {
                setLoading(true);
                const musicVAE = new mm.MusicVAE(
                    'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small'
                );
                await musicVAE.initialize();
                setModel(musicVAE);

                // Initialize player
                playerRef.current = new mm.Player();
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadModel();
    }, []);

    // Generate music
    const generateMusic = async () => {
        if (!model) return;

        setLoading(true);
        try {
            const { temperature } = getDifficultySettings(settings.level);
            const sequences = await model.sample(1, temperature);

            if (sequences && sequences[0]) {
                const adaptedSeq = adaptSequence(sequences[0], settings);
                setSequence(adaptedSeq);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Play music
    const playMusic = () => {
        if (!sequence || !playerRef.current) return;

        playerRef.current.stop();
        playerRef.current.start(sequence).catch(err => {
            console.error("Audio error:", err);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 p-6">
            <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-200">
                <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    AI Music Generator
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <select
                        value={settings.level}
                        onChange={e => setSettings({ ...settings, level: e.target.value })}
                        className="flex-1 p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>

                    <select
                        value={settings.style}
                        onChange={e => setSettings({ ...settings, style: e.target.value })}
                        className="flex-1 p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="classical">Classical</option>
                        <option value="jazz">Jazz</option>
                        <option value="pop">Pop</option>
                    </select>

                    <button
                        onClick={generateMusic}
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg font-medium ${loading
                                ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </span>
                        ) : 'Generate Music'}
                    </button>
                </div>

                {sequence && (
                    <div className="space-y-6">
                        <button
                            onClick={playMusic}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium shadow-md"
                        >
                            Play Melody
                        </button>

                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                            <h3 className="text-xl font-semibold mb-3 text-purple-700">Analysis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-purple-600">
                                <div>
                                    <span className="font-medium">Style:</span> {settings.style}
                                </div>
                                <div>
                                    <span className="font-medium">Level:</span> {settings.level}
                                </div>
                                <div>
                                    <span className="font-medium">Tempo:</span> {sequence.tempo || 120} BPM
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                            <h4 className="text-lg font-semibold mb-3 text-purple-700">Generated Notes:</h4>
                            <ul className="space-y-2">
                                {sequence.notes.map((note, i) => (
                                    <li key={i} className="p-2 bg-purple-50 rounded-md">
                                        <span className="font-medium text-purple-600">{midiToNoteName(note.pitch)}</span> -
                                        Start: <span className="text-purple-500">{note.startTime.toFixed(2)}s</span> -
                                        Duration: <span className="text-purple-500">{(note.endTime - note.startTime).toFixed(2)}s</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Utility functions
function midiToNoteName(midi) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notes[midi % 12] + Math.floor(midi / 12 - 1);
}

function getDifficultySettings(level) {
    switch (level) {
        case 'beginner': return { temperature: 0.5 };
        case 'intermediate': return { temperature: 0.8 };
        case 'advanced': return { temperature: 1.2 };
        default: return { temperature: 0.7 };
    }
}

function adaptSequence(seq, settings) {
    // Simplification for beginners
    if (settings.level === 'beginner') {
        return {
            ...seq,
            notes: seq.notes.filter((_, i) => i % 2 === 0) // Fewer notes
                .map(note => ({
                    ...note,
                    startTime: Math.round(note.startTime * 4) / 4, // Simplified rhythm
                    endTime: note.startTime + 0.5 // Regular duration
                }))
        };
    }
    return seq;
}

export default MusicGenerator;