import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-violet-500 to-pink-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">SkillSwap</h3>
            <p className="text-violet-100">
              Connect, learn, and grow with our community of skilled professionals.
            </p>
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
              <li>Email: contact@skillswap.com</li>
              <li>Phone: +1 234 567 890</li>
              <li>Address: 123 Skill Street, Learning City</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-violet-400">
          <p className="text-center text-violet-100">
            {new Date().getFullYear()} SkillSwap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
