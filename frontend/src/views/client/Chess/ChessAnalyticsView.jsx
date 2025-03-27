import React from 'react';
import ChessSidebar from '../../../components/Chess/ChessSidebar';

const ChessAnalyticsView = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <ChessSidebar />
      <div className="flex-1 ml-64 p-6">
        <h1 className="text-4xl font-bold mb-6">Chess Analytics</h1>
        <p>Analyze your games with detailed insights. (Coming Soon!)</p>
      </div>
    </div>
  );
};

export default ChessAnalyticsView;