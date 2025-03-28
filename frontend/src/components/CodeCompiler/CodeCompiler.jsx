import { useState, useEffect } from "react";
import axios from "axios";
import { config } from "../../config/config";
import HtmlPreviewer from "./HtmlPreviewer";
import MonacoEditor from "./MonacoEditor";
import "./CodeCompiler.css";

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
  }
};

// Load saved state from localStorage
const loadSavedState = () => {
  try {
    const savedTab = localStorage.getItem('activeTab') || 'backend';
    const savedLanguage = localStorage.getItem('language') || 'javascript';
    const savedBackendCode = localStorage.getItem('backendCode') || LANGUAGES[savedLanguage].template;
    const savedFrontendCode = JSON.parse(localStorage.getItem('frontendCode')) || { html: "", css: "", js: "" };
    const savedOutput = localStorage.getItem('output') || "";
    const savedError = localStorage.getItem('error') || "";
    const savedScore = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : null;
    const savedFeedback = JSON.parse(localStorage.getItem('feedback') || "[]");
    
    return {
      activeTab: savedTab,
      language: savedLanguage,
      backendCode: savedBackendCode,
      frontendCode: savedFrontendCode,
      output: savedOutput,
      error: savedError,
      score: savedScore,
      feedback: savedFeedback
    };
  } catch (error) {
    console.error('Error loading saved state:', error);
    return {
      activeTab: 'backend',
      language: 'javascript',
      backendCode: LANGUAGES.javascript.template,
      frontendCode: { html: "", css: "", js: "" },
      output: "",
      error: "",
      score: null,
      feedback: []
    };
  }
};

const CodeCompiler = ({ expectedOutput, testCases }) => {
  // Initialize state from localStorage
  const savedState = loadSavedState();
  const [activeTab, setActiveTab] = useState(savedState.activeTab);
  const [backendCode, setBackendCode] = useState(savedState.backendCode);
  const [frontendCode, setFrontendCode] = useState(savedState.frontendCode);
  const [language, setLanguage] = useState(savedState.language);
  const [output, setOutput] = useState(savedState.output);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(savedState.error);
  const [score, setScore] = useState(savedState.score);
  const [feedback, setFeedback] = useState(savedState.feedback);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const saveState = () => {
      localStorage.setItem('activeTab', activeTab);
      localStorage.setItem('language', language);
      localStorage.setItem('backendCode', backendCode);
      localStorage.setItem('frontendCode', JSON.stringify(frontendCode));
      localStorage.setItem('output', output);
      localStorage.setItem('error', error);
      if (score !== null) localStorage.setItem('score', score.toString());
      localStorage.setItem('feedback', JSON.stringify(feedback));
    };

    saveState();

    // Add event listener for visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Reload state when tab becomes visible again
        const newState = loadSavedState();
        setOutput(newState.output);
        setError(newState.error);
        setScore(newState.score);
        setFeedback(newState.feedback);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTab, language, backendCode, frontendCode, output, error, score, feedback]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    // Only reset code if it's still the template
    if (backendCode === LANGUAGES[language].template) {
      setBackendCode(LANGUAGES[newLang].template);
    }
    setOutput("");
    setError("");
    setScore(null);
    setFeedback([]);
    
    // Clear feedback from localStorage
    localStorage.removeItem('output');
    localStorage.removeItem('error');
    localStorage.removeItem('score');
    localStorage.removeItem('feedback');
  };

  const handleRunCode = async () => {
    const codeToRun = activeTab === 'backend' ? backendCode : frontendCode;
    
    if (!codeToRun || (typeof codeToRun === 'string' && !codeToRun.trim())) {
      const errorMsg = "Please enter some code to run";
      setError(errorMsg);
      localStorage.setItem('error', errorMsg);
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");
    setScore(null);
    setFeedback([]);
    
    // Clear previous results from localStorage
    localStorage.removeItem('output');
    localStorage.removeItem('error');
    localStorage.removeItem('score');
    localStorage.removeItem('feedback');
    
    try {
      const { data } = await axios.post(`${config.API_URL}/compiler/run`, {
        code: backendCode,
        language,
        expectedOutput
      });
      
      setOutput(data.output);
      setScore(data.score);
      setFeedback(data.feedback);
      
      // Save results to localStorage
      localStorage.setItem('output', data.output);
      localStorage.setItem('score', data.score.toString());
      localStorage.setItem('feedback', JSON.stringify(data.feedback));
      
      if (!data.isCorrect && expectedOutput) {
        const errorMsg = "Your solution's output doesn't match the expected output. Keep trying!";
        setError(errorMsg);
        localStorage.setItem('error', errorMsg);
      }
    } catch (error) {
      console.error("Error running code:", error);
      const errorMsg = error.response?.data?.message || "Error executing code";
      setError(errorMsg);
      localStorage.setItem('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Save current state before switching
    localStorage.setItem('activeTab', tab);
    if (tab === 'backend') {
      localStorage.setItem('backendCode', backendCode);
    } else {
      localStorage.setItem('frontendCode', JSON.stringify(frontendCode));
    }
  };

  return (
    <div className="code-compiler-container">
      <div className="compiler-header">
        <div className="header-content">
          <h2>Code Submission</h2>
          <p>Write and submit your solution</p>
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

      {activeTab === 'backend' ? (
        <div className="backend-compiler">
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
                  Submit Solution
                </>
              )}
            </button>
          </div>

          <div className="code-section">
            <div className="code-editor-container">
              <div className="editor-header">
                <label>Solution Editor</label>
                <small>Write your {LANGUAGES[language].name} solution here</small>
              </div>
              <MonacoEditor
                language={language}
                value={backendCode}
                onChange={(newCode) => {
                  setBackendCode(newCode);
                  localStorage.setItem('backendCode', newCode);
                }}
                height="400px"
              />
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
                  Click "Submit Solution" to evaluate your code
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <HtmlPreviewer 
          code={frontendCode}
          onChange={(newCode) => {
            setFrontendCode(newCode);
            localStorage.setItem('frontendCode', JSON.stringify(newCode));
          }}
        />
      )}
    </div>
  );
};

export default CodeCompiler;
