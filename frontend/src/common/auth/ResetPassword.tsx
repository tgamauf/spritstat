import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {t, Trans} from "@lingui/macro";

import CenteredBox from "../components/CenteredBox";
import PasswordWithValidationField from "./PasswordWithValidationField";
import BasePage from "../components/BasePage";
import {OurFormElement, RouteNames} from "../types";
import {useResetPasswordConfirmMutation} from "../apis/spritstatApi";

function ResetPassword(): JSX.Element {
  const [resetPasswordConfirm, {isLoading}] = useResetPasswordConfirmMutation();
  const buttonRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const {uid, token} = useParams();
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      if (!uid || !token || !password) {
        console.error(
          "Password reset confirm data not available: " +
          `uid=${uid}, token=${token}, password=${!password ? "INVALID" : "**********"}`
        );
        return;
     }

      resetPasswordConfirm({uid, token, password}).unwrap()
        .then((isSuccess) => {
          if (isSuccess) {
            navigate(
              `${RouteNames.Login}?passwordChanged=true`,
              {replace: true}
            );
         } else {
            console.error(`Failed to reset password: request status not ok`);
            setError(true);
         }
       })
        .catch((e: any) => {
          console.error(`Failed to reset password: ${JSON.stringify(e, null, 2)}`);
          setError(true);
       });
   }
 }, [submitted]);

  function onSubmit(e: React.FormEvent<OurFormElement>) {
    e.preventDefault();

    setSubmitted(true);
    setError(false);
 }

  let submitDisabled = true;
  if (password.length > 1 && passwordValid) {
    submitDisabled = false;
 }

  if (buttonRef.current) {
    if (submitted || isLoading) {
      buttonRef.current.classList.add("is-loading");
   } else {
      buttonRef.current.classList.remove("is-loading");
   }
 }

  return (
    <div>
      <BasePage
        active={error}
        message={t`Passwort reset ist fehlgeschlagen.`}
        discardMessage={() => setError(false)}
      >
        <CenteredBox>
          <h1 className="title"><Trans>Passwort vergessen?</Trans></h1>
          <form onSubmit={onSubmit}>
            <PasswordWithValidationField
              value={password}
              update={setPassword}
              setPasswordValid={setPasswordValid}
            />
            <div className="field is-grouped is-grouped-right">
              <p className="control">
                <input
                  className="button is-primary"
                  type="submit"
                  value={t`Passwort speichern`}
                  disabled={submitDisabled}
                  ref={buttonRef}
                  data-test="btn-submit"
                />
              </p>
            </div>
          </form>
        </CenteredBox>
      </BasePage>
    </div>
  );
}

export default ResetPassword;
