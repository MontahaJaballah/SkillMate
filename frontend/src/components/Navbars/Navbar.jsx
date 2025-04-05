import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Context } from "../AuthProvider/AuthProvider";
import UserMenu from "../UserMenu/UserMenu";
import { FaSun, FaMoon, FaSearch } from "react-icons/fa";

const getTabLabel = (tab) => {
  switch (tab) {
    case "landing":
      return "Home";
    case "courses":
      return "Courses";
    default:
      return tab;
  }
};

const Navbar = () => {
  const { user, signOut } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );
  const [activeTab, setActiveTab] = useState("landing");

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    setActiveTab(path || "landing");
  }, [location]);

  const handleToggle = (e) => {
    const newTheme = e.target.checked ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/client/search/${searchQuery}`);
      setSearchQuery("");
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(`/client/${tab}`);
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <nav className="bg-gradient-to-r from-violet-500 to-pink-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/client/landing" className="text-2xl font-bold">
              SkillMate
            </Link>

            {/* Navigation Tabs */}
            <div className="hidden md:flex space-x-1">
              {["landing", "courses"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === tab
                    ? "bg-white/20 font-bold border-b-2 border-white"
                    : "hover:bg-white/10"
                    }`}
                >
                  {getTabLabel(tab)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="hidden md:flex">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-64 px-4 py-1 text-gray-800 bg-white/90 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-300"
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
      </div>
    </nav>
  );
};




export default Navbar;

