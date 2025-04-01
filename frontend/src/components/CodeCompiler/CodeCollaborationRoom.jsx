import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CollaborativeCodeCompiler from "./CollaborativeCodeCompiler";
import "./CodeCompiler.css";

const CodeCollaborationRoom = () => {
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams();
  
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState(urlRoomId || "");
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState("");
  
  // Check for user info in localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    const savedRoomId = localStorage.getItem("roomId");
    
    if (savedUsername) {
      setUsername(savedUsername);
    }
    
    // If URL has roomId, prioritize it over saved roomId
    if (urlRoomId) {
      setRoomId(urlRoomId);
      // If we also have username, auto-join the room
      if (savedUsername) {
        setIsJoined(true);
      }
    } 
    // Don't auto-join or redirect when on the main collaboration page
    // This allows users to create new rooms even if they have a saved room
  }, [urlRoomId, navigate]);
  
  const generateRoomId = () => {
    // Generate a random 6-character room ID
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setRoomId(result);
  };
  
  const handleJoinRoom = () => {
    if (!username.trim()) {
      setError("Please enter your name");
      return;
    }
    
    if (!roomId.trim()) {
      setError("Please enter a room ID or generate one");
      return;
    }
    
    // Save username and roomId for future sessions
    localStorage.setItem("username", username);
    localStorage.setItem("roomId", roomId);
    
    // Join the room
    setIsJoined(true);
    setError("");
    
    // Update URL with room ID without reloading the page
    navigate(`/client/code-collaboration/${roomId}`, { replace: true });
  };
  
  const handleLeaveRoom = () => {
    // Clear stored room data
    localStorage.removeItem("roomId");
    // Keep username for convenience
    
    setIsJoined(false);
    navigate("/client/code-collaboration", { replace: true });
  };
  
  if (!isJoined) {
    return (
      <div className="code-collaboration-container">
        <div className="collaboration-join-panel">
          <h2>Code Collaboration</h2>
          <p>Work together on code in real-time with other students and teachers</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Your Name</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="form-input"
            />
          </div>
          
          <div className="collaboration-options">
            <div className="option-section create-room">
              <h3>Create a New Room</h3>
              <p>Start a new collaborative coding session</p>
              <div className="room-id-input-group">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Room ID (optional)"
                  className="form-input"
                />
                <button 
                  className="generate-room-button"
                  onClick={generateRoomId}
                  title="Generate random room ID"
                >
                  🔄
                </button>
              </div>
              <button 
                className="create-room-button"
                onClick={handleJoinRoom}
                disabled={!username.trim()}
              >
                Create Room
              </button>
            </div>
            
            <div className="option-divider">
              <span>OR</span>
            </div>
            
            <div className="option-section join-room">
              <h3>Join an Existing Room</h3>
              <p>Enter a Room ID to join an ongoing session</p>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="form-input"
              />
              <button 
                className="join-room-button"
                onClick={handleJoinRoom}
                disabled={!username.trim() || !roomId.trim()}
              >
                Join Room
              </button>
            </div>
          </div>
          
          <div className="collaboration-info">
            <h3>How it works</h3>
            <ul>
              <li>Create a new room or join an existing one with a Room ID</li>
              <li>Share the Room ID with others to collaborate</li>
              <li>All changes to code are synchronized in real-time</li>
              <li>Run code and see results directly in the editor</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <CollaborativeCodeCompiler
      roomId={roomId}
      username={username}
      onLeaveRoom={handleLeaveRoom}
    />
  );
};

export default CodeCollaborationRoom;
