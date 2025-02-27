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
                className="chat-bubble"
                onClick={() => setIsOpen(true)}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "#007bff",
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
            <div style={{
                padding: "10px 15px",
                backgroundColor: "#007bff",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "move"
            }}>
                <span>Chat Assistant</span>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "20px",
                            padding: "0 5px"
                        }}
                    >
                        −
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div 
                ref={chatContainerRef}
                style={{ 
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px",
                    backgroundColor: "#f5f5f5"
                }}
            >
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        style={{ 
                            textAlign: msg.sender === "user" ? "right" : "left",
                            margin: "10px 0",
                            padding: "8px 12px",
                            backgroundColor: msg.isError ? "#ffebee" : msg.sender === "user" ? "#007bff" : "#ffffff",
                            color: msg.sender === "user" ? "#ffffff" : msg.isError ? "#d32f2f" : "#000000",
                            borderRadius: "12px",
                            maxWidth: "70%",
                            marginLeft: msg.sender === "user" ? "auto" : "0",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            wordBreak: "break-word"
                        }}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            {/* Input Container */}
            <div style={{
                padding: "15px",
                borderTop: "1px solid #eee",
                backgroundColor: "#ffffff",
                display: "flex",
                gap: "10px"
            }}>
                <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        fontSize: "14px"
                    }}
                />
                <button 
                    onClick={sendMessage}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                >
                    Send
                </button>
            </div>

            {/* Resize Handle */}
            <div
                ref={resizeRef}
                onMouseDown={handleMouseDown}
                style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "15px",
                    height: "15px",
                    cursor: "se-resize",
                    background: "transparent"
                }}
            >
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    style={{ display: "block" }}
                >
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
