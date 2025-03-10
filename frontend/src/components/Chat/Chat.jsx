import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import "./Chat.css";

const socket = io("http://localhost:5000"); // Backend socket URL

const Chat = ({ receiver }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Safely get user IDs, with fallbacks
  const senderId = user?._id || '';
  const receiverId = receiver?._id || '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages function
  const fetchMessages = async () => {
    if (!senderId || !receiverId) return;

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${senderId}/${receiverId}`);
      setMessages(res.data);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      console.error("Error fetching chat history:", err);
      setLoading(false);
    }
  };

  // Effect for fetching messages and socket setup
  useEffect(() => {
    if (!senderId || !receiverId) return;

    fetchMessages();

    // Listen for incoming messages
    socket.on("receiveMessage", (newMessage) => {
      if (
        (newMessage.sender === senderId && newMessage.receiver === receiverId) ||
        (newMessage.sender === receiverId && newMessage.receiver === senderId)
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        scrollToBottom();
      }
    });

    return () => socket.off("receiveMessage");
  }, [senderId, receiverId]);

  // Effect for scrolling to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !senderId || !receiverId) return;

    const newMessage = {
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
    };

    try {
      // Send to backend
      await axios.post("http://localhost:5000/api/chat/send", newMessage);

      // Emit via socket
      socket.emit("sendMessage", newMessage);

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!user || !receiver) {
    return (
      <div className="chat-container flex items-center justify-center h-full">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-container bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col h-full">
      <div className="chat-header bg-gradient-to-r from-violet-500 to-pink-500 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold">
          {receiver.firstName
            ? `${receiver.firstName} ${receiver.lastName}`
            : receiver.username}
        </h3>
        <p className="text-sm opacity-75">
          {receiver.isOnline ? "Online" : "Offline"}
        </p>
      </div>

      <div className="chat-messages flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message mb-4 ${
                msg.sender === user._id ? "sent" : "received"
              }`}
            >
              <div
                className={`message-bubble p-3 rounded-lg max-w-[70%] ${
                  msg.sender === user._id
                    ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white ml-auto"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <p>{msg.message}</p>
                <span className="text-xs opacity-75">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-md focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
