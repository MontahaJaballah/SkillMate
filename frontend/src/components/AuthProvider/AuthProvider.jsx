import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import axios from "axios";

export const Context = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = "http://localhost:5000/api/auth";

  // Unified error handler for authentication-related errors
  const handleAuthError = (error, defaultMessage = 'Authentication failed') => {
    // Log the full error for debugging
    console.error('Authentication Error:', error);

    // Extract error message
    let errorMessage = defaultMessage;

    if (error.response) {
      // The request was made and the server responded with a status code
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data.error || 'Invalid request';
          break;
        case 401:
          errorMessage = error.response.data.error || 'Email or password is incorrect';
          break;
        case 403:
          errorMessage = error.response.data.error || 'Your account has been blocked.';
          break;
        case 404:
          errorMessage = error.response.data.error || 'Resource not found';
          break;
        case 500:
          errorMessage = error.response.data.error || 'Server error';
          break;
        default:
          errorMessage = error.response.data.error || defaultMessage;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check your network connection.';
    } else if (error.message) {
      // Something happened in setting up the request
      errorMessage = error.message;
    }

    // Display error toast
    toast.error(errorMessage, {
      style: {
        color: "#ff4b4b",
      }
    });

    // Return the error message for potential further handling
    return errorMessage;
  };

  const checkAuthStatus = async () => {
    if (checkAuthStatus.isRunning) return;

    try {
      checkAuthStatus.isRunning = true;

      const response = await axios.get(`${API_BASE_URL}/check`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.user) {
        const isNewLogin = !user && response.data.user;
        setUser(response.data.user);

        if (isNewLogin) {
          toast.success('Successfully logged in!');
        }
      } else {
        setUser(null);
        toast.error('No active user session found.');
      }
    } catch (error) {
      // Detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        const errorMessage = handleAuthError(error, 'Login failed');
        throw new Error(errorMessage);

      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request
        toast.error('Error setting up authentication request.');
        console.error('Auth check error:', error.message);
      }

      setUser(null);
    } finally {
      checkAuthStatus.isRunning = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password
      }, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Update both user state and localStorage
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        toast.success('Successfully logged in!', {
          style: {
            color: "#007456",
          },
          iconTheme: {
            primary: "#007456",
            secondary: "#FFFAEE",
          },
        });
        return response.data;
      }
    } catch (error) {
      // Clear user data on login failure
      setUser(null);
      localStorage.removeItem('user');

      // Check if account is deactivated
      if (error.response?.status === 403) {
        if (error.response?.data?.deactivated) {
          // Return the error for deactivated accounts
          return {
            success: false,
            deactivated: true,
            userId: error.response.data.userId,
            message: error.response.data.message
          };
        } else if (error.response?.data?.blocked) {
          // Handle blocked accounts
          const errorMessage = error.response.data.message || 'Your account has been blocked.';
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      }

      // Use the unified error handler for other errors
      const errorMessage = handleAuthError(error, 'Login failed');
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, userData, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        // Immediately set user and trigger re-render
        const registeredUser = response.data.user;
        setUser(registeredUser);
        localStorage.setItem('user', JSON.stringify(registeredUser));

        // Optional: Force a quick authentication check
        await checkAuthStatus();

        toast.success('Successfully registered!');
        return response.data;
      }
    } catch (error) {
      // Use the unified error handler
      const errorMessage = handleAuthError(error, 'Registration failed');
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout`, {}, {
        withCredentials: true
      });
      setUser(null);
      toast.success('Successfully logged out!', {
        style: {
          color: "#007456",
        },
        iconTheme: {
          primary: "#007456",
          secondary: "#FFFAEE",
        },
      });
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      throw error;
    }
  };

  const handleSocialAuth = (provider) => {
    // Store the current URL to redirect back after auth
    sessionStorage.setItem('redirectUrl', window.location.pathname);
    window.location.href = `${API_BASE_URL}/${provider}`;
  };

  const signOut = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the user state and redirect on error
      setUser(null);
      window.location.href = '/';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    signOut,
    checkAuthStatus,
    // Social auth handlers
    handleLinkedInLogin: () => handleSocialAuth('linkedin'),
    handleLinkedInSignUp: () => handleSocialAuth('linkedin'),
    handleGoogleSignUp: () => handleSocialAuth('google')
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