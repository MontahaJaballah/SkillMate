import React from 'react';
import ChessMentor from '../../../components/Chess/ChessMentor';
import ChessSidebar from '../../../components/Chess/ChessSidebar';

const ChessMentorView = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <ChessSidebar />
      <div className="flex-1 ml-64 p-6">
        <h1 className="text-4xl font-bold mb-6">Chess Mentor</h1>
        <ChessMentor />
      </div>
    </div>
  );
};

export default ChessMentorView;