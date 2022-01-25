import "./index.sass";

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App";
import NoMatch from "./views/app/NoMatch";
import { RouteNames } from "./utils/types";
import Home from "./views/app/Home";
import Imprint from "./views/app/Imprint";
import Index from "./views/app/Index";
import PrivacyPolicy from "./views/app/PrivacyPolicy";
import Signup from "./views/auth/Signup";
import EmailVerificationSent from "./views/auth/EmailVerificationSent";
import ConfirmEmail from "./views/auth/ConfirmEmail";
import PasswordRecoveryEmail from "./views/auth/PasswordRecoveryEmail";
import Settings from "./views/app/Settings";
import Login from "./views/auth/Login";
import ResetPassword from "./views/auth/ResetPassword";
import ChangePassword from "./views/auth/ChangePassword";
import Dashboard from "./views/app/Dashboard";
import AddLocation from "./views/app/AddLocation";
import AccountDeleted from "./views/app/AccountDeleted";
import Contact from "./views/app/Contact";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path={RouteNames.Index} element={<App />}>
          <Route path="*" element={<NoMatch />} />
          <Route index element={<Index />} />
          <Route path={RouteNames.Home} element={<Home />} />
          <Route path={RouteNames.Imprint} element={<Imprint />} />
          <Route path={RouteNames.PrivacyPolicy} element={<PrivacyPolicy />} />
          <Route path={RouteNames.Signup} element={<Signup />} />
          <Route
            path={`${RouteNames.VerifyEmailSent}/:email`}
            element={<EmailVerificationSent />}
          />
          <Route
            path={`${RouteNames.ConfirmEmail}/:key`}
            element={<ConfirmEmail />}
          />
          <Route path={RouteNames.Login} element={<Login />} />
          <Route
            path={RouteNames.PasswordRecoveryEmail}
            element={<PasswordRecoveryEmail />}
          />
          <Route
            path={`${RouteNames.ResetPassword}/:uid/:token`}
            element={<ResetPassword />}
          />
          <Route path={RouteNames.Settings} element={<Settings />} />
          <Route
            path={RouteNames.ChangePassword}
            element={<ChangePassword />}
          />
          <Route path={RouteNames.Contact} element={<Contact />} />
          <Route path={RouteNames.Dashboard} element={<Dashboard />} />
          <Route path={RouteNames.AddLocation} element={<AddLocation />} />
          <Route
            path={RouteNames.AccountDeleted}
            element={<AccountDeleted />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
