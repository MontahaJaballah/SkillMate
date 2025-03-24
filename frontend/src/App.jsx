// src/App.jsx
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
import PublicLanding from "./views/Landing/Landing"; // Import PublicLanding

// Root component to handle redirects based on auth state
const RootRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("RootRedirect - User:", user?.email, "Role:", user?.role, "Loading:", loading);
    console.log("Current location:", location.pathname);
    
    if (loading) return;

    // Only redirect if we're at the exact root path
    if (location.pathname === '/') {
      if (user) {
        // Redirect based on user role
        if (user.role === 'admin') {
          console.log("Redirecting admin to admin dashboard");
          navigate('/admin/dashboard', { replace: true });
        } else {
          console.log("Redirecting client user to client landing");
          navigate('/client/landing', { replace: true });
        }
      }
      // If no user, do nothing here; we'll render the PublicLanding below
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

  // If the user is not authenticated, render the PublicLanding page
  // If the user is authenticated, they will be redirected by the useEffect above
  return <PublicLanding />;
};

// Main App component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth/*" element={<Auth />} />

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

      {/* Root redirect based on auth state */}
      <Route path="/" element={<RootRedirect />} />
      
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