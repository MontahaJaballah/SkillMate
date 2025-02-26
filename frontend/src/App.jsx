import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import AuthProvider from "./components/AuthProvider/AuthProvider";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from 'react-helmet-async';

// Layouts
import Auth from "./layouts/Auth.jsx";
import Client from "./layouts/Client.jsx";
import Admin from "./layouts/Admin.jsx";

// Views
import SignIn from "./views/auth/SignIn/SignIn.jsx";
import SignUp from "./views/auth/SignUp/SignUp.jsx";

export default function App() {
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
            <Route path="/admin" component={Admin} />
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