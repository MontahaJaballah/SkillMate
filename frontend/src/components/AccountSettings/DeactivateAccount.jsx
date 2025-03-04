import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Context } from '../AuthProvider/AuthProvider';
import { useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DeactivateAccount = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useContext(Context);
  const history = useHistory();

  const handleDeactivate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('http://localhost:5000/api/users/deactivate', 
        { 
          userId: user._id,
          phoneNumber 
        },
        { withCredentials: true }
      );
      
      toast.success('Account deactivated successfully');
      await logout();
      history.push('/auth/signin');
    } catch (error) {
      console.error('Deactivation error:', error);
      toast.error(error.response?.data?.message || 'Failed to deactivate account');
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Deactivate Account</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Warning: Deactivating your account will temporarily disable access to your content and profile.
        You can reactivate it later by logging in and verifying your phone number.
      </p>

      {!isConfirmOpen ? (
        <button
          onClick={() => setIsConfirmOpen(true)}
          className="btn btn-error w-full text-white"
        >
          Deactivate Account
        </button>
      ) : (
        <form onSubmit={handleDeactivate} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text dark:text-gray-200">Phone Number</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number (e.g., +1234567890)"
              pattern="^\+[1-9]\d{1,14}$"
              className="input bg-transparent dark:text-slate-300 border border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
              required
            />
            <label className="label">
              <span className="label-text-alt text-gray-500">Use international format with + (e.g., +1234567890)</span>
            </label>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="btn btn-error flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm Deactivation'}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              className="btn btn-ghost flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DeactivateAccount;
