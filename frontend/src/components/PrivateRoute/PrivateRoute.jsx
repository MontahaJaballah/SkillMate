import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import useAuth from "../../hooks/useAuth";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return children;
  }

  return <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node,
};

export default PrivateRoute;
