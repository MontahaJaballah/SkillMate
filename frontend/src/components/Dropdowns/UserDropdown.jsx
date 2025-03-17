import React, { useContext, useState, useRef, useEffect } from "react";
import { createPopper } from "@popperjs/core";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../AuthProvider/AuthProvider";
import { getProfilePhotoUrl } from "../Profile/ProfileUtils";

const UserDropdown = () => {
  const { user, signOut } = useContext(Context);
  const navigate = useNavigate();

  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
  const btnDropdownRef = useRef(null);
  const popoverDropdownRef = useRef(null);
  const popperInstanceRef = useRef(null);
  const [photoError, setPhotoError] = useState(false);

  const openDropdownPopover = () => {
    if (btnDropdownRef.current && popoverDropdownRef.current) {
      // Destroy any existing popper instance
      if (popperInstanceRef.current) {
        popperInstanceRef.current.destroy();
      }

      // Create new popper instance
      popperInstanceRef.current = createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
        placement: "bottom-end",
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 10], // Adjust vertical offset
            },
          },
        ],
      });

      setDropdownPopoverShow(true);
    }
  };

  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);

    // Destroy popper instance when closing
    if (popperInstanceRef.current) {
      popperInstanceRef.current.destroy();
      popperInstanceRef.current = null;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(); // This will handle both API call and navigation
      closeDropdownPopover();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Add click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownPopoverShow &&
        btnDropdownRef.current &&
        popoverDropdownRef.current &&
        !btnDropdownRef.current.contains(event.target) &&
        !popoverDropdownRef.current.contains(event.target)
      ) {
        closeDropdownPopover();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownPopoverShow]);

  const handlePhotoError = () => {
    setPhotoError(true);
  };

  const defaultAvatar = "https://demos.creative-tim.com/notus-react/static/media/team-1-800x800.fa5a7ac2.jpg";
  const profilePhotoUrl = photoError ? defaultAvatar : getProfilePhotoUrl(user?.photoURL);

  return (
    <>
      <a
        className="text-gray-600 block"
        href="#pablo"
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <div className="items-center flex">
          <span className="w-12 h-12 text-sm text-white bg-gray-300 inline-flex items-center justify-center rounded-full">
            <img
              alt="User Profile"
              className="w-full rounded-full align-middle border-none shadow-lg"
              src={profilePhotoUrl}
              onError={handlePhotoError}
            />
          </span>
        </div>
      </a>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? "block " : "hidden ") +
          "bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48"
        }
      >
        <div className="px-4 py-2 text-sm text-gray-700">
          <div className="font-medium">{user?.username}</div>
          <div className="text-gray-500 truncate">{user?.email}</div>
        </div>
        <div className="border-t border-gray-200 my-1"></div>
        <Link
          to="/settings"
          className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-800 hover:bg-gray-100"
          onClick={closeDropdownPopover}
        >
          Settings
        </Link>
        <div className="h-0 my-2 border border-solid border-gray-200" />
        <button
          onClick={handleLogout}
          className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-red-600 hover:bg-gray-100 text-left"
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default UserDropdown;
