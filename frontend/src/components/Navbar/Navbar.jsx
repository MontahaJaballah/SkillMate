import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { Context } from "../../components/AuthProvider/AuthProvider";
import { useEffect, useState } from "react";
import UserMenu from "../UserMenu/UserMenu";
import { FaSun, FaMoon } from "react-icons/fa";

const Navbar = () => {
  const { user, signOut } = useContext(Context);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );

  const handleToggle = (e) => {
    const newTheme = e.target.checked ? "dark" : "light";
    setTheme(newTheme);
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
    <div className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="navbar justify-between py-6 container mx-auto px-4">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 dark:bg-gray-800"
            >
              {navItems}
            </ul>
          </div>
          <Link
            to="/"
            className="text-2xl font-bold text-main dark:text-white"
          >
            SkillMate
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-6">{navItems}</ul>
        </div>
        <div className="navbar-end flex items-center gap-4">
          <label className="swap swap-rotate">
            <input
              type="checkbox"
              onChange={handleToggle}
              checked={theme === "dark"}
              className="hidden"
            />
            <FaSun className="swap-on h-5 w-5 text-yellow-500" />
            <FaMoon className="swap-off h-5 w-5 text-gray-600" />
          </label>

          {user ? (
            <UserMenu handleSignOut={handleSignOut} />
          ) : (
            <div className="flex gap-2">
              <Link
                to="/auth/signin"
                className="btn btn-ghost dark:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                className="btn btn-primary"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;