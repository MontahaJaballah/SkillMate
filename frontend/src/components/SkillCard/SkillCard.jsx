import React, { useState } from 'react';
import ReactCardFlip from 'react-card-flip';
import { motion } from 'framer-motion';

const SkillCard = ({ image, title, description }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error(`Failed to load image: ${image}`);
    setImageError(true);
  };

  const getBackgroundColor = (title) => {
    const colors = {
      'Chess Mastery': 'from-blue-500 to-purple-500',
      'Rubik\'s Cube': 'from-green-500 to-blue-500',
      'IT & Programming': 'from-purple-500 to-pink-500',
      'Music & Instruments': 'from-pink-500 to-red-500',
      'Fitness & Training': 'from-red-500 to-orange-500'
    };
    return colors[title] || 'from-violet-500 to-pink-500';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
        {/* Front Side - Image */}
        <div 
          className={`relative w-72 h-96 rounded-xl overflow-hidden shadow-xl cursor-pointer bg-gradient-to-r ${getBackgroundColor(title)}`}
          onMouseEnter={() => setIsFlipped(true)}
        >
          {!imageError ? (
            <img 
              src={image} 
              alt={title} 
              onError={handleImageError}
              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">
                  {title === 'Chess Mastery' && '♟️'}
                  {title === 'Rubik\'s Cube' && '🎲'}
                  {title === 'IT & Programming' && '💻'}
                  {title === 'Music & Instruments' && '🎵'}
                  {title === 'Fitness & Training' && '💪'}
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        </div>

        {/* Back Side - Description */}
        <div 
          className={`w-72 h-96 rounded-xl shadow-xl cursor-pointer bg-gradient-to-r ${getBackgroundColor(title)} p-6 flex flex-col items-center justify-center text-center`}
          onMouseLeave={() => setIsFlipped(false)}
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
            <p className="text-white/90 text-lg leading-relaxed">
              {description}
            </p>
            <button className="mt-6 px-6 py-2 bg-white text-violet-600 rounded-lg font-semibold hover:bg-violet-100 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </ReactCardFlip>
    </motion.div>
  );
};

export default SkillCard;
