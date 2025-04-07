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
      if (error.response) {
        if (error.response.status !== 401) {
          console.error('Auth check error (non-401):', error);
          toast.error("Authentication check failed");
        }
      } else {
        console.error('Auth check error (network issue):', error);
        toast.error("Network error during authentication check");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
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

  useEffect(() => {
    // Skip auth check on landing page
    const isPublicRoute = window.location.pathname === '/';
    if (isPublicRoute) {
      setLoading(false);
      return;
    }

    checkAuthStatus();

    const onFocus = () => {
      if (window.location.pathname !== '/') {
        checkAuthStatus();
      }
    };
    window.addEventListener('focus', onFocus);

    const interval = setInterval(() => {
      if (window.location.pathname !== '/') {
        checkAuthStatus();
      }
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  const handleLinkedInLogin = () => {
    sessionStorage.setItem('redirectUrl', window.location.pathname);
    window.location.href = 'http://localhost:5000/api/auth/linkedin';
  };

  const handleLinkedInSignUp = () => {
    sessionStorage.setItem('redirectUrl', window.location.pathname);
    window.location.href = 'http://localhost:5000/api/auth/linkedin';
  };

  const handleGoogleSignUp = () => {
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
      setUser(null);
      window.location.href = '/';
    }
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
    updateUser
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