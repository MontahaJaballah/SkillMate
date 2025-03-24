import React, { memo, useMemo, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const PrivateRoute = memo(({ component: Component, roles = [] }) => {
  const { user, loading, checkAuthStatus } = useAuth();
  const location = useLocation();
  
  console.log('PrivateRoute render:', { 
    path: location.pathname,
    user: user ? `${user.email} (${user.role})` : 'No user', 
    loading, 
    roles 
  });

  // Run auth check when component mounts
  useEffect(() => {
    console.log('PrivateRoute useEffect triggered', { 
      user: user ? 'User exists' : 'No user', 
      loading 
    });
    
    if (!user && !loading) {
      console.log('Running checkAuthStatus from PrivateRoute');
      checkAuthStatus(true);
    }
  }, [user, loading, checkAuthStatus]);

  // Simple loading spinner
  const loadingSpinner = useMemo(() => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  ), []);

  // Show loading state
  if (loading) {
    console.log('PrivateRoute showing loading spinner');
    return loadingSpinner;
  }

  // Handle unauthenticated users
  if (!user) {
    console.log('PrivateRoute: No authenticated user, redirecting to signin');
    return <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />;
  }

  // Check role-based access for the specific route
  if (roles.length > 0 && !roles.includes(user.role)) {
    console.log('PrivateRoute: User role not authorized', { 
      userRole: user.role, 
      requiredRoles: roles 
    });
    
    toast.error(`Access denied. Required role: ${roles.join(', ')}`);
    // Redirect to appropriate dashboard based on role
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/client/landing';
    return <Navigate to={redirectPath} state={{ 
      from: location.pathname,
      error: `You are not authorized to access this page. Required roles: ${roles.join(', ')}`
    }} replace />;
  }

  console.log('PrivateRoute: Rendering protected component', { 
    component: Component.displayName || Component.name || 'Unknown' 
  });
  
  // Render the protected component
  return <Component />;
});

PrivateRoute.displayName = 'PrivateRoute';

PrivateRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string)
};

export default PrivateRoute;