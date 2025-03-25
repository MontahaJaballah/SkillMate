import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

export const Context = createContext();

// Configure axios defaults for all requests
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000/api';

// Define public routes at the top level so they can be used throughout the component
const publicRoutes = ['/auth/signin', '/auth/signup', '/client/landing'];

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
          const currentPath = window.location.pathname;
          
          // Don't show error or redirect on auth/check for public routes
          const isAuthCheck = error.config.url === '/auth/check';
          if (!publicRoutes.includes(currentPath) && !isAuthCheck) {
            localStorage.removeItem('user');
            setAuthState(prev => ({ ...prev, user: null }));
            navigate('/auth/signin', { replace: true });
            toast.error('Please sign in to access this feature.');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  // Verify token on mount but don't redirect if on public routes
  useEffect(() => {
    const verifyToken = async () => {
      const currentPath = window.location.pathname;

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
          
          // Only redirect if not on public routes
          if (!publicRoutes.includes(currentPath)) {
            navigate('/auth/signin', { replace: true });
          }
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
        
        // Do not redirect on 401 errors for public routes
        if (!publicRoutes.includes(currentPath) && error.response?.status === 401) {
          navigate('/auth/signin', { replace: true });
        }
      }
    };

    verifyToken();
  }, [navigate]);

  const checkAuthStatus = useCallback(async (showErrors = false) => {
    const currentPath = window.location.pathname;
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
        if (showErrors && !publicRoutes.includes(currentPath)) {
          toast.error('Authentication failed');
        }
        localStorage.removeItem('user');
        setAuthState(prev => ({ ...prev, user: null, loading: false }));
        return false;
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status !== 401 && showErrors && !publicRoutes.includes(currentPath)) {
          console.error('Auth check error (non-401):', error);
          toast.error("Authentication check failed");
        }
      } else if (showErrors && !publicRoutes.includes(currentPath)) {
        console.error('Auth check error (network issue):', error);
        toast.error("Network error during authentication check");
      }
      
      localStorage.removeItem('user');
      setAuthState(prev => ({ ...prev, user: null, loading: false }));
      return false;
    }
  }, []);

  const updateUser = (userData) => {
    setAuthState(prev => ({ ...prev, user: userData }));
  };

  const signUpUser = async (userData) => {
    try {
      const response = await axios.post('/auth/signup', userData);
      const { user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState(prev => ({ 
        ...prev, 
        user,
        loading: false,
        isNavigating: true 
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      await axios.post('/auth/signout');
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      localStorage.removeItem('user');
      setAuthState(prev => ({ 
        ...prev, 
        user: null,
        loading: false,
        isNavigating: true 
      }));
      navigate('/client/landing', { replace: true });
    }
  }, [navigate]);

  const signInUser = useCallback(async (email, password) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const response = await axios.post('/auth/signin', {
        email,
        password,
      });

      const { user } = response.data;
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
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error signing out');
      setAuthState(prev => ({ ...prev, user: null }));
      window.location.href = '/';
    }
  }, [logout]);

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

  useEffect(() => {
    // Skip auth check on landing page
    const isPublicRoute = window.location.pathname === '/';
    if (isPublicRoute) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }

    checkAuthStatus();

    const onFocus = () => {
      if (window.location.pathname !== '/') {
        checkAuthStatus(true); // Only show errors on focus
      }
    };
    window.addEventListener('focus', onFocus);

    const interval = setInterval(() => {
      if (window.location.pathname !== '/') {
        checkAuthStatus(); // No errors shown for periodic checks
      }
    }, 15 * 60 * 1000); // Increase interval to 15 minutes

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [checkAuthStatus]);

  const contextValue = useMemo(() => ({
    ...authState,
    signInUser,
    signOut,
    handleLinkedInLogin,
    handleLinkedInSignUp,
    handleGoogleSignUp,
    updateUser,
    signUpUser,
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