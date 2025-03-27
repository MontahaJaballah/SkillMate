import React from 'react';
import ChessSidebar from '../../../components/Chess/ChessSidebar';

const LiveChessBattlesView = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <ChessSidebar />
      <div className="flex-1 ml-64 p-6">
        <h1 className="text-4xl font-bold mb-6">Live Chess Battles</h1>
        <p>Challenge other players in real-time chess matches. (Coming Soon!)</p>
      </div>
    </div>
  );
};

export default LiveChessBattlesView;