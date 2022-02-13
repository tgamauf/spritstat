import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useGlobalState } from "../../app/App";
import CenteredBox from "../../common/components/CenteredBox";
import PasswordWithValidationField from "./PasswordWithValidationField";
import BasePage from "../../common/components/BasePage";
import { apiPostRequest } from "../../services/api";
import { OurFormElement, RouteNames } from "../../common/types";

function ResetPassword(): JSX.Element {
  const [{ isAuthenticated }] = useGlobalState();
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(RouteNames.Dashboard, { replace: true });
    }
  });

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      const userData = {
        uid,
        token,
        // We have to send the password twice to satisfy dj_rest_auth/allauth
        new_password1: password,
        new_password2: password,
      };

      apiPostRequest("users/auth/password/reset/confirm", userData)
        .then((isSuccess) => {
          if (isSuccess) {
            navigate(
              `${RouteNames.Login}?passwordChanged=true`,
              { replace: true }
            );
          } else {
            console.error(`Failed to reset password: request status not ok`);
            setError(true);
          }
        })
        .catch((e: any) => {
          console.error(`Failed to reset password: ${e}`);
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

  return (
    <div>
      <BasePage
        active={error}
        message="Password reset ist fehlgeschlagen."
        discardMessage={() => setError(false)}
      >
        <CenteredBox>
          <h1 className="title">Password vergessen?</h1>
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
                  value="Passwort speichern"
                  disabled={submitDisabled}
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
