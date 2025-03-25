import { useState } from "react";
import axios from "axios";

const CourseGenerator = () => {
    const [topic, setTopic] = useState("");
    const [course, setCourse] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError("Veuillez entrer un sujet valide");
            return;
        }

        setLoading(true);
        setError("");
        setCourse("");

        try {
            const response = await axios.post(
                "http://localhost:5000/api/courses/generate",
                { topic },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            setCourse(response.data.course);
        } catch (err) {
            console.error("Erreur :", err);
            setError(err.response?.data?.error || "Erreur lors de la génération");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Générateur de Cours IA</h1>

            <div className="mb-4">
                <input
                    type="text"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Les boucles en JavaScript"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
                {error && <p className="text-red-500 mt-1">{error}</p>}
            </div>

            <button
                className={`w-full py-3 px-4 rounded-lg font-medium ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                onClick={handleGenerate}
                disabled={loading}
            >
                {loading ? "Génération en cours..." : "Générer le cours"}
            </button>

            {course && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Cours généré :</h2>
                    <pre className="whitespace-pre-wrap font-sans">{course}</pre>
                </div>
            )}
        </div>
    );
};

export default CourseGenerator;