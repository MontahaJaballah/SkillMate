import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ChessSidebar = () => {
  const location = useLocation();

  const chessOptions = [
    {
      title: 'Chess Mentor (AI Learning)',
      link: '/chess/mentor'
    },
    {
      title: 'Live Chess Battles',
      link: '/chess/live-battles'
    },
    {
      title: 'Chess Challenges',
      link: '/chess/challenges'
    },
    {
      title: 'Chess Analytics',
      link: '/chess/analytics'
    },
    {
      title: 'AI Learning',
      link: '/chess/ai-learning'
    },
    {
      title: 'Puzzle Mode',
      link: '/chess/puzzles' 
    }
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-purple-800 to-pink-800 text-white p-6 shadow-lg z-30">
      <h2 className="text-2xl font-bold mb-6">Chess Sections</h2>
      <ul className="space-y-4">
        {chessOptions.map((option, index) => (
          <li key={index}>
            <Link
              to={option.link}
              className={`block px-4 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === option.link
                  ? 'bg-white/20 text-white font-semibold'
                  : 'hover:bg-white/10'
              }`}
            >
              {option.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChessSidebar;