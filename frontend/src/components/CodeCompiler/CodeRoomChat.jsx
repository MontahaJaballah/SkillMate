import React, { useState, useEffect, useRef } from 'react';
import './CodeRoomChat.css';

const CodeRoomChat = ({ roomId, username, socket }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Listen for messages
  useEffect(() => {
    if (socket) {
      // Listen for previous messages when joining room
      socket.on('previousMessages', (previousMessages) => {
        setMessages(previousMessages);
      });

      // Listen for incoming messages
      socket.on('codeRoomMessage', (message) => {
        setMessages(prevMessages => [...prevMessages, message]);
        
        // If chat is collapsed, increment unread count
        if (!isExpanded) {
          setUnreadCount(prev => prev + 1);
        }
      });
    }
    
    // Cleanup listeners on unmount
    return () => {
      if (socket) {
        socket.off('previousMessages');
        socket.off('codeRoomMessage');
      }
    };
  }, [socket, isExpanded]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`codeRoom_${roomId}_messages`, JSON.stringify(messages));
    }
  }, [messages, roomId]);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(`codeRoom_${roomId}_messages`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [roomId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset unread count when chat is expanded
  useEffect(() => {
    if (isExpanded) {
      setUnreadCount(0);
    }
  }, [isExpanded]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (messageInput.trim() && socket) {
      // Determine if this is a code snippet (simple detection)
      const isCodeSnippet = messageInput.includes('```') || 
                           (messageInput.includes('{') && messageInput.includes('}')) ||
                           messageInput.includes('function ');
      
      // Send message via socket
      socket.emit('sendCodeRoomMessage', {
        roomId,
        sender: username,
        message: messageInput,
        isCodeSnippet
      });
      
      // Clear input
      setMessageInput('');
    }
  };

  const handleShareCode = () => {
    // Get the current code from Monaco Editor (via localStorage)
    const editorCode = localStorage.getItem("collaborativeCode") || "";
    
    if (editorCode.trim() && socket) {
      // Send code snippet
      socket.emit('sendCodeRoomMessage', {
        roomId,
        sender: username,
        message: editorCode,
        isCodeSnippet: true
      });
    }
  };

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setUnreadCount(0);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message, index) => {
    const isCurrentUser = message.sender === username;
    const messageClass = isCurrentUser ? 'message-mine' : 'message-other';
    
    return (
      <div key={index} className={`message-container ${messageClass}`}>
        <div className="message-header">
          <span className="message-sender">{isCurrentUser ? 'You' : message.sender}</span>
          <span className="message-time">{formatTimestamp(message.timestamp)}</span>
        </div>
        {message.isCodeSnippet ? (
          <pre className="code-snippet">
            <code>{message.message}</code>
          </pre>
        ) : (
          <div className="message-text">{message.message}</div>
        )}
      </div>
    );
  };

  return (
    <div className={`code-room-chat ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="chat-header" onClick={toggleChat}>
        <h3>Chat</h3>
        {!isExpanded && unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
        <button className="toggle-button">
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="messages-container" ref={chatContainerRef}>
            {messages.length === 0 ? (
              <div className="no-messages">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message, index) => renderMessage(message, index))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-actions">
            <button 
              className="share-code-button" 
              onClick={handleShareCode}
              title="Share current code as snippet"
            >
              &lt;/&gt;
            </button>
            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-button">
                Send
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default CodeRoomChat;
