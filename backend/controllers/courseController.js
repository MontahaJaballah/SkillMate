const axios = require("axios");


const generateCourse = async (req, res) => {
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: "Le sujet est requis" });
    }

    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/google/flan-t5-base", // Modèle plus stable
            {
                inputs: `Crée un cours en français sur "${topic}" avec cette structure :
1. [Introduction] 
2. [Exemples] 
3. [Exercice pratique]
4. [Résumé]`,
                parameters: {
                    max_length: 800,
                    temperature: 0.7
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Nettoyage du texte généré
        const generatedText = response.data[0]?.generated_text || "Erreur de génération";
        const cleanedText = generatedText
            .replace(/\[.*?\]/g, "") // Retire les balises non fermées
            .replace(/(\n\s*){3,}/g, "\n\n"); // Réduit les sauts de ligne multiples

        res.json({
            course: cleanedText || "Erreur lors de la génération",
            fullResponse: response.data
        });

    } catch (error) {
        console.error("Erreur complète :", error.response?.data || error.message);
        res.status(500).json({
            error: "Erreur lors de la génération du cours",
            details: error.response?.data || error.message
        });
    }
};

module.exports = { generateCourse };

