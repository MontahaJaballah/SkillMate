import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./components/AuthProvider/AuthProvider";
import { Toaster } from "react-hot-toast";
import ChessHome from './views/client/Chess/ChessHome';
import ChessMentorView from './views/client/Chess/ChessMentorView';
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
          <Route path="/chess" element={<ChessHome />} />
          <Route path="/chess/mentor" element={<ChessMentorView />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}