import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./components/AuthProvider/AuthProvider";
import { Toaster } from "react-hot-toast";

// Layouts
import Auth from "./layouts/Auth.jsx";
import Client from "./layouts/Client.jsx";
import Admin from "./layouts/Admin.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/auth/*" element={<Auth />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/*" element={<Client />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}