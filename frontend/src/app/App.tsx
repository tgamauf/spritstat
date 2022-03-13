import React, {useEffect} from "react";
import {Route, Routes, useLocation} from "react-router-dom";
import moment from "moment-timezone";
import {i18n} from '@lingui/core'
import {I18nProvider} from "@lingui/react";

import { messages } from "../common/locales/en/messages";
import {RouteNames} from "../common/types";
import NoMatch from "../common/components/NoMatch";
import Index from "../common/components/Index";
import Home from "../common/components/Home";
import Imprint from "../common/components/Imprint";
import PrivacyPolicy from "../common/components/PrivacyPolicy";
import Signup from "../common/auth/Signup";
import EmailVerificationSent from "../common/auth/EmailVerificationSent";
import ConfirmEmail from "../common/auth/ConfirmEmail";
import Login from "../common/auth/Login";
import PasswordRecoveryEmail from "../common/auth/PasswordRecoveryEmail";
import ResetPassword from "../common/auth/ResetPassword";
import Settings from "../common/settings/Settings";
import ChangePassword from "../common/auth/ChangePassword";
import Contact from "../features/contact/Contact";
import Dashboard from "../features/location/Dashboard";
import AddLocation from "../features/location/AddLocation";
import AccountDeleted from "../common/settings/AccountDeleted";
import {AuthProvider, RequireAuth, RequireNoAuth} from "../common/auth/AuthProvider";
import LocationDetails from "../features/location/LocationDetails";
import {SettingsProvider} from "../common/settings/SettingsProvider";
import Unsubscribe from "../common/settings/Unsubscribe";
import {defaultLocale, dynamicActivate} from "../common/i18n";


export default function App() {
  const location = useLocation();

  console.debug(`Navigating to location ${JSON.stringify(location)}`);

  // Set the locale to german
  useEffect(() => {
    void dynamicActivate(defaultLocale);
    moment.locale("de-at"); //TODO check if still needed or if we can replace it with i18n
  }, []);

  return (
    <I18nProvider i18n={i18n}>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            <Route path="*" element={<NoMatch/>}/>
            <Route index element={<Index/>}/>
            <Route path={RouteNames.Home} element={<Home/>}/>
            <Route path={RouteNames.Imprint} element={<Imprint/>}/>
            <Route path={RouteNames.PrivacyPolicy} element={<PrivacyPolicy/>}/>
            <Route
              path={RouteNames.Signup}
              element={<RequireNoAuth><Signup/></RequireNoAuth>}
            />
            <Route
              path={`${RouteNames.VerifyEmailSent}/:email`}
              element={<RequireNoAuth><EmailVerificationSent/></RequireNoAuth>}
            />
            <Route
              path={`${RouteNames.ConfirmEmail}/:key`}
              element={<RequireNoAuth><ConfirmEmail/></RequireNoAuth>}
            />
            <Route
              path={RouteNames.Login}
              element={<RequireNoAuth><Login/></RequireNoAuth>}
            />
            <Route
              path={RouteNames.PasswordRecoveryEmail}
              element={<RequireNoAuth><PasswordRecoveryEmail/></RequireNoAuth>}
            />
            <Route
              path={`${RouteNames.ResetPassword}/:uid/:token`}
              element={<RequireNoAuth><ResetPassword/></RequireNoAuth>}
            />
            <Route
              path={RouteNames.AccountDeleted}
              element={<RequireNoAuth><AccountDeleted/></RequireNoAuth>}
            />
            <Route
              path={RouteNames.Settings}
              element={<RequireAuth><Settings/></RequireAuth>}
            />
            <Route
              path={RouteNames.ChangePassword}
              element={<RequireAuth><ChangePassword/></RequireAuth>}
            />
            <Route
              path={RouteNames.Contact}
              element={<RequireAuth><Contact/></RequireAuth>}
            />
            <Route
              path={RouteNames.Dashboard}
              element={<RequireAuth><Dashboard/></RequireAuth>}
            />
            <Route
              path={RouteNames.AddLocation}
              element={<RequireAuth><AddLocation/></RequireAuth>}
            />
            <Route
              path={`${RouteNames.LocationDetails}/:locationId`}
              element={<RequireAuth><LocationDetails/></RequireAuth>}
            />
            <Route
              path={`${RouteNames.Unsubscribe}/:uid/:token`}
              element={<Unsubscribe/>}
            />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
