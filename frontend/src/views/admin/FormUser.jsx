import React, { useState, useEffect } from "react";
import useAxios from "../../hooks/useAxios";
import { useHistory, useLocation } from "react-router-dom";

const FormUser = () => {
  const location = useLocation();
  const admin = location.state?.admin;
  const isEditMode = !!admin;
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
  });

  // Load admin data when component mounts
  useEffect(() => {
    if (admin) {
      setFormData({
        username: admin.username || '',
        email: admin.email || '',
        phoneNumber: admin.phoneNumber || '',
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
      });
    }
  }, [admin]);

  const [notification, setNotification] = useState(null);
  const history = useHistory();
  const axiosInstance = useAxios();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (isEditMode) {
        response = await axiosInstance.put(`/users/updateadmin/${admin._id}`, formData);
      } else {
        response = await axiosInstance.post('/users/addsubadmin', {
          ...formData,
          sendCredentials: true
        });
      }

      setNotification({
        message: response.data.message || `Admin ${isEditMode ? 'updated' : 'created'} successfully!`,
        type: "success"
      });

      // Redirect after a short delay to show the notification
      setTimeout(() => {
        history.push("/admin/admins");
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} admin.`;
      setNotification({
        message: errorMessage,
        type: "error"
      });
    }
  };

  return (
    <div className="w-full lg:w-8/12 px-4 bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-0">
        <div className="rounded-t bg-white dark:bg-gray-800 mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-gray-900 dark:text-white text-xl font-heading font-bold">
              {isEditMode ? 'Edit Admin Account' : 'Create Admin Account'}
            </h6>
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          {notification && (
            <div className={`mb-4 p-4 rounded ${notification.type === 'success'
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              }`}>
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h6 className="text-gray-600 dark:text-gray-400 text-sm mt-3 mb-6 font-heading font-bold uppercase">
              User Information
            </h6>

            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4 mb-3">
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

              <div className="w-full lg:w-6/12 px-4 mb-3">
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

            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4 mb-3">
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

              <div className="w-full lg:w-6/12 px-4 mb-3">
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

            <div className="flex flex-wrap mb-6">
              <div className="w-full lg:w-6/12 px-4">
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
                  required
                  pattern="^\+?[0-9\s\-]+$"
                />
              </div>
            </div>

            {!isEditMode && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  <i className="fas fa-info-circle mr-2"></i>
                  A secure password will be automatically generated and sent to the admin's email address.
                </p>
              </div>
            )}

            <div className="text-center flex justify-end mt-6">
              <button
                className="bg-primary text-white active:bg-primary-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="submit"
              >
                {isEditMode ? 'Update Admin' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormUser;