export class PianoController {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.oscillators = {};
        this.audioBuffer = null;
        this.playingSequence = false;
        this.currentSequence = [];
    }

    async loadAudioFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        return this.analyzeAudio();
    }

    analyzeAudio() {
        return new Promise((resolve) => {
            const analyser = this.audioContext.createAnalyser();
            analyser.fftSize = 4096;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Float32Array(bufferLength);
            const timeDomainArray = new Float32Array(bufferLength);

            const source = this.audioContext.createBufferSource();
            source.buffer = this.audioBuffer;
            source.connect(analyser);
            analyser.connect(this.audioContext.destination);

            const detectedNotes = [];
            let lastAnalysisTime = 0;
            const analysisInterval = 0.1;

            const frequencyToNote = (freq) => {
                if (freq < 27.5 || freq > 4186) return null;

                const A4 = 440;
                const semitoneRatio = Math.pow(2, 1 / 12);
                const semitonesFromA4 = Math.round(12 * Math.log2(freq / A4));

                const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
                const octave = 4 + Math.floor(semitonesFromA4 / 12);
                const noteName = notes[(semitonesFromA4 % 12 + 12) % 12];

                return {
                    name: `${noteName}${octave}`,
                    frequency: freq,
                    cents: Math.round(1200 * Math.log2(freq / (A4 * Math.pow(semitoneRatio, semitonesFromA4))))
                };
            };

            const getFundamentalFrequency = () => {
                analyser.getFloatFrequencyData(dataArray);

                let maxVolume = -Infinity;
                let peakIndex = 0;

                for (let i = 0; i < bufferLength; i++) {
                    if (dataArray[i] > maxVolume) {
                        maxVolume = dataArray[i];
                        peakIndex = i;
                    }
                }

                if (maxVolume < -60) return null;
                return peakIndex * this.audioContext.sampleRate / analyser.fftSize;
            };

            const isSoundActive = () => {
                analyser.getFloatTimeDomainData(timeDomainArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += Math.abs(timeDomainArray[i]);
                }
                return sum / bufferLength > 0.01;
            };

            let currentNote = null;
            let noteStartTime = 0;

            const processAudio = () => {
                const now = this.audioContext.currentTime;

                if (now - lastAnalysisTime >= analysisInterval) {
                    lastAnalysisTime = now;

                    const freq = getFundamentalFrequency();
                    const active = isSoundActive();

                    if (freq && active) {
                        const noteInfo = frequencyToNote(freq);

                        if (!currentNote || Math.abs(currentNote.frequency - freq) > 10) {
                            if (currentNote) {
                                detectedNotes.push({
                                    ...currentNote,
                                    time: noteStartTime,
                                    duration: now - noteStartTime
                                });
                            }
                            currentNote = noteInfo;
                            noteStartTime = now;
                        }
                    } else if (currentNote) {
                        detectedNotes.push({
                            ...currentNote,
                            time: noteStartTime,
                            duration: now - noteStartTime
                        });
                        currentNote = null;
                    }
                }

                if (now < source.buffer.duration) {
                    requestAnimationFrame(processAudio);
                } else {
                    if (currentNote) {
                        detectedNotes.push({
                            ...currentNote,
                            time: noteStartTime,
                            duration: now - noteStartTime
                        });
                    }
                    source.disconnect();
                    this.currentSequence = detectedNotes;
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

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);
        oscillator.stop(this.audioContext.currentTime + duration);

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

    playSequence(notes, callback) {
        this.playingSequence = true;
        notes.forEach((note, index) => {
            setTimeout(() => {
                if (!this.playingSequence) return;
                this.playNote(note.frequency, note.duration);
                callback?.(note.frequency);
            }, note.time * 1000);
        });
    }

    stopSequence() {
        this.playingSequence = false;
    }
}

export const pianoController = new PianoController();