import { Link, NavLink } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { Context } from "../AuthProvider/AuthProvider";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(Context);
  const [theme, setTheme] = useState(localStorage.getItem("theme") ? localStorage.getItem("theme") : "light");
  const [theme2, setTheme2] = useState(localStorage.getItem("theme2") ? localStorage.getItem("theme2") : "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("theme2", theme2);
    const htmlElement = document.querySelector("html");
    htmlElement.setAttribute("data-theme", theme);
    // Remove all existing classes from the element
    htmlElement.classList.remove(...htmlElement.classList);
    // Add the new class
    htmlElement.classList.add(theme2);
  }, [theme, theme2]);

  const handleSignOut = () => {
    logout()
      .then(() => { })
      .catch((error) => console.log(error));
  };

  const handleThemeChange = (e) => {
    if (e.target.checked) {
      setTheme("night");
      setTheme2("dark");
    } else {
      setTheme("light");
      setTheme2("light");
    }
  };

  const links = (
    <>
      <li>
        <NavLink to="/" exact>Home</NavLink>
      </li>
      <li>
        <NavLink to="/courses">Courses</NavLink>
      </li>
      <li>
        <NavLink to="/teachers">Teachers</NavLink>
      </li>
      <li>
        <NavLink to="/blogs">Blogs</NavLink>
      </li>
    </>
  );

  return (
    <div>
      <div className="navbar justify-center py-6 container mx-auto">
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
              className="menu menu-sm dropdown-content dark:text-white font-semibold mx-2 mt-3 z-[50] p-2 shadow bg-base-100 rounded-box w-52"
            >
              {links}
            </ul>
          </div>
          <div className="hidden lg:flex text-main font-bold items-center">
            <NavLink to="/" className="!flex font-bold items-center">
              <img
                className="w-10 h-10"
                src="https://i.ibb.co/8m1d6zD/Untitled-design.png"
                alt=""
              />
              <p className="text-2xl text-black dark:text-slate-300 font-semibold">
                SkillMate
              </p>
            </NavLink>
          </div>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal dark:text-white font-semibold gap-4 px-1">
            {links}
          </ul>
        </div>
        <div className="navbar-end">
          <label className="cursor-pointer grid place-items-center mr-4">
            <input
              checked={theme === "night"}
              onChange={handleThemeChange}
              type="checkbox"
              value="synthwave"
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
          <div className="dropdown dropdown-bottom dropdown-end">
            <label tabIndex={0} className="">
              {user && (
                <img
                  className="w-12 mr-4 h-12 rounded-full border-2 border-main mb-4 mt-4"
                  src={user?.photoURL}
                  alt=""
                />
              )}
            </label>
            {user && (
              <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-72">
                <img
                  className="w-12 mx-auto rounded-full mb-2 mt-2 border-2 border-main"
                  src={user?.photoURL}
                  alt=""
                />
                <p className="font-semibold text-center mr-2 mb-2 text-main">
                  {user.displayName}
                </p>
                <p className="font-semibold text-center mr-2 mb-2 text-main">
                  {user.email}
                </p>
                <li className="btn w-9/12 mx-auto btn-sm mt-2 btn-outline btn-success">
                  <NavLink to="/client/profile">View Profile</NavLink>
                </li>
                <button className="mx-auto my-2" onClick={handleSignOut}>Sign Out</button>
              </ul>
            )}
          </div>
          {!user && (
            <div className="flex gap-2">
              <Link to="/auth/signin" className="">
                <button className="cursor-pointer rounded-full font-semibold overflow-hidden relative z-100 border border-main group px-4 py-1">
                  <span className="relative z-10 text-main group-hover:text-white text-lg duration-500">
                    Sign In
                  </span>
                  <span className="absolute w-full h-full bg-main -left-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:left-0 duration-500"></span>
                  <span className="absolute w-full h-full bg-main -right-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:right-0 duration-500"></span>
                </button>
              </Link>
              <Link to="/auth/signup" className="">
                <button className="cursor-pointer rounded-full font-semibold overflow-hidden relative z-100 border border-main group px-4 py-1">
                  <span className="relative z-10 text-main group-hover:text-white text-lg duration-500">
                    Sign Up
                  </span>
                  <span className="absolute w-full h-full bg-main -left-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:left-0 duration-500"></span>
                  <span className="absolute w-full h-full bg-main -right-32 top-0 -rotate-45 group-hover:rotate-0 group-hover:right-0 duration-500"></span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;