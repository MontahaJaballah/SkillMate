import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// Components
import Navbar from "../components/Navbars/ClientNavbar.jsx";
import Footer from "../components/Footers/Footer.jsx";
import Chatbot from "../components/Chatbot/Chatbot.jsx";

// Views
import Landing from "../views/client/Landing.jsx";
import Profile from "../views/client/Profile.jsx";
import SearchResults from "../views/client/SearchResults.jsx";

export default function Client() {
  return (
    <>
      <Navbar />
      <main>
        <Switch>
          <Route path="/client/landing" exact component={Landing} />
          <Route path="/client/profile/:id?" exact component={Profile} />
          <Route path="/client/search/:query" exact component={SearchResults} />
          <Redirect from="/client" to="/client/landing" />
        </Switch>
      </main>
      <Footer />
      <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
        <Chatbot />
      </div>
    </>
  );
}
