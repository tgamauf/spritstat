import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

import {RouteNames} from "../../common/types";
import BasePage from "../../common/components/BasePage";
import {useAppSelector} from "../../common/utils";
import {selectIsAuthenticated} from "../../common/sessionSlice";
import {useVerifyEmailMutation, useLogoutMutation} from "./authApiSlice";
import LoadingError from "../../common/components/LoadingError";

export default function ConfirmEmail(): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [logout] = useLogoutMutation();
  const [confirmEmail] = useVerifyEmailMutation();
  const {key} = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // If we are logged in we log out as it is possible that a different
      //  user than the one this confirmation link belongs to is logged in.
      logout().unwrap()
        .catch((e) => {
          console.error(`Error during logout: ${JSON.stringify(e, null, 2)}`);
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only verify if we are not logged in
    if (isAuthenticated) {
      return;
    }

    if (!key) {
      console.error("Could not verify email, key not found");
      return;
    }

    confirmEmail(key).unwrap()
      .then((valid) => {
        if (valid) {
          navigate(
            `${RouteNames.Login}?emailVerified=true`,
            { replace: true }
          );
        } else {
          console.log("Email verification returned false");
        }
      })
      .catch((e: any) => {
        console.error(`Email verification failed: ${JSON.stringify(e, null, 2)}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, isAuthenticated]);

  return (
    <BasePage>
      <LoadingError
        loading={loading}
        message="Bestätigung fehlgeschlagen, eventuell ist der Bestätigungslink ungültig."
        linkTo={RouteNames.Index}
        linkName="Homepage"
      />
    </BasePage>
  );
}
