import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbars/Navbar";

// Auth pages
import SignIn from "../views/auth/SignIn/SignIn";
import SignUp from "../views/auth/SignUp/SignUp";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle default route only on initial render
  useEffect(() => {
    if (location.pathname === "/auth" || location.pathname === "/auth/") {
      navigate("signin", { replace: true });
    }
  }, []);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full py-8">
          <div className="w-full lg:w-5/12 md:w-8/12 sm:w-10/12">
            <Routes>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
          </div>
        </div>
      </main>
    </>
  );
}
