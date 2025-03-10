import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaCommentAlt } from 'react-icons/fa';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Function to get the full image URL
  const getImageUrl = (photoURL) => {
    if (!photoURL) {
      return 'http://localhost:5000/uploads/photos/default-avatar.png';
    }
    // If the URL is already absolute (starts with http), return it as is
    if (photoURL.startsWith('http')) {
      return photoURL;
    }
    // If it starts with a slash, remove it
    const cleanPath = photoURL.startsWith('/') ? photoURL.slice(1) : photoURL;
    // Prepend the backend URL
    return `http://localhost:5000/${cleanPath}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
      >
        <img
          src={getImageUrl(user?.photoURL)}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
          onError={(e) => {
            e.target.src = 'http://localhost:5000/uploads/photos/default-avatar.png';
          }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <FaUserCircle className="mr-2" />
            View Profile
          </Link>
          
          <Link
            to="/dashboard"
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <FaTachometerAlt className="mr-2" />
            Dashboard
          </Link>

          <Link
            to="/chat"
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <FaCommentAlt className="mr-2 text-violet-400" />
            Chat
          </Link>
          
          <button
            onClick={() => {
              handleSignOut();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;