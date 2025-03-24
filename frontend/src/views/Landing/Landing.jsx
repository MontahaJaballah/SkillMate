// src/views/Landing/Landing.jsx
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaChalkboardTeacher, FaUsers, FaRocket } from 'react-icons/fa';
import SkillCard from '../../components/SkillCard/SkillCard'; // Import SkillCard for the advertisement

const Landing = () => {
  const features = [
    {
      icon: <FaGraduationCap className="w-8 h-8" />,
      title: "Learn from Experts",
      description: "Access high-quality education from experienced professionals in various fields."
    },
    {
      icon: <FaChalkboardTeacher className="w-8 h-8" />,
      title: "Share Your Knowledge",
      description: "Become a teacher and share your expertise with eager learners worldwide."
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Join the Community",
      description: "Connect with like-minded individuals and grow together in a supportive environment."
    },
    {
      icon: <FaRocket className="w-8 h-8" />,
      title: "Grow Your Skills",
      description: "Enhance your skillset and advance your career with practical knowledge."
    }
  ];

  // Skill cards data (same as in the client landing page, for advertisement purposes)
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

  // Animation variants for the skill cards
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Helmet for SEO */}
      <Helmet>
        <title>SkillMate - Unlock Your Potential</title>
        <meta name="description" content="Connect with expert teachers, learn new skills, and share your knowledge with our growing community of learners." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Unlock Your Potential
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect with expert teachers, learn new skills, and share your knowledge
              with our growing community of learners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/auth/signup"
                  className="btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/auth/signin"
                  className="btn btn-outline border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300"
                >
                  Sign In
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 100 - 50],
                scale: [1, Math.random() + 0.5],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-purple-600 dark:text-purple-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Skills Showcase (Advertisement) */}
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
              Explore Skills You Can Learn
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover the diverse range of skills available on our platform. Sign up to start learning and sharing today!
            </p>
          </motion.div>

          {/* Skills Grid - Responsive Layout (No Search Bar) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="transform hover:scale-105 hover:shadow-lg hover:border-purple-500 transition-all duration-300"
              >
                <SkillCard {...skill} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community today and transform your learning journey.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/auth/signup"
              className="btn bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Join Now
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;