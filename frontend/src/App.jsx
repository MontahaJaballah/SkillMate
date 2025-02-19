import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

// Layouts
import Auth from "./layouts/Auth.jsx";
import Client from "./layouts/Client.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        {/* Add routes with layouts */}
        <Route path="/client" component={Client} />
        <Route path="/auth" component={Auth} />
        {/* Redirect to client layout by default */}
        <Redirect from="/" to="/client" />
      </Switch>
    </BrowserRouter>
  );
}