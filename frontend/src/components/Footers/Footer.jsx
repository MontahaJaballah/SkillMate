import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-violet-500 to-pink-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">SkillMate</h3>
            <p className="text-violet-100">
              Connect, learn, and grow with our community of skilled professionals.
            </p>
            {/* Social Media Links */}
            <div className="mt-6">
              <motion.a
                href="https://www.instagram.com/skillmate0?igshid=djRkeDF0anZrc3B1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-white hover:text-violet-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaInstagram className="w-6 h-6" />
                <span className="text-sm">Follow us on Instagram</span>
              </motion.a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-violet-100 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/auth/signup" className="text-violet-100 hover:text-white transition-colors">
                  Join Now
                </Link>
              </li>
              <li>
                <Link to="/auth/signin" className="text-violet-100 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-violet-100">
              <li>Email: contact@skillmate.com</li>
              <li>Phone: +1 234 567 890</li>
              <li>Address: 123 Skill Street, Learning City</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-violet-400">
          <p className="text-center text-violet-100">
            {new Date().getFullYear()} SkillMate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
