import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// Components
import Navbar from "../components/Navbars/ClientNavbar.jsx";
import Footer from "../components/Footers/Footer.jsx";

// Views
import Landing from "../views/client/Landing.jsx";
import Profile from "../views/client/Profile.jsx";

export default function Client() {
  return (
    <>
      <Navbar />
      <main>
        <Switch>
          <Route path="/client/landing" exact component={Landing} />
          <Route path="/client/profile/:id?" exact component={Profile} />
          <Redirect from="/client" to="/client/landing" />
        </Switch>
      </main>
      <Footer />
    </>
  );
}
