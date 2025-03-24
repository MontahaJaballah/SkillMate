import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

// components
import AdminNavbar from "../components/Navbars/AdminNavbar.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import HeaderStats from "../components/Headers/HeaderStats.jsx";
import FooterAdmin from "../components/Footers/FooterAdmin.jsx";

// views
import Dashboard from "../views/admin/Dashboard.jsx";
import Settings from "../views/admin/Settings.jsx";
import Users from "../views/admin/Users.jsx";
import FormUser from "../views/admin/FormUser.jsx";
import Admins from "../views/admin/Admins.jsx";

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle default route only on initial render
  useEffect(() => {
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      navigate("dashboard", { replace: true });
    }
  }, []);

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-gray-200 dark:bg-gray-900 min-h-screen">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users" element={<Users />} />
            <Route path="admins" element={<Admins />} />
            <Route path="formuser" element={<FormUser />} />
          </Routes>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
