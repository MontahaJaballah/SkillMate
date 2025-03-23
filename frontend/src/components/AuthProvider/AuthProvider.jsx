import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import axios from "axios";

export const Context = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/check', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      setUser(response.data.user);
    } catch (error) {
      // Don't show error toast for unauthorized status
      if (error.response?.status !== 401) {
        toast.error("Authentication check failed");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true
      });
      setUser(null);
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  // Check auth status on mount and periodically
  useEffect(() => {
    checkAuthStatus();

    // Check auth status when window gains focus
    const onFocus = () => checkAuthStatus();
    window.addEventListener('focus', onFocus);

    // Check auth status every 5 minutes
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  const handleLinkedInLogin = () => {
    // Store the current URL to redirect back after login
    sessionStorage.setItem('redirectUrl', window.location.pathname);
    window.location.href = 'http://localhost:5000/api/auth/linkedin';
  };

  const handleLinkedInSignUp = () => {
    // Store the current URL to redirect back after signup
    sessionStorage.setItem('redirectUrl', window.location.pathname);
    window.location.href = 'http://localhost:5000/api/auth/linkedin';
  };

  const handleGoogleSignUp = () => {
    // Store the current URL to redirect back after signup
    sessionStorage.setItem('redirectUrl', window.location.pathname);
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleGoogleSignIn = () => {
    // Store the current URL to redirect back after signin
    sessionStorage.setItem('redirectUrl', window.location.pathname);
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const signUpUser = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', userData, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json'
        }
      });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const signInUser = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signin', credentials, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error signing out');
      // Still clear the user state and redirect on error
      setUser(null);
      window.location.href = '/';
    }
  };

  // Account deactivation
  const deactivateAccount = async (userId, phoneNumber) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/deactivate',
        { userId, phoneNumber },
        {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data.success) {
        await signOut();
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Request reactivation code
  const sendReactivationCode = async (userId, phoneNumber) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reactivate/request',
        { userId, phoneNumber },
        {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      // In development mode, show the verification code
      if (response.data.verificationCode) {
        toast.success(`Development mode - Verification code: ${response.data.verificationCode}`, {
          duration: 10000 // Show for 10 seconds
        });
      }

      return response.data;
    } catch (error) {
      console.error('Send reactivation code error:', error);
      throw error;
    }
  };

  // Verify code and reactivate account
  const verifyAndReactivate = async (userId, verificationCode) => {
    const response = await axios.post('http://localhost:5000/api/auth/reactivate/verify',
      { userId, verificationCode },
      {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.data.success) {
      setUser(response.data.user);
    }
    return response.data;
  };

  const value = {
    user,
    loading,
    signUpUser,
    signInUser,
    signOut,
    handleLinkedInLogin,
    handleLinkedInSignUp,
    handleGoogleSignUp,
    handleGoogleSignIn,
    deactivateAccount,
    sendReactivationCode,
    verifyAndReactivate
  };

  return (
    <Context.Provider value={value}>
      {!loading && children}
    </Context.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export default AuthProvider;