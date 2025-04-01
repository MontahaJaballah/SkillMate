// src/views/Landing/Landing.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SkillCard from '../../components/SkillCard/SkillCard';
import useAuth from '../../hooks/useAuth'; // Import useAuth to check user state

const Landing = () => {
  const { user } = useAuth(); // Get user from Auth context

  const skills = [
    {
      image: 'http://localhost:5000/uploads/pics/chess.jpeg',
      title: 'Chess Mastery',
      description: 'Learn strategic thinking, tactical play, and advanced chess concepts from experienced players. Develop your game from beginner to master level.'
    },
    {
      image: 'http://localhost:5000/uploads/pics/Cube.jpeg',
      title: 'Rubik\'s Cube',
      description: 'Master the art of solving the Rubik\'s Cube. Learn different methods, improve your speed, and understand cube theory.'
    },
    {
      image: 'http://localhost:5000/uploads/pics/it.jpeg',
      title: 'IT & Programming',
      description: 'Dive into the world of technology. Learn coding, web development, system administration, and more from industry experts.'
    },
    {
      image: 'http://localhost:5000/uploads/pics/music.jpeg',
      title: 'Music & Instruments',
      description: 'Explore music theory, learn to play instruments, or develop your singing skills. Connect with passionate musicians and instructors.'
    },
    {
      image: 'http://localhost:5000/uploads/pics/gym.jpeg',
      title: 'Fitness & Training',
      description: 'Get fit with personalized workout plans, nutrition advice, and professional training techniques. Achieve your fitness goals with expert guidance.'
    },
    {
      image: 'http://localhost:5000/uploads/pics/cook.jpeg',
      title: 'Cooking & Recipes',
      description: 'Discover the art of cooking. Learn recipes, techniques, and culinary skills from professional chefs and home cooks.'
    },
    {
      image: 'http://localhost:5000/uploads/pics/art.jpeg',
      title: 'Art & Painting',
      description: 'Unleash your creativity. Learn painting techniques, color theory, and art history from talented artists.'
    },
    {
      image: 'http://localhost:5000/uploads/pics/language.jpeg',
      title: 'Language Learning',
      description: 'Learn new languages and improve your communication skills. Connect with native speakers and language experts.'
    },
    {
      image: 'http://localhost:5000/uploads/pics/writing.jpeg',
      title: 'Creative Writing',
      description: 'Hone your writing skills. Learn storytelling, poetry, and creative writing techniques from published authors.'
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Filter skills based on search query
  const filteredSkills = skills.filter(skill =>
    skill.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show/hide "Back to Top" button based on scroll position
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

  // Enhanced animation variants
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
      opacity: 1
    }
  };

  const textHoverVariants = {
    rest: {
      scale: 1,
      y: 0,
      color: "#ffffff",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.1,
      y: -5,
      color: "#e879f9",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    rest: {
      scale: 1,
      boxShadow: "0px 0px 0px rgba(0,0,0,0)"
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const welcomeText = "Welcome to SkillMate".split("");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
        {/* Gradient Background with subtle animation */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-pink-500 to-violet-600 animate-gradient-x"></div>
        </motion.div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Text Content Container */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="backdrop-blur-xl bg-white/20 p-8 sm:p-12 rounded-3xl shadow-2xl border border-white/30 max-w-2xl w-full"
          >
            {/* Welcome Text with Hover Effect */}
            <motion.div
              className="flex flex-wrap justify-center mb-8 gap-x-2"
              variants={containerVariants}
            >
              {welcomeText.map((letter, index) => (
                <motion.span
                  key={index}
                  variants={textHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  className="text-2xl sm:text-3xl md:text-3xl font-extrabold text-white inline-block cursor-default relative"
                >
                  {letter === " " ? "\u00A0" : letter}
                  {/* Subtle underline effect on hover */}
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-1 bg-pink-400 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.span>
              ))}
            </motion.div>

            {/* Enhanced Subtitle */}
            <motion.div
              className="bg-gradient-to-r from-gray-900/60 to-violet-900/60 backdrop-blur-md rounded-xl p-6 mb-10 border border-violet-300/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <p className="text-xl sm:text-2xl text-white/90 leading-relaxed font-medium">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-violet-300">
                  Connect
                </span> with skilled professionals,{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-violet-300">
                  exchange
                </span> knowledge, and{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-violet-300">
                  grow
                </span> together in our vibrant learning community.
              </p>
            </motion.div>

            {/* Enhanced Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.div variants={buttonVariants} whileHover="hover">
                <Link
                  to="/auth/signup"
                  className="px-8 py-3 bg-gradient-to-r from-white to-violet-100 text-violet-600 rounded-lg font-semibold transition-all duration-300 text-lg shadow-md"
                  aria-label="Get Started with SkillMate"
                >
                  Get Started
                </Link>
              </motion.div>
              {!user && ( // Only show "Sign In" if user is not logged in
                <motion.div variants={buttonVariants} whileHover="hover">
                  <Link
                    to="/auth/signin"
                    className="px-8 py-3 bg-transparent border-2 border-white/80 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 text-lg"
                    aria-label="Sign In to SkillMate"
                  >
                    Sign In
                  </Link>
                </motion.div>
              )}
              {user && ( // Show "Dashboard" button if user is logged in
                <motion.div variants={buttonVariants} whileHover="hover">
                  <Link
                    to="/client/courses"
                    className="px-8 py-3 bg-transparent border-2 border-white/80 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 text-lg"
                    aria-label="Go to Courses"
                  >
                    Our Courses
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Enhanced Image Container */}
          <motion.div
            className="relative group"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.img
              src="http://localhost:5000/uploads/pics/home.png"
              alt="SkillMate Community"
              className="w-full max-w-[500px] object-cover"
              whileHover={{
                scale: 1.05,
                rotate: 2,
                transition: { duration: 0.4 }
              }}
              loading="lazy"
            />
            {/* Enhanced Hover Overlay */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-violet-500/50 to-pink-500/50 opacity-0 rounded-xl overflow-hidden"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.p
                className="text-white text-xl sm:text-2xl font-bold text-center px-6"
                initial={{ y: 20, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                Join me to learn & teach skills together!
              </motion.p>
            </motion.div>
            {/* Animated Decorative Elements */}
            <motion.div
              className="absolute -top-6 -right-6 w-28 h-28 bg-violet-400/30 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-6 -left-6 w-36 h-36 bg-pink-400/30 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </section>

      {/* Skills Showcase */}
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
              Featured Skills to Exchange
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover the diverse range of skills you can learn and teach on our platform.
              Each card represents an opportunity to grow and share your knowledge.
            </p>
          </motion.div>

          {/* Search Bar (for skills only) */}
          <div className="flex justify-center mb-12">
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              aria-label="Search skills"
            />
          </div>

          {/* Skills Grid - Responsive Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="transform hover:scale-105 hover:shadow-lg hover:border-violet-500 transition-all duration-300"
              >
                <SkillCard {...skill} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-violet-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our community today and start exchanging skills with passionate learners and teachers.
            </p>
            <Link
              to="/auth/signup"
              className="inline-block px-8 py-3 bg-white text-violet-600 rounded-lg font-semibold hover:bg-violet-100 transition-all duration-300 text-lg transform hover:scale-105 hover:shadow-lg"
              aria-label="Join SkillMate Now"
            >
              Join Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-3 bg-violet-500 text-white rounded-full shadow-lg hover:bg-violet-600 transition-all duration-300"
          aria-label="Back to Top"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Landing;