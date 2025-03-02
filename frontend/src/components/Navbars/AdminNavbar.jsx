import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import UserDropdown from "../Dropdowns/UserDropdown.jsx";

export default function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [theme2, setTheme2] = useState(localStorage.getItem('theme2') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('theme2', theme2);
    const htmlElement = document.querySelector('html');
    htmlElement.setAttribute('data-theme', theme);

    // Remove all existing classes
    htmlElement.classList.remove(...htmlElement.classList);

    // Add theme classes
    htmlElement.classList.add(theme2);

    // Optional: Add dark mode class for Tailwind
    if (theme === 'night' || theme2 === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [theme, theme2]);

  const handleThemeChange = (e) => {
    if (e.target.checked) {
      setTheme('night');
      setTheme2('dark');
    } else {
      setTheme('light');
      setTheme2('light');
    }
  };

  const getViewName = () => {
    const path = location.pathname;
    const viewName = path.split("/").pop();
    return viewName.charAt(0).toUpperCase() + viewName.slice(1);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-start flex items-center p-4">
        <div className="w-full mx-autp items-center flex justify-between md:flex-nowrap flex-wrap md:px-10 px-4">
          {/* Brand */}
          <h1
            className="text-white text-2xl hidden lg:inline-block font-bold tracking-wider"
          >
            {getViewName() || "Dashboard"}
          </h1>
          {/* Form */}
          <form className="md:flex hidden flex-row flex-wrap items-center lg:ml-auto mr-3">
            <div className="relative flex w-full flex-wrap items-stretch">
              <span className="z-10 h-full leading-snug font-normal absolute text-center text-gray-400 bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search here..."
                className="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 dark:text-white dark:bg-gray-800 relative bg-white rounded text-sm shadow outline-none focus:outline-none focus:ring w-full pl-10"
              />
            </div>
          </form>
          {/* Dark Mode Toggle */}
          <div className="flex items-center mr-4">
            <label className="cursor-pointer grid place-items-center">
              <input
                type="checkbox"
                checked={theme === "night"}
                onChange={handleThemeChange}
                className="toggle theme-controller bg-base-content row-start-1 col-start-1 col-span-2"
              />
              <svg
                className="col-start-1 row-start-1 stroke-base-100 fill-base-100"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
              <svg
                className="col-start-2 row-start-1 stroke-base-100 fill-base-100"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </label>
          </div>
          {/* User */}
          <ul className="flex-col md:flex-row list-none items-center hidden md:flex">
            <UserDropdown />
          </ul>
        </div>
      </nav>
      {/* End Navbar */}
    </>
  );
}
