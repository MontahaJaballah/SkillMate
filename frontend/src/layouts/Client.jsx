import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Navbar from "../components/Navbar/Navbar.jsx";
import Footer from "../components/Footers/Footer.jsx";

// Views
import Landing from "../views/Landing/Landing.jsx";
import Profile from "../views/Profile.jsx";
import RubikHome from "../views/client/Rubik/RubikHome.jsx";

export default function Client() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rubik" element={<RubikHome />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
