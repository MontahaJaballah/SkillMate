import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Pour afficher le Markdown

const CourseGenerator = () => {
    const [topic, setTopic] = useState("notes de musique");
    const [course, setCourse] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setLoading(true);
        try {
            const response = await axios.post(
                "http://localhost:5000/api/courses/generate",
                { topic },
                { headers: { "Content-Type": "application/json" } }
            );

            setCourse(response.data.course);
        } catch (error) {
            alert(`Erreur : ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Générateur de Cours</h1>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Sujet du cours"
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                    {loading ? "Génération..." : "Générer"}
                </button>
            </div>

            {/* Affichage formaté en Markdown */}
            <div className="prose max-w-none">
                <ReactMarkdown>{course}</ReactMarkdown>
            </div>
        </div>
    );
};
export default CourseGenerator;