import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaMicrophone, FaStop, FaPlay, FaMusic } from 'react-icons/fa';
import { GiGuitarHead, GiPianoKeys } from 'react-icons/gi';

const MusicExercise = () => {
    // States
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [evaluation, setEvaluation] = useState(null);
    const [selectedNote, setSelectedNote] = useState('C4');
    const [exerciseHistory, setExerciseHistory] = useState([]);
    const [showTuner, setShowTuner] = useState(false);
    const [currentPitch, setCurrentPitch] = useState(null);
    const [instrument, setInstrument] = useState('voice');

    // Refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const animationRef = useRef(null);
    const tunerIntervalRef = useRef(null);
    const audioContextRef = useRef(null);

    // Available notes
    const notes = [
        'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
        'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'
    ];

    // Available instruments
    const instruments = [
        { id: 'voice', name: 'Voice', icon: <FaMicrophone /> },
        { id: 'guitar', name: 'Guitar', icon: <GiGuitarHead /> },
        { id: 'piano', name: 'Piano', icon: <GiPianoKeys /> }
    ];

    // Note frequencies (in Hz)
    const noteFrequencies = {
        'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
        'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
        'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
        'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
    };

    // Generate tone with Web Audio API
    const generateTone = (frequency, duration = 1.5, type = 'sine') => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gainNode.gain.value = 0.3;

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        // Fade out to avoid clicks
        gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);

        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + duration);

        return oscillator;
    };

    // Play reference note
    const playReferenceNote = () => {
        if (isPlaying || isRecording) return;

        setIsPlaying(true);
        const frequency = noteFrequencies[selectedNote];

        // Choose wave type based on instrument
        let waveType = 'sine';
        if (instrument === 'guitar') waveType = 'sawtooth';
        if (instrument === 'piano') waveType = 'triangle';

        generateTone(frequency, 1.5, waveType);

        // Reset after note duration
        setTimeout(() => setIsPlaying(false), 1500);
    };

    // Start recording
    const startRecording = async () => {
        try {
            setIsLoading(true);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                await evaluateAudio(audioBlob);
            };

            // Start visualization
            startAudioVisualization(stream);

            // Start tuner
            if (showTuner) {
                startTuner(stream);
            }

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setIsLoading(false);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setIsLoading(false);
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);

            // Stop visualization and tuner
            cancelAnimationFrame(animationRef.current);
            if (tunerIntervalRef.current) {
                clearInterval(tunerIntervalRef.current);
            }
        }
    };

    // Real-time audio visualization
    const startAudioVisualization = (stream) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = document.getElementById('audioCanvas');
        const canvasCtx = canvas.getContext('2d');
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(249, 250, 251)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(168, 85, 247)'; // purple-500
            canvasCtx.beginPath();

            const sliceWidth = WIDTH * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * HEIGHT / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(WIDTH, HEIGHT / 2);
            canvasCtx.stroke();
        };

        draw();
    };

    // Real-time pitch detection
    const startTuner = (stream) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 2048;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);

        tunerIntervalRef.current = setInterval(() => {
            analyser.getFloatTimeDomainData(dataArray);
            const frequency = autoCorrelate(dataArray, audioContext.sampleRate);

            if (frequency && frequency > 0) {
                const note = getClosestNote(frequency);
                setCurrentPitch(note);
            }
        }, 100);
    };

    // Frequency detection algorithm
    const autoCorrelate = (buf, sampleRate) => {
        const SIZE = buf.length;
        const MAX_SAMPLES = Math.floor(SIZE / 2);
        let bestOffset = -1;
        let bestCorrelation = 0;
        let rms = 0;
        let foundGoodCorrelation = false;

        for (let i = 0; i < SIZE; i++) {
            const val = buf[i];
            rms += val * val;
        }

        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.01) return null;

        let lastCorrelation = 1;
        for (let offset = 0; offset < MAX_SAMPLES; offset++) {
            let correlation = 0;

            for (let i = 0; i < MAX_SAMPLES; i++) {
                correlation += Math.abs(buf[i] - buf[i + offset]);
            }

            correlation = 1 - (correlation / MAX_SAMPLES);
            if (correlation > 0.9 && correlation > lastCorrelation) {
                foundGoodCorrelation = true;
                if (correlation > bestCorrelation) {
                    bestCorrelation = correlation;
                    bestOffset = offset;
                }
            } else if (foundGoodCorrelation) {
                const shift = (bestCorrelation - 1) / (correlation - lastCorrelation);
                return sampleRate / (bestOffset + (8 * shift));
            }

            lastCorrelation = correlation;
        }

        if (bestCorrelation > 0.01) {
            return sampleRate / bestOffset;
        }

        return null;
    };

    // Find closest note
    const getClosestNote = (frequency) => {
        const noteNames = Object.keys(noteFrequencies);
        const frequencies = Object.values(noteFrequencies);

        let closestNote = noteNames[0];
        let smallestDiff = Math.abs(frequency - frequencies[0]);

        for (let i = 1; i < frequencies.length; i++) {
            const diff = Math.abs(frequency - frequencies[i]);
            if (diff < smallestDiff) {
                smallestDiff = diff;
                closestNote = noteNames[i];
            }
        }

        return {
            name: closestNote,
            frequency: frequency,
            targetFrequency: noteFrequencies[closestNote],
            cents: calculateCents(frequency, noteFrequencies[closestNote])
        };
    };

    // Calculate cents (accuracy)
    const calculateCents = (frequency, targetFrequency) => {
        return Math.floor(1200 * Math.log2(frequency / targetFrequency));
    };

    // Evaluate recorded audio
    const evaluateAudio = async (audioBlob) => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');
            formData.append('expectedNote', selectedNote);
            formData.append('instrument', instrument);

            const token = localStorage.getItem('token');
            const response = await axios.post('/api/music/evaluate-note', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            setEvaluation(response.data);
            await saveExerciseResult(response.data);
            await fetchExerciseHistory();
        } catch (error) {
            console.error('Evaluation error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Save exercise result
    const saveExerciseResult = async (result) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/music/save-exercise', {
                userId: JSON.parse(localStorage.getItem('user'))._id,
                exerciseType: 'note',
                result: result.detectedNote,
                accuracy: result.accuracy,
                instrument: instrument
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error saving exercise:', error);
        }
    };

    // Fetch exercise history
    const fetchExerciseHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = JSON.parse(localStorage.getItem('user'))._id;
            const response = await axios.get(`/api/music/user-exercises/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setExerciseHistory(response.data.exercises);
        } catch (error) {
            console.error('Error fetching exercise history:', error);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            stopRecording();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        Music Training Studio
                    </h1>
                    <p className="text-center text-purple-600">
                        Perfect your musical ear and pitch accuracy
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Control Panel */}
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-200">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-700">
                            <FaMusic /> Configuration
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-purple-700">Instrument</label>
                                <div className="flex gap-2">
                                    {instruments.map((inst) => (
                                        <button
                                            key={inst.id}
                                            onClick={() => setInstrument(inst.id)}
                                            className={`flex-1 py-2 px-3 rounded-lg flex flex-col items-center transition-all ${instrument === inst.id
                                                ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-800 border border-purple-300 shadow-sm'
                                                : 'bg-white hover:bg-purple-50 border border-purple-200'
                                                }`}
                                        >
                                            <span className="text-lg text-purple-600">{inst.icon}</span>
                                            <span className="text-xs mt-1">{inst.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-purple-700">Note to play</label>
                                <select
                                    value={selectedNote}
                                    onChange={(e) => setSelectedNote(e.target.value)}
                                    disabled={isRecording}
                                    className="w-full p-3 bg-white border border-purple-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                                >
                                    {notes.map((note) => (
                                        <option key={note} value={note}>{note}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={playReferenceNote}
                                    disabled={isPlaying || isRecording}
                                    className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${isPlaying
                                        ? 'bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                                        } ${(isPlaying || isRecording) ? 'opacity-50' : ''}`}
                                >
                                    <FaPlay /> {isPlaying ? 'Playing...' : 'Play reference note'}
                                </button>

                                <button
                                    onClick={() => setShowTuner(!showTuner)}
                                    className={`p-3 rounded-lg ${showTuner ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white border border-purple-200 hover:bg-purple-50'
                                        }`}
                                >
                                    <GiGuitarHead className="text-xl" />
                                </button>
                            </div>

                            <div className="pt-4 border-t border-purple-200">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={isLoading}
                                    className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${isRecording
                                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                        } ${isLoading ? 'opacity-50' : ''}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {isRecording ? 'Stopping...' : 'Starting...'}
                                        </>
                                    ) : (
                                        <>
                                            {isRecording ? <FaStop /> : <FaMicrophone />}
                                            {isRecording ? 'Stop' : 'Start'} recording
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visualization and results */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Audio visualization */}
                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-200">
                            <h2 className="text-xl font-semibold mb-4 text-purple-700">Audio Visualization</h2>
                            <div className="relative">
                                <canvas
                                    id="audioCanvas"
                                    width="800"
                                    height="150"
                                    className="w-full h-36 bg-white rounded-lg border border-purple-200"
                                ></canvas>

                                {showTuner && currentPitch && (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-purple-200 shadow-sm">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-700">{currentPitch.name}</div>
                                            <div className="text-sm text-purple-600">
                                                {Math.round(currentPitch.frequency)} Hz
                                                {Math.abs(currentPitch.cents) > 10 && (
                                                    <span className={`ml-2 ${currentPitch.cents > 0 ? 'text-pink-600' : 'text-purple-600'}`}>
                                                        ({currentPitch.cents > 0 ? '+' : ''}{currentPitch.cents} cents)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {showTuner && (
                                <div className="mt-4 bg-white p-4 rounded-lg border border-purple-200">
                                    <div className="flex justify-between mb-2 text-xs text-purple-700">
                                        <span>-50 cents</span>
                                        <span>In tune</span>
                                        <span>+50 cents</span>
                                    </div>
                                    <div className="relative h-8 bg-gradient-to-r from-purple-300 via-pink-200 to-pink-300 rounded-full overflow-hidden">
                                        {currentPitch && (
                                            <div
                                                className="absolute top-0 w-2 h-10 bg-purple-600 rounded-full -mt-1 shadow-lg"
                                                style={{
                                                    left: `${Math.min(Math.max(50 + currentPitch.cents, 0), 100)}%`,
                                                    transition: 'left 0.1s ease-out'
                                                }}
                                            ></div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results */}
                        {evaluation && (
                            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-200">
                                <h2 className="text-xl font-semibold mb-4 text-purple-700">Results</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                                        <h3 className="font-medium mb-2 text-purple-700">Played note</h3>
                                        <div className={`text-4xl font-bold ${evaluation.isCorrect ? 'text-green-600' : 'text-pink-600'
                                            }`}>
                                            {evaluation.detectedNote}
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                                        <h3 className="font-medium mb-2 text-purple-700">Accuracy</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl font-bold">
                                                {(evaluation.accuracy * 100).toFixed(1)}%
                                            </div>
                                            <div className="w-full bg-purple-100 rounded-full h-4">
                                                <div
                                                    className={`h-4 rounded-full ${evaluation.accuracy > 0.9
                                                        ? 'bg-green-500'
                                                        : evaluation.accuracy > 0.7
                                                            ? 'bg-yellow-400'
                                                            : 'bg-pink-500'
                                                        }`}
                                                    style={{ width: `${evaluation.accuracy * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 bg-white p-4 rounded-lg border border-purple-200">
                                        <h3 className="font-medium mb-2 text-purple-700">Feedback</h3>
                                        <p className="text-purple-600">{evaluation.feedback}</p>
                                        {evaluation.suggestions && (
                                            <div className="mt-2">
                                                <h4 className="font-medium text-sm text-purple-700">Suggestions:</h4>
                                                <p className="text-sm text-purple-600">{evaluation.suggestions}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* History */}
                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-200">
                            <h2 className="text-xl font-semibold mb-4 text-purple-700">Your Progress</h2>
                            {exerciseHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-purple-200">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-purple-700 uppercase">Date</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-purple-700 uppercase">Note</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-purple-700 uppercase">Instrument</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-purple-700 uppercase">Accuracy</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-200">
                                            {exerciseHistory.map((exercise, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-purple-600">
                                                        {new Date(exercise.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                                                        {exercise.result}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-purple-600">
                                                        {instruments.find(i => i.id === exercise.instrument)?.name || exercise.instrument}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-purple-600">{(exercise.accuracy * 100).toFixed(0)}%</span>
                                                            <div className="w-16 bg-purple-100 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${exercise.accuracy > 0.9
                                                                        ? 'bg-green-500'
                                                                        : exercise.accuracy > 0.7
                                                                            ? 'bg-yellow-400'
                                                                            : 'bg-pink-500'
                                                                        }`}
                                                                    style={{ width: `${exercise.accuracy * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-purple-600/70">No exercises recorded yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MusicExercise;