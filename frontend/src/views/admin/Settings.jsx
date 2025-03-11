import React, { useState, useEffect } from "react";
import useAxios from "../../hooks/useAxios";
import { useContext } from "react";
import { Context } from "../../components/AuthProvider/AuthProvider";
import { useHistory } from "react-router-dom";

export default function Settings() {
  const { user } = useContext(Context);

  // Debug logging for user context
  useEffect(() => {
    console.log('Current user context:', user);
    if (!user) {
      console.warn('User context is null or undefined');
    }
  }, [user]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
  });
  const [notification, setNotification] = useState(null);
  const axiosInstance = useAxios();
  const history = useHistory();

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      setNotification({
        message: 'User not found. Please log in again.',
        type: "error"
      });
      return;
    }

    try {
      const response = await axiosInstance.put(`/users/updateadmin/${user._id}`, formData);

      setNotification({
        message: response.data.message || 'Profile updated successfully!',
        type: "success"
      });

      // Optional: Update user context or reload user data
      // You might want to implement a method in AuthProvider to update user data

      // Optional redirect or refresh
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile.';
      setNotification({
        message: errorMessage,
        type: "error"
      });
    }
  };

  return (
    <>
      <div className="flex flex-wrap bg-gray-100 dark:bg-gray-900 min-h-screen py-4">
        <div className="w-full lg:w-8/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-0">
            <div className="rounded-t bg-white dark:bg-gray-800 mb-0 px-6 py-6">
              <div className="text-center flex justify-between">
                <h6 className="text-gray-900 dark:text-white text-xl font-heading font-bold">My Account</h6>
              </div>
            </div>

            {notification && (
              <div className={`mb-4 mx-4 p-4 rounded ${notification.type === 'success'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                }`}>
                {notification.message}
              </div>
            )}

            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <form onSubmit={handleSubmit}>
                <h6 className="text-gray-600 dark:text-gray-400 text-sm mt-3 mb-6 font-heading font-bold uppercase">
                  User Information
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-gray-600 dark:text-gray-400 text-xs font-heading font-bold mb-2"
                        htmlFor="username"
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className="border-0 px-3 py-3 placeholder-gray-300 dark:placeholder-gray-500 text-gray-600 dark:text-white bg-white dark:bg-gray-700 rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-gray-600 dark:text-gray-400 text-xs font-heading font-bold mb-2"
                        htmlFor="email"
                      >
                        Email address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="border-0 px-3 py-3 placeholder-gray-300 dark:placeholder-gray-500 text-gray-600 dark:text-white bg-white dark:bg-gray-700 rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-gray-600 dark:text-gray-400 text-xs font-heading font-bold mb-2"
                        htmlFor="firstName"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="border-0 px-3 py-3 placeholder-gray-300 dark:placeholder-gray-500 text-gray-600 dark:text-white bg-white dark:bg-gray-700 rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-gray-600 dark:text-gray-400 text-xs font-heading font-bold mb-2"
                        htmlFor="lastName"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="border-0 px-3 py-3 placeholder-gray-300 dark:placeholder-gray-500 text-gray-600 dark:text-white bg-white dark:bg-gray-700 rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-gray-600 dark:text-gray-400 text-xs font-heading font-bold mb-2"
                        htmlFor="phoneNumber"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        className="border-0 px-3 py-3 placeholder-gray-300 dark:placeholder-gray-500 text-gray-600 dark:text-white bg-white dark:bg-gray-700 rounded text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary w-full ease-linear transition-all duration-150"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        pattern="^\+?[0-9\s\-]+$"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end px-4 lg:px-10 py-4">
                  <button
                    type="submit"
                    className="bg-primary text-white active:bg-primary-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-4/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full mb-6 shadow-lg rounded-lg">
            <div className="px-6">
              <div className="flex flex-wrap justify-center">
                <div className="w-full px-4 flex justify-center">
                  <div className="relative">
                    <img
                      alt="..."
                      src="/img/team-2-800x800.jpg"
                      className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                    />
                  </div>
                </div>
                <div className="w-full px-4 text-center mt-20">
                  <div className="flex justify-center py-4 lg:pt-4 pt-8">
                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-gray-600 dark:text-gray-300">22</span>
                      <span className="text-sm text-gray-400 dark:text-gray-500">Projects</span>
                    </div>
                    <div className="mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-gray-600 dark:text-gray-300">10</span>
                      <span className="text-sm text-gray-400 dark:text-gray-500">Mentees</span>
                    </div>
                    <div className="lg:mr-4 p-3 text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-gray-600 dark:text-gray-300">89</span>
                      <span className="text-sm text-gray-400 dark:text-gray-500">Reviews</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-12">
                <h3 className="text-xl font-heading font-semibold leading-normal mb-2 text-gray-700 dark:text-gray-300">
                  Jesse Lucky
                </h3>
                <div className="text-sm leading-normal mt-0 mb-2 text-gray-400 dark:text-gray-500 font-bold uppercase">
                  <i className="fas fa-map-marker-alt mr-2 text-lg text-gray-400 dark:text-gray-500"></i>{" "}
                  New York, United States
                </div>
                <div className="mb-2 text-gray-600 dark:text-gray-400">
                  <i className="fas fa-briefcase mr-2 text-lg text-gray-400 dark:text-gray-500"></i>
                  UI/UX Designer - Senior Mentor
                </div>
                <div className="mb-2 text-gray-600 dark:text-gray-400">
                  <i className="fas fa-university mr-2 text-lg text-gray-400 dark:text-gray-500"></i>
                  University of Computer Science
                </div>
              </div>
              <div className="mt-10 py-10 border-t border-gray-200 dark:border-gray-600 text-center">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-9/12 px-4">
                    <p className="mb-4 text-lg leading-relaxed text-gray-700 dark:text-gray-400">
                      An experienced designer who loves to share knowledge and help others grow in their careers.
                      Specialized in creating beautiful and functional user interfaces.
                    </p>
                    <a
                      href="#pablo"
                      className="font-normal text-primary hover:text-primary-600 transition-colors duration-300"
                      onClick={(e) => e.preventDefault()}
                    >
                      Show more
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}