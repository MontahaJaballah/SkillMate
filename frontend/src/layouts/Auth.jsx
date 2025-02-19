import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// Components
import Navbar from "../components/Navbars/AuthNavbar.jsx";
import Footer from "../components/Footers/Footer.jsx";

// Views
import Login from "../views/auth/Login.jsx";
import Register from "../views/auth/Register.jsx";

export default function Auth() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative w-full h-full py-40 min-h-screen">
          <div className="container mx-auto px-4 h-full">
            <Switch>
              <Route path="/auth/login" exact component={Login} />
              <Route path="/auth/register" exact component={Register} />
              <Redirect from="/auth" to="/auth/login" />
            </Switch>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
