import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import axios from "axios";

export const Context = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = "http://localhost:5000/api/auth";

  const checkAuthStatus = async () => {
    try {
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
      }
    } catch (error) {
      // Only log error if it's not a 401 (unauthorized)
      if (error.response?.status !== 401) {
        console.error('Auth check error:', error);
      }
      setUser(null);
    } finally {
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
        setUser(response.data.user);
        toast.success('Successfully logged in!');
        return response.data;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Failed to login');
      throw error;
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
        setUser(response.data.user);
        toast.success('Successfully registered!');
        return response.data;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Failed to register');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout`, {}, {
        withCredentials: true
      });
      setUser(null);
      toast.success('Successfully logged out!');
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
      toast.error('Error signing out');
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