import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { config } from "../../config/config";
import HtmlPreviewer from "./HtmlPreviewer";
import MonacoEditor from "./MonacoEditor";
import CodeRoomChat from './CodeRoomChat';
import "./CollaborativeCodeCompiler.css";

const LANGUAGES = {
  javascript: {
    name: "JavaScript (Node.js)",
    template: "// Write your JavaScript code here\n"
  },
  python: {
    name: "Python 3",
    template: "# Write your Python code here\n"
  },
  java: {
    name: "Java",
    template: `public class Main {
    public static void main(String[] args) {
        // Write your Java code here
    }
}`
  },
  cpp: {
    name: "C++",
    template: `#include <iostream>
using namespace std;

int main() {
    // Write your C++ code here
    return 0;
}`
  },
  html: {
    name: "HTML",
    template: `<!DOCTYPE html>
<html>
<head>
    <title>HTML Example</title>
    <style>
        /* CSS styles here */
    </style>
</head>
<body>
    <!-- HTML content here -->
    <h1>Hello, World!</h1>
    
    <script>
        // JavaScript code here
    </script>
</body>
</html>`
  }
};

const CollaborativeCodeCompiler = ({ 
  roomId, 
  username, 
  onLeaveRoom,
  expectedOutput, 
  testCases 
}) => {
  // Socket connection
  const socketRef = useRef();
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const typingTimeoutRef = useRef({});
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  
  // Code state
  const [activeTab, setActiveTab] = useState('backend');
  const [backendCode, setBackendCode] = useState(LANGUAGES.javascript.template);
  const [frontendCode, setFrontendCode] = useState({ html: "", css: "", js: "" });
  const [language, setLanguage] = useState('javascript');
  
  // Cursor tracking state
  const [cursorPositions, setCursorPositions] = useState({});
  
  // Output state
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState([]);
  
  // HTML preview state (for HTML language)
  const [iframeSrc, setIframeSrc] = useState("");
  
  // Flag to prevent infinite loops when receiving code updates
  const isReceivingUpdate = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    // Save current session data to localStorage for recovery
    const saveSessionData = () => {
      if (backendCode && language) {
        localStorage.setItem("collaborativeCode", backendCode);
        localStorage.setItem("collaborativeLanguage", language);
      }
    };

    let socket = null;

    // Create socket connection with the correct configuration
    try {
      // Use the same socket instance throughout the app
      // Check if there's an existing socket connection in window object
      if (!window.skillMateSocket) {
        window.skillMateSocket = io("http://localhost:5000", {
          withCredentials: true,
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });
        console.log("Created new socket connection");
      } else {
        console.log("Using existing socket connection");
      }
      
      socket = window.skillMateSocket;
      socketRef.current = socket;
      setIsConnected(socket.connected);
      
      console.log("Socket connection status:", socket.connected);
    } catch (error) {
      console.error("Socket connection error:", error);
    }
    
    // Join code room
    const joinRoom = () => {
      if (roomId && username && socketRef.current) {
        console.log(`Joining room ${roomId} as ${username}`);
        socketRef.current.emit("joinCodeRoom", { roomId, username });
      } else {
        console.warn("Cannot join room - missing socket, roomId or username");
      }
    };
    
    // Set up event listeners
    if (socketRef.current) {
      // Only set up listeners if they're not already set up
      if (!socketRef.current._eventsCount || 
          !socketRef.current._events.connect || 
          !socketRef.current._events.codeRoomUserList) {
        
        socketRef.current.on("connect", () => {
          console.log("Connected to server");
          setIsConnected(true);
          joinRoom();
        });
        
        socketRef.current.on("disconnect", () => {
          console.log("Disconnected from server");
          setIsConnected(false);
          
          // Save current state when disconnected
          saveSessionData();
        });
        
        socketRef.current.on("connect_error", (error) => {
          console.log("Connection error:", error);
          setIsConnected(false);
          
          // Attempt to reconnect with exponential backoff
          setReconnectAttempt(prev => prev + 1);
        });
      }
      
      // These event listeners are specific to this component and should be set up every time
      socketRef.current.on("codeRoomUserList", (userList) => {
        console.log("Received user list:", userList);
        setUsers(userList);
      });
      
      socketRef.current.on("initialCodeState", ({ code, language: lang }) => {
        console.log("Received initial code state");
        
        if (lang) {
          setLanguage(lang);
          localStorage.setItem("collaborativeLanguage", lang);
        }
        
        if (code) {
          isReceivingUpdate.current = true;
          setBackendCode(code);
          localStorage.setItem("collaborativeCode", code);
          isReceivingUpdate.current = false;
        }
      });
      
      socketRef.current.on("codeUpdate", ({ code, language: lang }) => {
        console.log("Received code update");
        
        if (lang && lang !== language) {
          setLanguage(lang);
          localStorage.setItem("collaborativeLanguage", lang);
        }
        
        if (code) {
          isReceivingUpdate.current = true;
          setBackendCode(code);
          localStorage.setItem("collaborativeCode", code);
          isReceivingUpdate.current = false;
        }
      });
      
      socketRef.current.on("cursorUpdate", ({ username: user, position }) => {
        console.log(`Received cursor update from ${user}:`, position);
        setCursorPositions(prev => ({
          ...prev,
          [user]: position
        }));
      });
      
      socketRef.current.on("userTyping", ({ username: user, isTyping }) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(user);
          } else {
            newSet.delete(user);
          }
          return newSet;
        });
      });
    }
    
    // If socket is connected, join room immediately
    if (socketRef.current && socketRef.current.connected) {
      joinRoom();
    }
    
    // Try to restore saved code if available
    const savedCode = localStorage.getItem("collaborativeCode");
    const savedLanguage = localStorage.getItem("collaborativeLanguage");
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    if (savedCode) {
      setBackendCode(savedCode);
    }
    
    // Set up window event to save data and prevent refresh
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
      saveSessionData();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up on unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      if (socketRef.current) {
        // Remove only the event listeners specific to this component
        socketRef.current.off("codeRoomUserList");
        socketRef.current.off("initialCodeState");
        socketRef.current.off("codeUpdate");
        socketRef.current.off("cursorUpdate");
        socketRef.current.off("userTyping");
        
        // Notify server that we're leaving the room
        socketRef.current.emit("leaveCodeRoom", { roomId });
        
        // Don't disconnect the socket as it might be used by other components
        // Just remove our reference to it
        socketRef.current = null;
        
        // Clean up timeouts
        Object.values(typingTimeoutRef.current).forEach(timeout => {
          clearTimeout(timeout);
        });
        typingTimeoutRef.current = {};
      }
    };
  }, [roomId, username, reconnectAttempt]);

  // Attempt reconnection with exponential backoff
  useEffect(() => {
    if (reconnectAttempt > 0) {
      const timeout = setTimeout(() => {
        console.log(`Attempting to reconnect (attempt ${reconnectAttempt})`);
        if (socketRef.current) {
          socketRef.current.connect();
        }
      }, Math.min(1000 * Math.pow(2, reconnectAttempt - 1), 30000));
      
      return () => clearTimeout(timeout);
    }
  }, [reconnectAttempt]);

  // Update HTML preview when code changes (if language is HTML)
  useEffect(() => {
    if (language === 'html') {
      const blob = new Blob([backendCode], { type: "text/html" });
      setIframeSrc(URL.createObjectURL(blob));
    }
  }, [backendCode, language]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem("collaborativeLanguage", newLang);
    
    // Only reset code if it's still the template
    if (backendCode === LANGUAGES[language]?.template) {
      setBackendCode(LANGUAGES[newLang]?.template || "");
      localStorage.setItem("collaborativeCode", LANGUAGES[newLang]?.template || "");
    }
    
    // Emit language change to other users
    if (socketRef.current && isConnected) {
      socketRef.current.emit("codeChange", { 
        roomId, 
        code: backendCode, 
        language: newLang 
      });
    }
    
    // Reset output
    setOutput("");
    setError("");
    setScore(null);
    setFeedback([]);
  };

  const handleCodeChange = (newCode) => {
    setBackendCode(newCode);
    localStorage.setItem("collaborativeCode", newCode);
    
    // Only emit code changes if they weren't triggered by receiving an update
    if (!isReceivingUpdate.current && socketRef.current && isConnected) {
      // Emit code change
      socketRef.current.emit("codeChange", { 
        roomId, 
        code: newCode, 
        language 
      });
      
      // Emit typing status
      socketRef.current.emit("userTyping", {
        roomId,
        username,
        isTyping: true
      });
      
      // Clear existing timeout for this user
      if (typingTimeoutRef.current[username]) {
        clearTimeout(typingTimeoutRef.current[username]);
      }
      
      // Set new timeout to clear typing status after 1.5 seconds of no typing
      typingTimeoutRef.current[username] = setTimeout(() => {
        socketRef.current?.emit("userTyping", {
          roomId,
          username,
          isTyping: false
        });
      }, 1500);
    }
  };

  const handleCursorChange = (position) => {
    // Only emit cursor position if connected
    if (socketRef.current && isConnected) {
      socketRef.current.emit("cursorMove", {
        roomId,
        username,
        position
      });
    }
  };

  const handleRunCode = async () => {
    const codeToRun = activeTab === 'backend' ? backendCode : frontendCode;
    
    if (!codeToRun || (typeof codeToRun === 'string' && !codeToRun.trim())) {
      const errorMsg = "Please enter some code to run";
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");
    setScore(null);
    setFeedback([]);
    
    try {
      const { data } = await axios.post(`${config.API_URL}/compiler/run`, {
        code: backendCode,
        language,
        expectedOutput
      });
      
      setOutput(data.output);
      setScore(data.score);
      setFeedback(data.feedback);
      
      if (!data.isCorrect && expectedOutput) {
        const errorMsg = "Your solution's output doesn't match the expected output. Keep trying!";
        setError(errorMsg);
      }
    } catch (error) {
      console.error("Error running code:", error);
      const errorMsg = error.response?.data?.message || "Error executing code";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("collaborativeActiveTab", tab);
  };

  const handleLeaveRoom = () => {
    // Clear collaborative session data
    localStorage.removeItem("collaborativeCode");
    localStorage.removeItem("collaborativeLanguage");
    localStorage.removeItem("collaborativeActiveTab");
    
    if (onLeaveRoom) {
      onLeaveRoom();
    }
  };

  return (
    <div className="code-compiler-container">
      <div className="compiler-header">
        <div className="header-content">
          <h2>Collaborative Code Editor - Room: {roomId}</h2>
          <p>
            <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '● Connected' : '● Disconnected'}
            </span>
            <button className="leave-room-button" onClick={handleLeaveRoom}>
              Leave Room
            </button>
          </p>
        </div>
        <div className="compiler-tabs">
          <button 
            className={`tab-button ${activeTab === 'backend' ? 'active' : ''}`}
            onClick={() => handleTabChange('backend')}
          >
            Code Editor
          </button>
          <button 
            className={`tab-button ${activeTab === 'frontend' ? 'active' : ''}`}
            onClick={() => handleTabChange('frontend')}
          >
            HTML/CSS/JS Editor
          </button>
        </div>
      </div>

      <div className="collaborative-layout">
        <div className={activeTab === 'backend' ? 'backend-compiler' : 'hidden'}>
          <div className="compiler-controls">
            <select 
              className="language-selector"
              value={language} 
              onChange={handleLanguageChange}
            >
              {Object.entries(LANGUAGES).map(([key, { name }]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            
            <button 
              className={`run-button ${loading ? 'loading' : ''}`}
              onClick={handleRunCode}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Running...
                </>
              ) : (
                <>
                  <span className="run-icon">▶</span>
                  Run Code
                </>
              )}
            </button>
          </div>

          <div className="code-section">
            <div className="code-editor-container">
              <div className="editor-section">
                <div className="editor-header">
                  <div className="language-selector">
                    <label htmlFor="language">Language:</label>
                    <select
                      id="language"
                      value={language}
                      onChange={handleLanguageChange}
                      className="language-select"
                    >
                      {Object.keys(LANGUAGES).map((lang) => (
                        <option key={lang} value={lang}>
                          {LANGUAGES[lang].name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="room-info">
                    <span className="room-id">Room ID: {roomId}</span>
                    <button 
                      className="copy-room-button" 
                      onClick={() => navigator.clipboard.writeText(roomId)}
                      title="Copy Room ID to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </div>
                
                <div className="editor-with-chat-container">
                  <div className="monaco-container">
                    <MonacoEditor
                      language={language}
                      value={backendCode}
                      onChange={handleCodeChange}
                      onCursorChange={handleCursorChange}
                      cursorPositions={cursorPositions}
                      username={username}
                      typingUsers={typingUsers}
                      height="400px"
                    />
                  </div>
                  
                  <CodeRoomChat 
                    roomId={roomId}
                    username={username}
                    socket={socketRef.current}
                  />
                </div>
              </div>
            </div>

            <div className="output-container">
              <div className="output-header">
                <h3>Results & Feedback</h3>
                <small>Execution results and code quality feedback</small>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              {loading && !error && (
                <div className="loading-message">
                  <span className="spinner"></span>
                  Evaluating your solution...
                </div>
              )}

              {output && (
                <div className="output-section">
                  <h4>Program Output:</h4>
                  <pre className="output-display">
                    <code>{output}</code>
                  </pre>
                </div>
              )}

              {score !== null && (
                <div className={`score-section ${score >= 80 ? 'good' : score >= 60 ? 'average' : 'poor'}`}>
                  <h4>Code Score: {score}/100</h4>
                  {feedback.length > 0 && (
                    <>
                      <h4>Suggestions for Improvement:</h4>
                      <ul className="feedback-list">
                        {feedback.map((item, index) => (
                          <li key={index} className={`feedback-item severity-${item.severity}`}>
                            {item.line && <span className="line-number">Line {item.line}:</span>} {item.message}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {!output && !error && !loading && (
                <div className="empty-output">
                  Click "Run Code" to evaluate your code
                </div>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'frontend' && (
          <HtmlPreviewer 
            code={frontendCode}
            onChange={(newCode) => {
              setFrontendCode(newCode);
            }}
          />
        )}

        {language === 'html' && activeTab === 'backend' && (
          <div className="html-preview-panel">
            <div className="preview-header">
              <h4>HTML Preview</h4>
              <small>Real-time output</small>
            </div>
            <iframe 
              src={iframeSrc} 
              title="HTML Preview" 
              className="preview-frame"
              sandbox="allow-scripts allow-modals allow-popups allow-same-origin"
            />
          </div>
        )}

        <div className="users-panel">
          <div className="users-header">
            <h4>Users in Room</h4>
            <small>{users.length} connected</small>
          </div>
          <ul className="users-list">
            {users.map((user, index) => (
              <li key={index} className="user-item">
                <span className="user-status online"></span>
                {user === username ? `${user} (You)` : user}
                {typingUsers.has(user) && (
                  <span className="typing-indicator">typing...</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeCodeCompiler;
