import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const Sing = () => {
    // Références et états
    const webcamRef = useRef(null);
    const [postureFeedback, setPostureFeedback] = useState('');
    const [audioFeedback, setAudioFeedback] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    // Configuration webcam
    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: "user"
    };

    // Analyse posturale (simulée)
    const analyzePosture = () => {
        const feedbackOptions = [
            "Posture excellente!",
            "Redressez les épaules",
            "Gardez le dos droit",
            "Détendez vos épaules",
            "Évitez de pencher la tête"
        ];
        setPostureFeedback(feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]);
    };

    // Analyse vocale
    const toggleVoiceAnalysis = () => {
        if (isListening) {
            stopVoiceAnalysis();
        } else {
            startVoiceAnalysis();
        }
    };

    const startVoiceAnalysis = () => {
        if (!('webkitSpeechRecognition' in window)) {
            setAudioFeedback("Votre navigateur ne supporte pas la reconnaissance vocale. Essayez avec Chrome ou Edge.");
            return;
        }

        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'fr-FR';

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setAudioFeedback("Écoute en cours... Parlez maintenant");
        };

        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setAudioFeedback(`Vous avez dit: "${transcript}"`);
        };

        recognitionRef.current.onerror = (event) => {
            setAudioFeedback(`Erreur: ${event.error}`);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        try {
            recognitionRef.current.start();
        } catch (err) {
            setAudioFeedback("Erreur: Cliquez d'abord sur la page avant de parler");
        }
    };

    const stopVoiceAnalysis = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    // Styles
    const styles = {
        container: {
            padding: '20px',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif'
        },
        title: {
            textAlign: 'center',
            color: '#2c3e50',
            marginBottom: '30px'
        },
        section: {
            marginBottom: '40px'
        },
        webcamContainer: {
            position: 'relative',
            margin: '0 auto 20px',
            width: 'fit-content'
        },
        webcam: {
            width: '100%',
            maxWidth: '640px',
            borderRadius: '8px',
            border: '3px solid #3498db',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '20px'
        },
        button: {
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            minWidth: '200px'
        },
        listeningButton: {
            backgroundColor: '#e74c3c'
        },
        feedbackBox: {
            backgroundColor: '#ecf0f1',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px',
            minHeight: '80px'
        },
        feedbackTitle: {
            color: '#2c3e50',
            marginTop: '0'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Coach Vocal et Postural</h1>

            {/* Section Webcam */}
            <div style={styles.section}>
                <h2 style={styles.feedbackTitle}>Analyse Posturale</h2>
                <div style={styles.webcamContainer}>
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        style={styles.webcam}
                        mirrored={true}
                    />
                </div>
                <div style={styles.buttonContainer}>
                    <button
                        onClick={analyzePosture}
                        style={styles.button}
                    >
                        Analyser ma Posture
                    </button>
                </div>
                {postureFeedback && (
                    <div style={styles.feedbackBox}>
                        <h3 style={styles.feedbackTitle}>Feedback Postural:</h3>
                        <p>{postureFeedback}</p>
                    </div>
                )}
            </div>

            {/* Section Audio */}
            <div style={styles.section}>
                <h2 style={styles.feedbackTitle}>Analyse Vocale</h2>
                <div style={styles.buttonContainer}>
                    <button
                        onClick={toggleVoiceAnalysis}
                        style={{
                            ...styles.button,
                            ...(isListening ? styles.listeningButton : {})
                        }}
                    >
                        {isListening ? 'Arrêter la Reconnaissance' : 'Démarrer la Reconnaissance'}
                    </button>
                </div>
                <div style={styles.feedbackBox}>
                    <h3 style={styles.feedbackTitle}>Résultat:</h3>
                    <p>{audioFeedback || "Appuyez sur le bouton et parlez..."}</p>
                </div>
            </div>
        </div>
    );
};

export default Sing;