import React, { useState, useEffect, useRef } from 'react';
import * as mm from '@magenta/music';

const MusicGenerator = () => {
    const [model, setModel] = useState(null);
    const [sequence, setSequence] = useState(null);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        style: 'classique',
        level: 'débutant',
        duration: 4
    });
    const playerRef = useRef(null);

    // Chargement du modèle
    useEffect(() => {
        const loadModel = async () => {
            try {
                setLoading(true);
                const musicVAE = new mm.MusicVAE(
                    'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small'
                );
                await musicVAE.initialize();
                setModel(musicVAE);

                // Initialiser le player
                playerRef.current = new mm.Player();
            } catch (error) {
                console.error("Erreur:", error);
            } finally {
                setLoading(false);
            }
        };

        loadModel();
    }, []);

    // Génération adaptée
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
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    // Jouer la musique
    const playMusic = () => {
        if (!sequence || !playerRef.current) return;

        playerRef.current.stop();
        playerRef.current.start(sequence).catch(err => {
            console.error("Erreur audio:", err);
        });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Générateur Musical</h2>

            <div style={{ marginBottom: '20px' }}>
                <select
                    value={settings.level}
                    onChange={e => setSettings({ ...settings, level: e.target.value })}
                    style={{ marginRight: '10px' }}
                >
                    <option value="débutant">Débutant</option>
                    <option value="intermédiaire">Intermédiaire</option>
                    <option value="avancé">Avancé</option>
                </select>

                <select
                    value={settings.style}
                    onChange={e => setSettings({ ...settings, style: e.target.value })}
                    style={{ marginRight: '10px' }}
                >
                    <option value="classique">Classique</option>
                    <option value="jazz">Jazz</option>
                    <option value="pop">Pop</option>
                </select>

                <button
                    onClick={generateMusic}
                    disabled={loading}
                    style={{ padding: '8px 16px' }}
                >
                    {loading ? 'Génération...' : 'Générer'}
                </button>
            </div>

            {sequence && (
                <div>
                    <button
                        onClick={playMusic}
                        style={{ marginBottom: '20px', padding: '8px 16px' }}
                    >
                        Jouer la Mélodie
                    </button>

                    <div style={{ marginBottom: '20px' }}>
                        <h3>Analyse</h3>
                        <p>Style: {settings.style}</p>
                        <p>Niveau: {settings.level}</p>
                        <p>Tempo: {sequence.tempo || 120} BPM</p>
                    </div>

                    <div>
                        <h4>Notes générées:</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {sequence.notes.map((note, i) => (
                                <li key={i} style={{ marginBottom: '5px' }}>
                                    {midiToNoteName(note.pitch)} -
                                    Début: {note.startTime.toFixed(2)}s -
                                    Durée: {(note.endTime - note.startTime).toFixed(2)}s
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

// Fonctions utilitaires
function midiToNoteName(midi) {
    const notes = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
    return notes[midi % 12] + Math.floor(midi / 12 - 1);
}

function getDifficultySettings(level) {
    switch (level) {
        case 'débutant': return { temperature: 0.5 };
        case 'intermédiaire': return { temperature: 0.8 };
        case 'avancé': return { temperature: 1.2 };
        default: return { temperature: 0.7 };
    }
}

function adaptSequence(seq, settings) {
    // Simplification pour débutants
    if (settings.level === 'débutant') {
        return {
            ...seq,
            notes: seq.notes.filter((_, i) => i % 2 === 0) // Moins de notes
                .map(note => ({
                    ...note,
                    startTime: Math.round(note.startTime * 4) / 4, // Rythme simplifié
                    endTime: note.startTime + 0.5 // Durée régulière
                }))
        };
    }
    return seq;
}

export default MusicGenerator;