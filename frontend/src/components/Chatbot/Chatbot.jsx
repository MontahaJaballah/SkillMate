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

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isOpen) {
        return (
            <div
                className="chat-bubble"
                onClick={() => setIsOpen(true)}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "linear-gradient(to right, #8b5cf6, #ec4899)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    transition: "transform 0.2s",
                    zIndex: 1000,
                }}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
            </div>
        );
    }

    return (
        <div
            className="chatbot-container"
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                width: `${size.width}px`,
                height: `${size.height}px`,
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                zIndex: 1000,
                overflow: "hidden"
            }}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-pink-500 text-white p-3 flex justify-between items-center cursor-move">
                <span className="font-semibold">Chat Assistant</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:bg-white/20 rounded p-1 transition-colors"
                    >
                        −
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 bg-gray-50"
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`max-w-[70%] mb-3 ${msg.sender === "user" ? "ml-auto" : "mr-auto"}`}
                    >
                        <div
                            className={`rounded-lg p-3 shadow-sm ${
                                msg.isError 
                                    ? "bg-red-50 text-red-600" 
                                    : msg.sender === "user"
                                        ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                                        : "bg-white text-gray-800"
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Container */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 text-gray-800 bg-white border border-gray-200 rounded-full focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-6 py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity"
                    >
                        Send
                    </button>
                </div>
            </div>

            {/* Resize Handle */}
            <div
                ref={resizeRef}
                onMouseDown={handleMouseDown}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            >
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <path
                        d="M11 11L15 15M7 11L15 11M11 7L15 7"
                        stroke="#999"
                        strokeWidth="1"
                    />
                </svg>
            </div>
        </div>
    );
};

export default Chatbot;
