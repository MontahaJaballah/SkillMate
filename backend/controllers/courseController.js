const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialisation avec votre clé
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const generateCourse = async (req, res) => {
    // Spécifiez le modèle (gratuit)
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            maxOutputTokens: 1000,  // Limite de tokens
            temperature: 0.5       // Contrôle la créativité (0=précis, 1=créatif)
        }
    });

    // Prompt optimisé pour les cours
    const prompt = `[ROLE] Tu es un professeur de musique expert.
[INSTRUCTIONS] Génère un cours sur "${req.body.topic}" en français avec :
1. Une introduction simple
2. 3 concepts clés avec exemples
3. Un exercice pratique
[FORMAT] Utilise Markdown avec ## Titres et - listes`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Nettoyage du texte
        const cleanText = text
            .replace(/```markdown/g, "")  // Retire les blocs de code
            .replace(/```/g, "");

        res.json({
            course: cleanText,
            modelUsed: "gemini-1.5-flash"
        });
    } catch (error) {
        console.error("Erreur Gemini:", error);
        res.status(500).json({
            error: "Erreur de génération",
            solution: "Vérifiez votre quota sur AI Studio"
        });
    }
};

module.exports = { generateCourse };
