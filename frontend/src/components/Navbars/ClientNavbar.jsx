import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Menu } from '@headlessui/react';

export default function ClientNavbar() {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      history.push(`/client/search/${searchQuery}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav className="top-0 fixed z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg bg-white shadow">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <Link
              to="/client"
              className="text-gray-800 text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase"
            >
              SkillMate
            </Link>
            <button
              className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
          <div
            className={
              "lg:flex flex-grow items-center bg-white lg:bg-opacity-0 lg:shadow-none" +
              (navbarOpen ? " block" : " hidden")
            }
            id="example-navbar-warning"
          >
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-grow max-w-lg mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
            <Menu as="ul" className="flex flex-col lg:flex-row list-none lg:ml-auto">
              <Menu.Item>
                <Link
                  to="/client/profile"
                  className="text-gray-800 hover:text-gray-600 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                >
                  <i className="fas fa-user-circle text-lg leading-lg text-gray-500"/>
                  <span className="lg:hidden inline-block ml-2">Profile</span>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link
                  to="/admin"
                  className="text-gray-800 hover:text-gray-600 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                >
                  <i className="fas fa-cog text-lg leading-lg text-gray-500"/>
                  <span className="lg:hidden inline-block ml-2">Admin</span>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link
                  to="/chat"
                  className="text-gray-800 hover:text-gray-600 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                >
                  <i className="fas fa-comment-alt text-lg leading-lg text-gray-500"/>
                  <span className="lg:hidden inline-block ml-2">Chat</span>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link
                  to="/auth/login"
                  className="text-gray-800 hover:text-gray-600 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
                >
                  <i className="fas fa-sign-out-alt text-lg leading-lg text-gray-500"/>
                  <span className="lg:hidden inline-block ml-2">Logout</span>
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Link
                  to="/chat"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Chat
                </Link>
              </Menu.Item>
            </Menu>
          </div>
        </div>
      </nav>
    </>
  );
}
