const Composition = require('../models/Composition');

exports.saveComposition = async (req, res) => {
    try {
        const { sequence, settings, userId } = req.body;

        const newComposition = new Composition({
            user: userId,
            sequence,
            settings,
            analysis: {
                notes: sequence.notes.map(n => ({
                    name: midiToNoteName(n.pitch),
                    duration: n.endTime - n.startTime
                })),
                range: calculateRange(sequence.notes)
            }
        });

        await newComposition.save();
        res.status(201).json(newComposition);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

function calculateRange(notes) {
    const pitches = notes.map(n => n.pitch);
    return {
        lowest: Math.min(...pitches),
        highest: Math.max(...pitches)
    };
}

function midiToNoteName(midi) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notes[midi % 12] + Math.floor(midi / 12 - 1);
}