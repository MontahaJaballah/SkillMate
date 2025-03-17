import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import UserDropdown from "../Dropdowns/UserDropdown";

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth/signin');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white dark:bg-gray-800 flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          {/* Toggler */}
          <button
            className="cursor-pointer text-gray-900 dark:text-white opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white dark:bg-gray-800 m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>
          {/* Brand */}
          <Link
            className="md:block text-left md:pb-2 text-gray-900 dark:text-white mr-0 inline-block whitespace-nowrap text-sm uppercase font-heading font-bold p-4 px-0"
            to="/admin"
          >
            SkillMate Admin
          </Link>
          {/* User */}
          <ul className="md:hidden items-center flex flex-wrap list-none">
            <li className="inline-block relative">
              <UserDropdown />
            </li>
          </ul>
          {/* Collapse */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Collapse header */}
            <div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex flex-wrap">
                <div className="w-6/12">
                  <Link
                    className="md:block text-left md:pb-2 text-gray-900 dark:text-white mr-0 inline-block whitespace-nowrap text-sm uppercase font-heading font-bold p-4 px-0"
                    to="/admin"
                  >
                    SkillMate Admin
                  </Link>
                </div>
                <div className="w-6/12 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-gray-900 dark:text-white opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                    onClick={() => setCollapseShow("hidden")}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-heading font-bold block " +
                    (location.pathname.indexOf("/admin/dashboard") !== -1
                      ? "text-primary hover:text-primary-600"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white")
                  }
                  to="/admin/dashboard"
                >
                  <i className={
                    "fas fa-tv mr-2 text-sm " +
                    (location.pathname.indexOf("/admin/dashboard") !== -1
                      ? "opacity-75"
                      : "text-gray-300 dark:text-gray-500")
                  }></i>{" "}
                  Dashboard
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-heading font-bold block " +
                    (location.pathname.indexOf("/admin/users") !== -1
                      ? "text-primary hover:text-primary-600"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white")
                  }
                  to="/admin/users"
                >
                  <i className={
                    "fas fa-users mr-2 text-sm " +
                    (location.pathname.indexOf("/admin/users") !== -1
                      ? "opacity-75"
                      : "text-gray-300 dark:text-gray-500")
                  }></i>{" "}
                  Users
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className={
                    "text-xs uppercase py-3 font-heading font-bold block " +
                    (location.pathname.indexOf("/admin/admins") !== -1
                      ? "text-primary hover:text-primary-600"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white")
                  }
                  to="/admin/admins"
                >
                  <i className={
                    "fas fa-user-shield mr-2 text-sm " +
                    (location.pathname.indexOf("/admin/admins") !== -1
                      ? "opacity-75"
                      : "text-gray-300 dark:text-gray-500")
                  }></i>{" "}
                  Admins
                </Link>
              </li>

              {/* Divider */}
              <hr className="my-4 md:min-w-full border-gray-200 dark:border-gray-600" />

              {/* Heading */}
              <h6 className="md:min-w-full text-gray-600 dark:text-gray-400 text-xs uppercase font-heading font-bold block pt-1 pb-4 no-underline">
                My Account
              </h6>

              {/* Navigation */}
              <ul className="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
                <li className="items-center">
                  <Link
                    className={
                      "text-xs uppercase py-3 font-heading font-bold block " +
                      (location.pathname.indexOf("/admin/settings") !== -1
                        ? "text-primary hover:text-primary-600"
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white")
                    }
                    to="/admin/settings"
                  >
                    <i className={
                      "fas fa-tools mr-2 text-sm " +
                      (location.pathname.indexOf("/admin/settings") !== -1
                        ? "opacity-75"
                        : "text-gray-300 dark:text-gray-500")
                    }></i>{" "}
                    Settings
                  </Link>
                </li>

                <li className="items-center mt-auto">
                  <button
                    onClick={handleLogout}
                    className="text-xs uppercase py-3 font-heading font-bold block text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white w-full text-left"
                  >
                    <i className="fas fa-sign-out-alt mr-2 text-sm text-gray-300 dark:text-gray-500"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}