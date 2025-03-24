import { useContext, useEffect } from 'react';
import { Context } from '../components/AuthProvider/AuthProvider';

const useAuth = () => {
  const context = useContext(Context);
  
  useEffect(() => {
    if (!context) {
      console.error('AuthContext is undefined - useAuth must be used within an AuthProvider');
    } else {
      console.log('Auth context state:', {
        user: context.user ? `User ${context.user.email} (${context.user.role})` : 'No user',
        loading: context.loading,
        initialized: context.initialized
      });
    }
  }, [context]);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
