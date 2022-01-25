import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CenteredBox from "../../components/CenteredBox";
import EmailField from "../../components/EmailField";
import BasePage from "../../components/BasePage";
import { apiPostRequest } from "../../services/api";
import { OurFormElement, RouteNames } from "../../utils/types";
import { useGlobalState } from "../../App";

function PasswordRecoveryEmail(): JSX.Element {
  const [{ isAuthenticated }] = useGlobalState();
  const [email, setEmail] = useState("");
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
      };

      apiPostRequest("users/auth/password/reset", userData)
        .then((isSuccess) => {
          if (isSuccess) {
            navigate(`${RouteNames.Login}?passwordRecovered=true`);
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
  if (email.length >= 3) {
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
            <EmailField value={email} update={setEmail} />
            <div className="field is-grouped is-grouped-right">
              <p className="control">
                <input
                  className="button is-primary"
                  type="submit"
                  value="Password zurücksetzen"
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

export default PasswordRecoveryEmail;
