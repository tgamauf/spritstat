import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";

import {RouteNames} from "../../common/types";
import BasePage from "../../common/components/BasePage";
import {useVerifyEmailMutation} from "./authApiSlice";
import LoadingError from "../../common/components/LoadingError";

export default function ConfirmEmail(): JSX.Element {
  const [confirmEmail] = useVerifyEmailMutation();
  const {key} = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!key) {
      console.error("Could not verify email, key not found");
      return;
   }

    confirmEmail(key).unwrap()
      .then((valid) => {
        if (valid) {
          navigate(
            `${RouteNames.Login}?emailVerified=true`,
            {replace: true}
          );
       } else {
          console.error("Email verification returned false");
       }
     })
      .catch((e: any) => {
        console.error(`Email verification failed: ${JSON.stringify(e, null, 2)}`);
     })
      .finally(() => {
        setLoading(false);
     });
 }, [key]);

  return (
    <BasePage>
      <LoadingError
        loading={loading}
        message="Bestätigung fehlgeschlagen, eventuell ist der Bestätigungslink ungültig."
        children={
          <Link
            className="has-text-primary"
            to={RouteNames.Index}
            data-test="link-home"
          >
            "Homepage"
          </Link>
       }
      />
    </BasePage>
  );
}
