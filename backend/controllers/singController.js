const singController = {
    analyzeLiveAudio: (req, res) => {
        res.json({
            status: "success",
            message: "Utilisez l'API Web Speech directement dans le frontend",
            exampleFeedback: [
                "Votre ton est trop bas sur la note 'La'",
                "Excellent contrôle respiratoire!",
                "Améliorez la prononciation des consonnes"
            ][Math.floor(Math.random() * 3)]
        });
    },

    analyzePosture: async (req, res) => {
        try {
            // Simulation de l'analyse posturale
            const feedbacks = [
                "Posture excellente!",
                "Redressez légèrement les épaules",
                "Gardez le dos droit",
                "Évitez de pencher la tête"
            ];

            res.json({
                status: "success",
                feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
                keypoints: [] // Simulé
            });
        } catch (err) {
            res.status(500).json({ error: "Erreur de simulation" });
        }
    }
};

module.exports = singController;