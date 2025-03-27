import React from 'react';
import ChessSidebar from '../../../components/Chess/ChessSidebar';

const AILearningView = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <ChessSidebar />
      <div className="flex-1 ml-64 p-6">
        <h1 className="text-4xl font-bold mb-6">AI Learning</h1>
        <p>Leverage AI to enhance your chess skills. (Coming Soon!)</p>
      </div>
    </div>
  );
};

export default AILearningView;