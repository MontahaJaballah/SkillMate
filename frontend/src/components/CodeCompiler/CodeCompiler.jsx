import { useState } from "react";
import axios from "axios";
import { config } from "../../config/config";
import HtmlPreviewer from "./HtmlPreviewer";
import MonacoEditor from "./MonacoEditor";
import "./CodeCompiler.css";

const LANGUAGES = {
  javascript: {
    name: "JavaScript (Node.js)",
    template: `// Example: Simple function to calculate factorial
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5)); // Output: 120`
  },
  python: {
    name: "Python 3",
    template: `# Example: Simple function to calculate factorial
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5)) # Output: 120`
  },
  java: {
    name: "Java",
    template: `// Example: Simple program to calculate factorial
public class Main {
    public static int factorial(int n) {
        if (n == 0 || n == 1) return 1;
        return n * factorial(n - 1);
    }
    
    public static void main(String[] args) {
        System.out.println(factorial(5)); // Output: 120
    }
}`
  },
  cpp: {
    name: "C++",
    template: `// Example: Simple program to calculate factorial
#include <iostream>
using namespace std;

int factorial(int n) {
    if (n == 0 || n == 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    cout << factorial(5) << endl; // Output: 120
    return 0;
}`
  },
  c: {
    name: "C",
    template: `// Example: Simple program to calculate factorial
#include <stdio.h>

int factorial(int n) {
    if (n == 0 || n == 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    printf("%d\\n", factorial(5)); // Output: 120
    return 0;
}`
  },
  php: {
    name: "PHP",
    template: `<?php
// Example: Simple function to calculate factorial
function factorial($n) {
    if ($n == 0 || $n == 1) return 1;
    return $n * factorial($n - 1);
}

echo factorial(5); // Output: 120
?>`
  }
};

const CodeCompiler = () => {
  const [activeTab, setActiveTab] = useState("backend");
  const [code, setCode] = useState(LANGUAGES.javascript.template);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(LANGUAGES[newLang].template);
    setOutput("");
    setError("");
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setError("Please enter some code to run");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");
    
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-compiler-container">
      <div className="compiler-header">
        <div className="header-content">
          <h2>Code Playground</h2>
          <p>Write, test, and run your code in multiple programming languages</p>
        </div>
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
              <div className="editor-header">
                <label>Code Editor</label>
                <small>Write your {LANGUAGES[language].name} code here</small>
              </div>
              <MonacoEditor
                language={language}
                value={code}
                onChange={setCode}
                height="400px"
              />
            </div>

            <div className="output-container">
              <div className="output-header">
                <h3>Output</h3>
                <small>Program output will appear here</small>
              </div>
              {error && <div className="error-message">{error}</div>}
              {loading && !error && (
                <div className="loading-message">
                  <span className="spinner"></span>
                  Executing code...
                </div>
              )}
              {output && (
                <pre className="output-display">
                  <code>{output}</code>
                </pre>
              )}
              {!output && !error && !loading && (
                <div className="empty-output">
                  Click the "Run Code" button to see your program output
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <HtmlPreviewer />
      )}
    </div>
  );
};

export default CodeCompiler;
