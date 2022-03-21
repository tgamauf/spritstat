import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useIntl} from "react-intl";

import {RouteNames} from "../types";
import BasePage from "../components/BasePage";
import {useVerifyEmailMutation} from "../apis/spritstatApi";
import LoadingError from "../components/LoadingError";

export default function ConfirmEmail(): JSX.Element {
  const [confirmEmail] = useVerifyEmailMutation();
  const {key} = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const intl = useIntl();

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
        message={intl.formatMessage({
          description: "ConfirmEmail error",
          defaultMessage: "Bestätigung fehlgeschlagen, eventuell ist der Bestätigungslink " +
            "ungültig."
        })}
        children={
          <Link
            className="has-text-primary"
            to={RouteNames.Index}
            data-test="link-home"
          >
            {intl.formatMessage({
              description: "ConfirmEmail homepage button",
              defaultMessage: "Homepage"
            })}
          </Link>
       }
      />
    </BasePage>
  );
}
