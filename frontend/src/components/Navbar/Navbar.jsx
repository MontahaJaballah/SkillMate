import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Context } from "../../components/AuthProvider/AuthProvider";
import { useEffect, useState } from "react";
import UserMenu from "../UserMenu/UserMenu";
import { FaSun, FaMoon, FaSearch } from "react-icons/fa";

const Navbar = () => {
  const { user, signOut } = useContext(Context);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );

  const handleToggle = (e) => {
    const newTheme = e.target.checked ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${searchQuery}`);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const navItems = (
    <>
      <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "text-main font-bold" : "hover:text-main duration-300"
          }
        >
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/courses"
          className={({ isActive }) =>
            isActive ? "text-main font-bold" : "hover:text-main duration-300"
          }
        >
          Courses
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/teachers"
          className={({ isActive }) =>
            isActive ? "text-main font-bold" : "hover:text-main duration-300"
          }
        >
          Teachers
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/blogs"
          className={({ isActive }) =>
            isActive ? "text-main font-bold" : "hover:text-main duration-300"
          }
        >
          Blogs
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive ? "text-main font-bold" : "hover:text-main duration-300"
          }
        >
          Contact
        </NavLink>
      </li>
    </>
  );

  const handleSignOut = () => {
    signOut()
      .then(() => {})
      .catch((error) => console.log(error));
  };

  return (
    <nav className="bg-gradient-to-r from-violet-500 to-pink-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">
              SkillMate
            </Link>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full px-4 py-2 text-gray-800 bg-white/90 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-violet-600"
              >
                <FaSearch />
              </button>
            </div>
          </form>

          <div className="flex items-center space-x-4">
            {user ? (
              <UserMenu user={user} signOut={signOut} />
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth/signin"
                  className="text-white hover:text-violet-200 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="bg-white text-violet-600 px-4 py-2 rounded-lg hover:bg-violet-100 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            <label className="swap swap-rotate">
              <input
                type="checkbox"
                onChange={handleToggle}
                checked={theme === "dark"}
              />
              <div className="swap-on text-yellow-300">
                <FaSun size={20} />
              </div>
              <div className="swap-off text-gray-200">
                <FaMoon size={20} />
              </div>
            </label>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;