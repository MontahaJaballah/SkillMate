import React from "react";
import { useParams } from "react-router-dom";
import CodeCollaborationRoom from "../../../components/CodeCompiler/CodeCollaborationRoom.jsx";
import "../../../components/CodeCompiler/CollaborativeCodeCompiler.css";

const CodeCollaborationPage = () => {
  const { roomId } = useParams();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Code Collaboration</h1>
      <p className="text-center mb-8 text-gray-600">
        Collaborate on code in real-time with other students and teachers
      </p>
      <CodeCollaborationRoom />
    </div>
  );
};

export default CodeCollaborationPage;
