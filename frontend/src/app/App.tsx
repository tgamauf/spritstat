import React, {useEffect} from "react";
import {Route, Routes, useLocation} from "react-router-dom";
import moment from "moment-timezone";
import {RouteNames} from "../common/types";
import NoMatch from "../common/components/NoMatch";
import Index from "../common/components/Index";
import Home from "../common/components/Home";
import Imprint from "../common/components/Imprint";
import PrivacyPolicy from "../common/components/PrivacyPolicy";
import Signup from "../features/auth/Signup";
import EmailVerificationSent from "../features/auth/EmailVerificationSent";
import ConfirmEmail from "../features/auth/ConfirmEmail";
import Login from "../features/auth/Login";
import PasswordRecoveryEmail from "../features/auth/PasswordRecoveryEmail";
import ResetPassword from "../features/auth/ResetPassword";
import Settings from "../features/settings/Settings";
import ChangePassword from "../features/auth/ChangePassword";
import Contact from "../features/contact/Contact";
import Dashboard from "../features/location/Dashboard";
import AddLocation from "../features/location/AddLocation";
import AccountDeleted from "../features/settings/AccountDeleted";
import {AuthProvider, RequireAuth, RequireNoAuth} from "../features/auth/AuthProvider";
import LocationDetails from "../features/location/LocationDetails";


export default function App() {
  const location = useLocation();

  console.debug(`Navigating to location ${JSON.stringify(location)}`);

  // Set the locale for moment timestamps to german
  useEffect(() => {
    moment.locale("de-at");
  }, []);

  return (
    <AuthProvider>
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
      </Routes>
    </AuthProvider>
  );
}
