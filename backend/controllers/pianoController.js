export class PianoController {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 8192;
        this.frequencyData = new Float32Array(this.analyser.frequencyBinCount);
        this.oscillators = {};
        this.audioBuffer = null;
        this.playingSequence = false;
    }

    async loadAudioFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        return this.analyzeAudio();
    }

    analyzeAudio() {
        return new Promise((resolve) => {
            const analyser = this.audioContext.createAnalyser();
            analyser.fftSize = 8192;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Float32Array(bufferLength);
            const timeDomainArray = new Float32Array(bufferLength);

            const source = this.audioContext.createBufferSource();
            source.buffer = this.audioBuffer;
            source.connect(analyser);
            analyser.connect(this.audioContext.destination);

            const detectedNotes = [];
            let lastAnalysisTime = 0;
            const analysisInterval = 0.05;

            const frequencyToNote = (freq) => {
                if (freq < 27.5 || freq > 4186) return null;

                const A4 = 440;
                const semitoneRatio = Math.pow(2, 1 / 12);
                const semitonesFromA4 = Math.round(12 * Math.log2(freq / A4));

                const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
                const noteIndex = (semitonesFromA4 % 12 + 12) % 12;
                const octave = 4 + Math.floor(semitonesFromA4 / 12);

                const cents = 1200 * Math.log2(freq / (A4 * Math.pow(semitoneRatio, semitonesFromA4)));
                if (Math.abs(cents) > 50) return null;

                return {
                    name: `${notes[noteIndex]}${octave}`,
                    frequency: freq,
                    cents: Math.round(cents)
                };
            };

            const getFundamentalFrequencies = () => {
                analyser.getFloatFrequencyData(dataArray);
                const peaks = [];
                const threshold = -50;
                const peakDistance = 5;

                for (let i = 3; i < bufferLength - 3; i++) {
                    if (dataArray[i] > threshold &&
                        dataArray[i] > dataArray[i - 1] &&
                        dataArray[i] > dataArray[i + 1]) {
                        peaks.push({
                            index: i,
                            value: dataArray[i]
                        });
                    }
                }

                peaks.sort((a, b) => b.value - a.value);
                return peaks.slice(0, 6).map(peak =>
                    peak.index * this.audioContext.sampleRate / analyser.fftSize
                );
            };

            const isSoundActive = () => {
                analyser.getFloatTimeDomainData(timeDomainArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += Math.abs(timeDomainArray[i]);
                }
                return sum / bufferLength > 0.01;
            };

            let currentNotes = [];
            let noteStartTime = 0;

            const processAudio = () => {
                const now = this.audioContext.currentTime;

                if (now - lastAnalysisTime >= analysisInterval) {
                    lastAnalysisTime = now;
                    const active = isSoundActive();

                    if (active) {
                        const frequencies = getFundamentalFrequencies();
                        const newNotes = frequencies
                            .map(frequencyToNote)
                            .filter(Boolean);

                        if (JSON.stringify(newNotes) !== JSON.stringify(currentNotes)) {
                            if (currentNotes.length > 0) {
                                currentNotes.forEach(note => {
                                    detectedNotes.push({
                                        ...note,
                                        time: noteStartTime,
                                        duration: now - noteStartTime
                                    });
                                });
                            }
                            currentNotes = newNotes;
                            noteStartTime = now;
                        }
                    } else if (currentNotes.length > 0) {
                        currentNotes.forEach(note => {
                            detectedNotes.push({
                                ...note,
                                time: noteStartTime,
                                duration: now - noteStartTime
                            });
                        });
                        currentNotes = [];
                    }
                }

                if (now < source.buffer.duration) {
                    requestAnimationFrame(processAudio);
                } else {
                    if (currentNotes.length > 0) {
                        currentNotes.forEach(note => {
                            detectedNotes.push({
                                ...note,
                                time: noteStartTime,
                                duration: now - noteStartTime
                            });
                        });
                    }
                    source.disconnect();
                    resolve(detectedNotes);
                }
            };

            source.start();
            processAudio();
        });
    }

    playNote(frequency, duration = 0.5) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.start();
        oscillator.stop(now + duration + 0.1);

        const noteId = `${frequency}-${Date.now()}`;
        this.oscillators[noteId] = { oscillator, gainNode };
        return noteId;
    }

    stopNote(noteId) {
        if (this.oscillators[noteId]) {
            this.oscillators[noteId].oscillator.stop();
            delete this.oscillators[noteId];
        }
    }

    playSequence(notes, onNotePlay, callback) {
        this.playingSequence = true;
        const currentTime = this.audioContext.currentTime;

        notes.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'triangle';
            osc.frequency.value = note.frequency;
            gain.gain.value = 0;

            gain.gain.setValueAtTime(0, currentTime + note.time);
            gain.gain.linearRampToValueAtTime(0.3, currentTime + note.time + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, currentTime + note.time + note.duration);

            osc.connect(gain);
            gain.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            osc.start(currentTime + note.time);
            osc.stop(currentTime + note.time + note.duration + 0.1);

            setTimeout(() => {
                if (this.playingSequence) {
                    onNotePlay?.([note.frequency]);
                }
            }, note.time * 1000);
        });

        setTimeout(() => {
            callback?.();
            this.playingSequence = false;
        }, Math.max(...notes.map(n => n.time + n.duration)) * 1000);
    }

    stopSequence() {
        this.playingSequence = false;
        Object.values(this.oscillators).forEach(({ oscillator }) => {
            oscillator.stop();
        });
        this.oscillators = {};
    }
}

export const pianoController = new PianoController();