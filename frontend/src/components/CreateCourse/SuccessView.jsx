import React from 'react';
import { Check } from 'lucide-react';

const SuccessView = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 mb-6">
            <Check size={40} />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Your course has been submitted successfully.
          </h1>
          <p className="text-gray-400 mb-6">
            We will review your item shortly. You will be informed by email that your course has been accepted. Also, make sure your{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              Payment and Tax information
            </a>{' '}
            is correct and valid.
          </p>
          <a href="/" className="text-blue-400 hover:text-blue-300">
            Back to Homepage
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
          <div className="text-left">
            <h2 className="text-xl font-bold mb-4">Company</h2>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">About us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">News and Blogs</a></li>
            </ul>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold mb-4">Community</h2>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Forum</a></li>
            </ul>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold mb-4">Teaching</h2>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Become a teacher</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">How to guide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Terms & Conditions</a></li>
            </ul>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold mb-4">Contact</h2>
            <p className="text-gray-400">Toll free: +1234 568 963</p>
            <p className="text-gray-400">(9:AM to 8:PM IST)</p>
            <p className="text-gray-400">Email: example@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessView;