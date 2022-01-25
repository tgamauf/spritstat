import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGlobalState } from "../../App";
import CenteredBox from "../../components/CenteredBox";
import EmailField from "../../components/EmailField";
import BasePage from "../../components/BasePage";
import PasswordWithValidationField from "../../components/PasswordWithValidationField";
import { apiPostRequest } from "../../services/api";
import { OurFormElement, RouteNames } from "../../utils/types";

function Signup(): JSX.Element {
  const [{ isAuthenticated }] = useGlobalState();
  const [email, setEmail] = useState("");
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
        email,
        // We have to send the password twice to satisfy dj_rest_auth/allauth
        password1: password,
        password2: password,
      };

      apiPostRequest("users/auth/register", userData)
        .then((isSuccess) => {
          if (isSuccess) {
            navigate(`${RouteNames.VerifyEmailSent}/${email}`);
          } else {
            console.error(`Failed to register: request status not ok`);
            setError(true);
          }
        })
        .catch((e: any) => {
          console.error(`Failed to register: ${e}`);
          setError(true);
        });
    }
  }, [submitted]);

  function onSubmit(e: FormEvent<OurFormElement>) {
    e.preventDefault();

    setSubmitted(true);
    setError(false);
  }

  let submitDisabled = true;
  if (email.length >= 3 && password.length > 1 && passwordValid) {
    submitDisabled = false;
  }

  return (
    <div>
      <BasePage
        active={error}
        message="Es war nicht möglich ein Konto mit diesen Benutzerdaten zu registrieren."
        discardMessage={() => setError(false)}
      >
        <CenteredBox>
          <h1 className="title">Registrieren</h1>
          <form onSubmit={onSubmit}>
            <EmailField value={email} update={setEmail} />
            <PasswordWithValidationField
              value={password}
              update={setPassword}
              email={email}
              setPasswordValid={setPasswordValid}
            />
            <div className="field is-grouped is-grouped-right">
              <p className="control">
                <input
                  className="button is-primary"
                  type="submit"
                  value="Registrieren"
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

export default Signup;
