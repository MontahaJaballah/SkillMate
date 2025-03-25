import { useState, useEffect } from "react";
import MonacoEditor from "./MonacoEditor";
import "./HtmlPreviewer.css";

const HtmlPreviewer = () => {
  const [html, setHtml] = useState(
    `<!-- Example: Try this sample code! -->
<div class="container">
  <h1>Welcome!</h1>
  <button id="btn">Click me</button>
  <p id="output"></p>
</div>`
  );
  
  const [css, setCss] = useState(
    `.container {
  text-align: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}

button {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px 0;
}

button:hover {
  background: #45a049;
}`
  );
  
  const [js, setJs] = useState(
    `document.getElementById('btn').addEventListener('click', () => {
  const output = document.getElementById('output');
  output.textContent = 'Button clicked at: ' + new Date().toLocaleTimeString();
});`
  );
  
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPreview(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              ${css}
            </style>
          </head>
          <body>
            ${html}
            <script>
              try {
                ${js}
              } catch (error) {
                console.error('Script error:', error);
                document.body.innerHTML += '<div style="color: red; padding: 10px; margin-top: 10px; border: 1px solid red;">Error: ' + error.message + '</div>';
              }
            </script>
          </body>
        </html>
      `);
    }, 500);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  return (
    <div className="html-previewer">
      <div className="editors-panel">
        <div className="editor-tabs">
          <div className="editor-section">
            <div className="editor-header">
              <label>HTML</label>
              <small>Structure your content</small>
            </div>
            <MonacoEditor
              language="html"
              value={html}
              onChange={setHtml}
              height="250px"
            />
          </div>

          <div className="editor-section">
            <div className="editor-header">
              <label>CSS</label>
              <small>Style your content</small>
            </div>
            <MonacoEditor
              language="css"
              value={css}
              onChange={setCss}
              height="250px"
            />
          </div>

          <div className="editor-section">
            <div className="editor-header">
              <label>JavaScript</label>
              <small>Add interactivity</small>
            </div>
            <MonacoEditor
              language="javascript"
              value={js}
              onChange={setJs}
              height="250px"
            />
          </div>
        </div>
      </div>

      <div className="preview-panel">
        <div className="preview-header">
          <h3>Live Preview</h3>
          <small>Real-time output</small>
        </div>
        <iframe
          title="Live Preview"
          srcDoc={preview}
          sandbox="allow-scripts allow-modals allow-popups allow-same-origin"
          className="preview-frame"
        />
      </div>
    </div>
  );
};

export default HtmlPreviewer;
