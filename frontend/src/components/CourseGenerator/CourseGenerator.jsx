import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const CourseGenerator = () => {
    const [topic, setTopic] = useState("music notes");
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
            alert(`Error: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 p-6">
            <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-200">
                <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    Course Generator
                </h1>

                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        className="flex-1 p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Course topic"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg font-medium ${loading
                                ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </span>
                        ) : 'Generate'}
                    </button>
                </div>

                {/* Markdown content with styled output */}
                {course && (
                    <div className="prose max-w-none p-4 bg-white rounded-lg border border-purple-200">
                        <ReactMarkdown>{course}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseGenerator;