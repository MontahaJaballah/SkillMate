import React, { useEffect } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import AuthProvider from "./components/AuthProvider/AuthProvider";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from 'react-helmet-async';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

// Layouts
import Auth from "./layouts/Auth.jsx";
import Client from "./layouts/Client.jsx";
import Admin from "./layouts/Admin.jsx";

// Views
import SignIn from "./views/auth/SignIn/SignIn.jsx";
import SignUp from "./views/auth/SignUp/SignUp.jsx";

export default function App() {
  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedTheme2 = localStorage.getItem('theme2') || 'light';
    const htmlElement = document.querySelector('html');

    // Set theme attributes
    htmlElement.setAttribute('data-theme', savedTheme);

    // Remove all existing classes
    htmlElement.classList.remove(...htmlElement.classList);

    // Add theme classes
    htmlElement.classList.add(savedTheme2);

    // Optional: Add dark mode class for Tailwind
    if (savedTheme === 'night' || savedTheme2 === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" reverseOrder={false} />
          <Switch>
            {/* Auth Routes */}
            <Route path="/auth/signin" exact component={SignIn} />
            <Route path="/auth/signup" exact component={SignUp} />

            {/* Layout Routes */}
            {/* Protected Admin Routes */}
            <PrivateRoute
              path="/admin"
              component={Admin}
              roles={['admin']}
            />
            <Route path="/client" component={Client} />
            <Route path="/auth" component={Auth} />

            {/* Redirect to client layout by default */}
            <Redirect from="/" to="/client" />
          </Switch>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}