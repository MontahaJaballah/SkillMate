import React from "react";
import Editor from "@monaco-editor/react";

const MonacoEditor = ({ language, value, onChange, height = "300px" }) => {
  const handleEditorChange = (value) => {
    onChange(value);
  };

  return (
    <Editor
      height={height}
      language={language}
      theme="vs-dark"
      value={value}
      onChange={handleEditorChange}
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
