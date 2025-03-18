import { useState } from "react";
import axios from "axios";
import { config } from "../../config/config";
import HtmlPreviewer from "./HtmlPreviewer";
import "./CodeCompiler.css";

const CodeCompiler = () => {
  const [activeTab, setActiveTab] = useState("backend"); // "backend" or "frontend"
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunCode = async () => {
    if (!code.trim()) {
      setError("Please enter some code to run");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const { data } = await axios.post(`${config.API_URL}/compiler/run`, {
        code,
        language,
      });
      
      setOutput(data.output);
      setError("");
    } catch (error) {
      console.error("Error running code:", error);
      setError(error.response?.data?.message || "Error executing code");
      setOutput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-compiler-container">
      <div className="compiler-header">
        <div className="compiler-tabs">
          <button 
            className={`tab-button ${activeTab === 'backend' ? 'active' : ''}`}
            onClick={() => setActiveTab('backend')}
          >
            Backend Code (JDoodle)
          </button>
          <button 
            className={`tab-button ${activeTab === 'frontend' ? 'active' : ''}`}
            onClick={() => setActiveTab('frontend')}
          >
            Frontend Code (HTML/CSS/JS)
          </button>
        </div>
      </div>

      {activeTab === 'backend' ? (
        <div className="backend-compiler">
          <div className="compiler-controls">
            <select 
              className="language-selector"
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="python">Python 3</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="php">PHP</option>
            </select>
            
            <button 
              className="run-button"
              onClick={handleRunCode}
              disabled={loading}
            >
              {loading ? "Running..." : "Run Code"}
            </button>
          </div>

          <div className="code-editor-container">
            <textarea
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              rows={10}
            />
          </div>

          <div className="output-container">
            <h3>Output:</h3>
            {error && <div className="error-message">{error}</div>}
            <pre className="output-display">{output}</pre>
          </div>
        </div>
      ) : (
        <HtmlPreviewer />
      )}
    </div>
  );
};

export default CodeCompiler;
