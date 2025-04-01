import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const MonacoEditor = ({ 
  language, 
  value, 
  onChange, 
  height = "300px", 
  onCursorChange,
  cursorPositions = {},
  username,
  typingUsers = new Set()
}) => {
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorChange = (value) => {
    onChange(value);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Set up cursor position change event
    if (onCursorChange) {
      editor.onDidChangeCursorPosition((event) => {
        onCursorChange({
          lineNumber: event.position.lineNumber,
          column: event.position.column
        });
      });
    }
  };

  // Update decorations when cursor positions change
  useEffect(() => {
    if (editorRef.current && Object.keys(cursorPositions).length > 0) {
      const newDecorations = [];
      
      Object.entries(cursorPositions).forEach(([user, position]) => {
        // Skip current user's cursor
        if (user === username) return;
        
        // Generate a consistent color for each user
        const hash = hashCode(user);
        const color = getColorFromHash(hash);
        const isTyping = typingUsers.has(user);
        
        // Create a cursor decoration
        newDecorations.push({
          range: new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column + 1
          ),
          options: {
            className: `cursor-marker-${hash}`,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          }
        });
        
        // Create a label decoration above the cursor
        newDecorations.push({
          range: new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          options: {
            beforeContentClassName: isTyping ? `cursor-label-typing-${hash}` : `cursor-label-${hash}`,
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          }
        });
        
        // Add dynamic styles for this user's cursor
        addCursorStyle(hash, color, user);
      });
      
      // Apply the decorations
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        newDecorations
      );
    }
    
    // Cleanup function
    return () => {
      if (editorRef.current) {
        decorationsRef.current = editorRef.current.deltaDecorations(
          decorationsRef.current,
          []
        );
      }
    };
  }, [cursorPositions, username, typingUsers]);

  // Helper function to generate a hash code from a string
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 6);
  };

  // Generate a color from a hash
  const getColorFromHash = (hash) => {
    // Use the hash to generate a hue value (0-360)
    const hue = parseInt(hash, 16) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Add dynamic styles for cursor
  const addCursorStyle = (hash, color, user) => {
    // Check if style already exists
    const styleId = `cursor-style-${hash}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .cursor-marker-${hash} {
          background-color: ${color};
          width: 2px !important;
          opacity: 0.8;
        }
        
        .cursor-label-${hash}::before {
          content: "${user}";
          position: absolute;
          top: -20px;
          left: -2px;
          background: ${color};
          color: white;
          font-size: 10px;
          padding: 2px 4px;
          border-radius: 3px;
          white-space: nowrap;
          z-index: 100;
        }
        
        .cursor-label-typing-${hash}::before {
          content: "${user} typing...";
          position: absolute;
          top: -20px;
          left: -2px;
          background: ${color};
          color: white;
          font-size: 10px;
          padding: 2px 4px;
          border-radius: 3px;
          white-space: nowrap;
          z-index: 100;
          font-weight: bold;
        }
        
        .cursor-label-typing-${hash}::after {
          content: '';
          position: absolute;
          width: 4px;
          height: 4px;
          background-color: ${color};
          border-radius: 50%;
          left: 50%;
          bottom: -10px;
          transform: translateX(-50%);
          animation: blink 0.8s infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  return (
    <Editor
      height={height}
      language={language}
      theme="vs-dark"
      value={value}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        lineNumbers: "on",
        renderLineHighlight: "all",
        quickSuggestions: true,
      }}
    />
  );
};

export default MonacoEditor;
