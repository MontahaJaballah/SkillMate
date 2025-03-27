import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import chessWorldBg from "/src/assets/chess-world-bg.jpg";

const ChessHome = () => {
  const chessFeatures = [
    {
      image: 'http://localhost:5000/uploads/pics/chess-mentor.jpg',
      title: 'Chess Mentor',
      description: 'Learn chess with AI-driven guidance. Improve your strategy and tactics with personalized lessons.',
      link: '/chess/mentor'
    },
    {
      image: 'http://localhost:5000/uploads/pics/live-chess-battles.jpg',
      title: 'Live Chess Battles',
      description: 'Challenge other players in real-time chess matches. Test your skills and climb the leaderboard.',
      link: '/chess/live-battles'
    },
    {
      image: 'http://localhost:5000/uploads/pics/chess-challenges.jpg',
      title: 'Chess Challenges',
      description: 'Solve chess puzzles and challenges to sharpen your mind and improve your game.',
      link: '/chess/challenges'
    },
    {
      image: 'http://localhost:5000/uploads/pics/chess-analytics.jpg',
      title: 'Chess Analytics',
      description: 'Analyze your games with detailed insights. Understand your strengths and weaknesses.',
      link: '/chess/analytics'
    },
    {
      image: 'http://localhost:5000/uploads/pics/ai-learning.jpg',
      title: 'AI Learning',
      description: 'Leverage AI to enhance your chess skills with advanced training and simulations.',
      link: '/chess/ai-learning'
    }
  ];

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Hero Section */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center bg-cover bg-center overflow-hidden py-20"
        style={{ backgroundImage: `url(${chessWorldBg})` }}
      >
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <div className="relative z-20 text-center text-white p-5 max-w-2xl">
          <motion.h1
            className="text-5xl font-bold text-shadow-lg animate-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome to the World of Chess Mastery
          </motion.h1>
          <motion.p
            className="text-xl mt-5 text-shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Step into a magical realm where chess comes alive! Learn, battle, and conquer in a universe of strategy and wonder.
          </motion.p>
        </div>
      </section>

      {/* Chess Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Chess Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Dive into a variety of chess experiences designed to enhance your skills and enjoyment.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {chessFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                  onError={(e) => console.log(`Failed to load image: ${feature.image}`)}
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  <Link
                    to={feature.link}
                    className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                  >
                    Visit
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Master Chess?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our chess community today and elevate your game to new heights.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/chess/mentor"
              className="btn bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300"
          aria-label="Back to Top"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default ChessHome;