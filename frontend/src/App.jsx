import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import AuthProvider from "./components/AuthProvider/AuthProvider";

// Layouts
import Auth from "./layouts/Auth.jsx";
import Client from "./layouts/Client.jsx";
import Admin from "./layouts/Admin.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Switch>
          <Route path="/admin" component={Admin} />
          <Route path="/client" component={Client} />
          <Route path="/auth" component={Auth} />
          {/* Redirect to client layout by default */}
          <Redirect from="/" to="/client" />
        </Switch>
      </BrowserRouter>
    </AuthProvider>
  );
}