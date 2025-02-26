import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

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
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-gray-200">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <Switch>
            <Route path="/admin/dashboard" exact component={Dashboard} />
            <Route path="/admin/settings" exact component={Settings} />
            <Route path="/admin/users" exact component={Users} />
            <Route path="/admin/admins" exact component={Admins} />
            <Route path="/admin/formuser" exact component={FormUser} />
            <Redirect from="/admin" to="/admin/dashboard" />
          </Switch>
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
