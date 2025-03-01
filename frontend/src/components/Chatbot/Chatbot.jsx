import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [size, setSize] = useState({ width: 400, height: 500 });
    const resizeRef = useRef(null);
    const chatContainerRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const startX = e.pageX;
        const startY = e.pageY;
        const startWidth = size.width;
        const startHeight = size.height;

        const handleMouseMove = (e) => {
            if (isDragging) {
                const newWidth = startWidth + (e.pageX - startX);
                const newHeight = startHeight + (e.pageY - startY);
                setSize({
                    width: Math.max(300, newWidth),  // Minimum width
                    height: Math.max(400, newHeight) // Minimum height
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const sendMessage = async () => {
        if (!input) return;

        const userMessage = { sender: "user", text: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput("");

        try {
            // Updated endpoint to use the user routes path
            const res = await axios.post("http://localhost:5000/api/users/chat", { message: input });
            const botMessage = { sender: "bot", text: res.data.reply };
            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = {
                sender: "bot",
                text: error.response?.data?.error || "Sorry, I encountered an error. Please try again.",
                isError: true
            };

            // Add more detailed error for developers in console
            if (error.response?.data?.details) {
                console.error("Error details:", error.response.data.details);
            }

            setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isOpen) {
        return (
            <div
                className="fixed bottom-6 right-6 w-16 h-16 bg-main text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 z-50"
                onClick={() => setIsOpen(true)}
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                </svg>
            </div>
        );
    }

    return (
        <div
            className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col"
            style={{
                width: `${size.width}px`,
                height: `${size.height}px`,
            }}
        >
            {/* Header */}
            <div className="bg-main text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
                <span className="font-semibold">AI Assistant</span>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-opacity-20 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                        −
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex mb-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`
                                max-w-[70%] px-4 py-2 rounded-xl 
                                ${msg.isError
                                    ? "bg-red-100 text-red-800"
                                    : msg.sender === "user"
                                        ? "bg-main text-white"
                                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white"}
                                shadow-sm
                            `}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Container */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex space-x-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-main dark:bg-gray-700 dark:text-white"
                />
                <button
                    onClick={sendMessage}
                    className="bg-main text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
                    disabled={!input.trim()}
                >
                    Send
                </button>
            </div>

            {/* Resize Handle */}
            <div
                ref={resizeRef}
                onMouseDown={handleMouseDown}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            >
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    className="text-gray-400"
                >
                    <path
                        d="M11 11L15 15M7 11L15 11M11 7L15 7"
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                </svg>
            </div>
        </div>
    );
};

export default Chatbot;
