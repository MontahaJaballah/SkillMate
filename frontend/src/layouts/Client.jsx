import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Components
import Navbar from "../components/Navbars/Navbar.jsx";
import Footer from "../components/Footers/Footer.jsx";
import Chatbot from "../components/Chatbot/Chatbot.jsx";
import PrivateRoute from "../components/PrivateRoute/PrivateRoute.jsx";

// Views
import Landing from "../views/Landing/Landing.jsx";
import Profile from "../views/client/Profile.jsx";
import SearchResults from "../views/client/SearchResults.jsx";
import ChatPage from "../views/client/ChatPage/ChatPage";
import AccountSettings from "../views/client/AccountSettings/AccountSettings";
import CodeCompilerPage from "../views/client/CodeCompilerPage/CodeCompilerPage.jsx";

export default function Client() {
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Client layout rendered, path:', location.pathname);

  // Only redirect if we're at exactly /client or /client/
  useEffect(() => {
    if (location.pathname === "/client" || location.pathname === "/client/") {
      console.log('Redirecting to landing page from root client path');
      navigate("landing", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Define all client routes here */}
          <Route path="landing" element={<Landing />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="search/:query" element={<SearchResults />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="settings" element={<AccountSettings />} />
          <Route path="code-compiler" element={<CodeCompilerPage />} />
          <Route path="courses" element={<div>Courses Page</div>} />
          <Route path="teachers" element={<div>Teachers Page</div>} />
          <Route path="blogs" element={<div>Blogs Page</div>} />
          <Route path="contact" element={<div>Contact Page</div>} />
          <Route path="dashboard" element={<div>Dashboard Page</div>} />


          {/* Catch-all route to handle any other paths */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
