import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useIntl} from "react-intl";

import {RouteNames} from "../types";
import BasePage from "../components/BasePage";
import {spritstatApi, useVerifyEmailMutation} from "../apis/spritstatApi";
import LoadingError from "../components/LoadingError";
import {useAppDispatch} from "../utils";

export default function ConfirmEmail(): JSX.Element {
  const dispatch = useAppDispatch();
  const [confirmEmail, {isLoading}] = useVerifyEmailMutation();
  const {key} = useParams();
  const navigate = useNavigate();
  const intl = useIntl();

  useEffect(() => {
    if (!key) {
      console.error("Could not verify email, key not found");
      return;
   }

    confirmEmail(key).unwrap()
      .then(() => {
        navigate(
          `${RouteNames.Dashboard}`,
          {replace: true}
        );
        dispatch(spritstatApi.util.invalidateTags(["Session"]));
     })
      .catch((e: any) => {
        console.error(`Email verification failed: ${JSON.stringify(e, null, 2)}`);
     });
 }, [key]);

  return (
    <BasePage>
      <LoadingError
        loading={isLoading}
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
