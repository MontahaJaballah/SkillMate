import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./components/AuthProvider/AuthProvider";
import { Toaster } from "react-hot-toast";

// Layouts
import Auth from "./layouts/Auth.jsx";
import Client from "./layouts/Client.jsx";
import Admin from "./layouts/Admin.jsx";
import ResetPassword from "./views/auth/ResetPassword/ResetPassword.jsx";
import ForgotPassword from "./views/auth/ForgetPassword/ForgotPassword.jsx";
import CourseGenerator from "./components/CourseGenerator/CourseGenerator.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/auth/*" element={<Auth />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/*" element={<Client />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/course-generator" element={<CourseGenerator />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}