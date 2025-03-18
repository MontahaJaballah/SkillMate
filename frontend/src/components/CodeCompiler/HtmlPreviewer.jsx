import { useState, useEffect } from "react";
import "./HtmlPreviewer.css";

const HtmlPreviewer = () => {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [preview, setPreview] = useState("");

  // Combine and update the preview with a delay
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
      <div className="editor-container">
        <div className="editor-section">
          <label>HTML</label>
          <textarea
            className="code-input"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Enter HTML code here..."
          />
        </div>

        <div className="editor-section">
          <label>CSS</label>
          <textarea
            className="code-input"
            value={css}
            onChange={(e) => setCss(e.target.value)}
            placeholder="Enter CSS code here..."
          />
        </div>

        <div className="editor-section">
          <label>JavaScript</label>
          <textarea
            className="code-input"
            value={js}
            onChange={(e) => setJs(e.target.value)}
            placeholder="Enter JavaScript code here..."
          />
        </div>
      </div>

      <div className="preview-container">
        <h3>Live Preview</h3>
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
