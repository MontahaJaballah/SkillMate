import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import SignIn from "../views/auth/SignIn/SignIn";
import SignUp from "../views/auth/SignUp/SignUp";

export default function Auth() {
  return (
    <>
      <main className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full py-8">
          <div className="w-full lg:w-5/12 md:w-8/12 sm:w-10/12">
            <Switch>
              <Route path="/auth/signin" exact component={SignIn} />
              <Route path="/auth/signup" exact component={SignUp} />
              <Redirect from="/auth" to="/auth/signin" />
            </Switch>
          </div>
        </div>
      </main>
    </>
  );
}
