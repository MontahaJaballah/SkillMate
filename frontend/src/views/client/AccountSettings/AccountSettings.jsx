import React from "react";
import { Helmet } from "react-helmet-async";
import DeactivateAccount from "../../../components/AccountSettings/DeactivateAccount";
import useAuth from "../../../hooks/useAuth";

const AccountSettings = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700 dark:text-gray-300">Please log in to access account settings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>SkillMate | Account Settings</title>
      </Helmet>
      
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-main mb-8">Account Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Account Information Section */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-main mb-6">Account Information</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Name</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Email</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Phone</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {user.phoneNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Account Status</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deactivation Section */}
          <div className="md:col-span-1">
            <DeactivateAccount />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
