import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Navbar from "../components/Navbar/Navbar.jsx";
import Footer from "../components/Footers/Footer.jsx";

// Views
import Landing from "../views/Landing/Landing.jsx";
import Profile from "../views/Profile.jsx";
import SearchResults from "../views/client/SearchResults.jsx";

export default function Client() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/search/:query" element={<SearchResults />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
