// Conversion MIDI vers nom de note
export const midiToNoteName = (midi) => {
    const notes = ['Do', 'Do#', 'Ré', 'Ré#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
    const octave = Math.floor(midi / 12) - 1;
    return notes[midi % 12] + octave;
};

// Paramètres selon le niveau
export const getDifficultySettings = (level) => {
    switch (level) {
        case 'débutant':
            return { temperature: 0.5, complexity: 3 };
        case 'intermédiaire':
            return { temperature: 0.8, complexity: 2 };
        case 'avancé':
            return { temperature: 1.2, complexity: 1 };
        default:
            return { temperature: 0.7, complexity: 2 };
    }
};

// Styles musicaux (à compléter)
export const getStyleParameters = (style) => {
    const styles = {
        classique: { chords: [], rhythm: 'regular' },
        jazz: { chords: ['7', 'm7'], rhythm: 'swing' },
        pop: { chords: [], rhythm: 'simple' },
        blues: { chords: ['7'], rhythm: 'shuffle' }
    };
    return styles[style] || styles.classique;
};