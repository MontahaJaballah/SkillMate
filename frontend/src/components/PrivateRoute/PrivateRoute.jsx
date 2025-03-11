import React, { useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

const PrivateRoute = ({
  component: Component,
  roles = [],
  ...rest
}) => {
  const { user, loading, checkAuthStatus } = useAuth();

  useEffect(() => {
    // Validate user authentication status on mount
    checkAuthStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        // If no user is logged in, redirect to login
        if (!user) {
          toast.error('Please log in to access this page');
          return (
            <Redirect
              to={{
                pathname: "/auth/signin",
                state: { from: props.location }
              }}
            />
          );
        }

        // If roles are specified, check if user has required role
        const hasRequiredRole = roles.length === 0 || roles.includes(user.role);

        // If user doesn't have required role, redirect
        if (!hasRequiredRole) {
          toast.error(`Access denied. Required role: ${roles.join(', ')}`);
          return (
            <Redirect
              to={{
                pathname: "/unauthorized",
                state: {
                  error: true,
                  message: `Access denied. Required role: ${roles.join(', ')}`,
                  currentRole: user.role
                }
              }}
            />
          );
        }

        // User is authenticated and has required role
        return <Component {...props} />;
      }}
    />
  );
};

PrivateRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string)
};
 
export default PrivateRoute;