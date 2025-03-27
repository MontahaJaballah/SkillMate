import React from 'react';
import ChessSidebar from '../../../components/Chess/ChessSidebar';

const ChessChallengesView = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <ChessSidebar />
      <div className="flex-1 ml-64 p-6">
        <h1 className="text-4xl font-bold mb-6">Chess Challenges</h1>
        <p>Solve chess puzzles and challenges to improve your game. (Coming Soon!)</p>
      </div>
    </div>
  );
};

export default ChessChallengesView;