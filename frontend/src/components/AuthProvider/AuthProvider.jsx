import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

export const Context = createContext();

// Configure axios defaults for all requests
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000/api';

// Initialize auth state from localStorage
const getInitialState = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    return {
      user,
      loading: true,
      initialized: false,
      isNavigating: false
    };
  } catch (error) {
    console.error('Error initializing auth state:', error);
    return {
      user: null,
      loading: true,
      initialized: false,
      isNavigating: false
    };
  }
};

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getInitialState);
  const navigate = useNavigate();

  // Add response interceptor to handle auth errors
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Only clear if not already on signin page
          if (window.location.pathname !== '/auth/signin') {
            localStorage.removeItem('user');
            setAuthState(prev => ({ ...prev, user: null }));
            navigate('/auth/signin', { replace: true });
            toast.error('Session expired. Please sign in again.');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        console.log('Verifying token...');
        const response = await axios.get('/auth/check');
        
        if (response.data.isAuthenticated && response.data.user) {
          const userData = response.data.user;
          console.log('User authenticated:', userData);
          localStorage.setItem('user', JSON.stringify(userData));
          setAuthState(prev => ({
            ...prev,
            user: userData,
            loading: false,
            initialized: true
          }));
        } else {
          console.log('No authenticated user found');
          localStorage.removeItem('user');
          setAuthState(prev => ({ 
            ...prev, 
            user: null,
            loading: false,
            initialized: true
          }));
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('user');
        setAuthState(prev => ({ 
          ...prev, 
          user: null,
          loading: false,
          initialized: true
        }));
      }
    };

    verifyToken();
  }, []);

  const checkAuthStatus = useCallback(async (showErrors = false) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const response = await axios.get('/auth/check');
      
      if (response.data.isAuthenticated && response.data.user) {
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        setAuthState(prev => ({
          ...prev,
          user: userData,
          loading: false
        }));
        return true;
      } else {
        if (showErrors) {
          toast.error('Authentication failed');
        }
        localStorage.removeItem('user');
        setAuthState(prev => ({ ...prev, user: null, loading: false }));
        return false;
      }
    } catch (error) {
      if (showErrors) {
        toast.error(error.response?.data?.error || 'Authentication failed');
      }
      
      localStorage.removeItem('user');
      setAuthState(prev => ({ ...prev, user: null, loading: false }));
      return false;
    }
  }, []);

  const signInUser = useCallback(async ({ email, password }) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const response = await axios.post('/auth/signin', {
        email,
        password,
      });

      const { user } = response.data;
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState(prev => ({ 
        ...prev, 
        user,
        loading: false,
        isNavigating: true 
      }));
      
      return { user };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      await axios.post('/auth/signout');
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      // Clear user data
      localStorage.removeItem('user');
      
      setAuthState(prev => ({ 
        ...prev, 
        user: null,
        loading: false,
        isNavigating: true 
      }));
      
      navigate('/auth/signin', { replace: true });
    }
  }, [navigate]);

  const sendReactivationCode = useCallback(async (userId, phoneNumber) => {
    try {
      const response = await axios.post('/auth/reactivate/request', {
        userId,
        phoneNumber
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reactivation code');
      throw error;
    }
  }, []);

  const verifyAndReactivate = useCallback(async (userId, code) => {
    try {
      const response = await axios.post('/auth/reactivate/verify', {
        userId,
        code
      });
      
      if (response.data.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setAuthState(prev => ({ 
          ...prev, 
          user: response.data.user,
          isNavigating: true 
        }));
      }
      
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to verify code');
      throw error;
    }
  }, []);

  // Reset navigation state after navigation is complete
  useEffect(() => {
    if (authState.isNavigating) {
      setAuthState(prev => ({ ...prev, isNavigating: false }));
    }
  }, [authState.isNavigating]);

  const contextValue = useMemo(() => ({
    ...authState,
    signInUser,
    signOut,
    sendReactivationCode,
    verifyAndReactivate,
    checkAuthStatus
  }), [authState, signInUser, signOut, sendReactivationCode, verifyAndReactivate, checkAuthStatus]);

  // Show loading spinner while checking auth status on initial load
  if (authState.loading && !authState.initialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export default AuthProvider;