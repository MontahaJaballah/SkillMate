import React from "react";
import { Helmet } from "react-helmet-async";
import DeactivateAccount from "../../../components/AccountSettings/DeactivateAccount";
import { useContext } from "react";
import { Context } from "../../../components/AuthProvider/AuthProvider";

const AccountSettings = () => {
  const { user } = useContext(Context);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Please log in to access account settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>SkillMate | Account Settings</title>
      </Helmet>
      
      <h1 className="text-3xl font-bold text-main mb-8">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Account Information Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-main mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium">{user.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Account Status</p>
                <p className="font-medium">
                  <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800">
                    Active
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          {/* Deactivate Account Section */}
          <DeactivateAccount />
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
