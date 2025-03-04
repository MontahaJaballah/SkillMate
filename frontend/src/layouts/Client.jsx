import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import PrivateRoute from '../components/PrivateRoute/PrivateRoute';

// Components
import Navbar from "../components/Navbars/ClientNavbar.jsx";
import Footer from "../components/Footers/Footer.jsx";
import Chatbot from "../components/Chatbot/Chatbot.jsx";

// Views
import Landing from "../views/client/Landing.jsx";
import Profile from "../views/client/Profile.jsx";
import SearchResults from "../views/client/SearchResults.jsx";
import ChatPage from "../views/client/ChatPage/ChatPage.jsx";
import AffiliateProgram from "../views/client/AffiliateProgram.jsx";
import AccountSettings from "../views/client/AccountSettings/AccountSettings.jsx";

export default function Client() {
  return (
    <>
      <Navbar />
      <main>
        <Switch>
          <Route path="/client/landing" exact component={Landing} />
          <PrivateRoute
            path="/client/profile/:id?"
            exact component={Profile}
            roles={['student', 'teacher']}
          />
          <PrivateRoute
            path="/client/affiliate"
            exact component={AffiliateProgram}
            roles={['teacher']}
          />
          <PrivateRoute
            path="/client/account-settings"
            exact component={AccountSettings}
            roles={['student', 'teacher']}
          />
          <Route path="/client/search/:query" exact component={SearchResults} />
          <Route path="/client/chat" exact component={ChatPage} />
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
