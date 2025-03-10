import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

const DeactivateAccount = () => {
  const { user, deactivateAccount } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleDeactivateRequest = () => {
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setPhoneNumber("");
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await deactivateAccount(user._id, phoneNumber);
      toast.success("Account deactivated successfully. You will be logged out.");
      
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Deactivation error:", error);
      toast.error(error.response?.data?.error || "Failed to deactivate account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Deactivate Account</h2>
      
      {!showConfirmation ? (
        <div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Deactivating your account will temporarily disable your profile and all associated data.
            You can reactivate your account at any time by logging in with your credentials.
          </p>
          <button
            onClick={handleDeactivateRequest}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Deactivate Account
          </button>
        </div>
      ) : (
        <form onSubmit={handleDeactivate} className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Please confirm your phone number. This will be used to verify your identity
            if you wish to reactivate your account in the future.
          </p>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text dark:text-gray-200">Phone Number</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="input bg-transparent dark:text-slate-300 border border-black focus:border-dashed focus:outline-none focus:border-main focus:ring-0"
              required
            />
            <span className="text-xs text-gray-500 mt-1">
              Enter in international format (e.g., +1234567890)
            </span>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Deactivation"}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
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
