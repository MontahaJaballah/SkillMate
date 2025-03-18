import React from "react";
import CodeCompiler from "../../../components/CodeCompiler/CodeCompiler.jsx";

const CodeCompilerPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Code Playground</h1>
      <p className="text-center mb-8 text-gray-600">
        Write, test, and run your code in multiple programming languages
      </p>
      <CodeCompiler />
    </div>
  );
};

export default CodeCompilerPage;
