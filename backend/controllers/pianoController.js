// src/controllers/pianoController.js
export class PianoController {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.oscillators = {}; // Pour gérer les notes en cours
    }

    // Jouer une note (fréquence en Hz)
    playNote(frequency, duration = 0.5) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine'; // sine, square, sawtooth
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);
        oscillator.stop(this.audioContext.currentTime + duration);

        // Stocker pour arrêter plus tard si besoin
        const noteId = `${frequency}-${Date.now()}`;
        this.oscillators[noteId] = { oscillator, gainNode };
        return noteId;
    }

    // Arrêter une note
    stopNote(noteId) {
        if (this.oscillators[noteId]) {
            this.oscillators[noteId].oscillator.stop();
            delete this.oscillators[noteId];
        }
    }
}

// Exportez une instance unique
export const pianoController = new PianoController();