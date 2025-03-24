import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthProvider from "./components/AuthProvider/AuthProvider";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import { HelmetProvider } from 'react-helmet-async';
import useAuth from "./hooks/useAuth";

// Layouts
import Auth from "./layouts/Auth.jsx";
import Client from "./layouts/Client.jsx";
import Admin from "./layouts/Admin.jsx";

// Views
import Landing from "./views/Landing/Landing.jsx";

// Root component to handle redirects based on auth state
const RootRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("RootRedirect - User:", user?.email, "Role:", user?.role, "Loading:", loading);
    console.log("Current location:", location.pathname);
    
    if (loading) return;

    // Redirect authenticated users based on role, but only if they're not on the landing page
    if (user && location.pathname !== '/') {
      if (user.role === 'admin') {
        console.log("Redirecting admin to admin dashboard");
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log("Redirecting client user to client landing");
        navigate('/client/landing', { replace: true });
      }
    }
  }, [user, loading, navigate, location]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Render the Landing page for the root path
  return <Landing />;
};

// Main App component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/" element={<RootRedirect />} /> {/* Render Landing for unauthenticated users */}

      {/* Protected routes */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute
            component={Admin}
            roles={["admin"]}
          />
        }
      />
      
      {/* Client routes */}
      <Route
        path="/client/*"
        element={
          <PrivateRoute
            component={Client}
            roles={["user", "student", "teacher"]}
          />
        }
      />

      {/* Redirect non-client paths to client paths */}
      <Route path="/profile" element={<Navigate to="/client/profile" replace />} />
      <Route path="/dashboard" element={<Navigate to="/client/dashboard" replace />} />
      <Route path="/chat" element={<Navigate to="/client/chat" replace />} />
      <Route path="/settings" element={<Navigate to="/client/settings" replace />} />
      <Route path="/courses" element={<Navigate to="/client/courses" replace />} />
      <Route path="/teachers" element={<Navigate to="/client/teachers" replace />} />
      <Route path="/blogs" element={<Navigate to="/client/blogs" replace />} />
      <Route path="/contact" element={<Navigate to="/client/contact" replace />} />
      <Route path="/search/:query" element={<Navigate to={`/client/search/${location.pathname.split('/').pop()}`} replace />} />

      {/* Catch-all redirect to client landing */}
      <Route path="*" element={<Navigate to="/client/landing" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}