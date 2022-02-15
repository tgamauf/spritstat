import "./index.sass";

import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Provider} from "react-redux";

import App from "./app/App";
import {store} from "./app/store";
import NoMatch from "./common/components/NoMatch";
import { RouteNames } from "./common/types";
import Home from "./common/components/Home";
import Imprint from "./common/components/Imprint";
import Index from "./common/components/Index";
import PrivacyPolicy from "./common/components/PrivacyPolicy";
import Signup from "./features/auth/Signup";
import EmailVerificationSent from "./features/auth/EmailVerificationSent";
import ConfirmEmail from "./features/auth/ConfirmEmail";
import PasswordRecoveryEmail from "./features/auth/PasswordRecoveryEmail";
import Settings from "./features/settings/Settings";
import Login from "./features/auth/Login";
import ResetPassword from "./features/auth/ResetPassword";
import ChangePassword from "./features/auth/ChangePassword";
import Dashboard from "./features/location/Dashboard";
import AddLocation from "./features/location/AddLocation";
import AccountDeleted from "./features/settings/AccountDeleted";
import Contact from "./features/contact/Contact";


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
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
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
