import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import CenteredBox from "../../components/CenteredBox";
import EmailField from "../../components/EmailField";
import PasswordField from "../../components/PasswordField";
import BasePage, { BasePageSeverity } from "../../components/BasePage";
import {
  apiPostRequest,
  apiGetSessionRequest,
} from "../../services/api";
import { setSession } from "../../services/store";
import { OurFormElement, RouteNames } from "../../utils/types";
import { EMPTY_SESSION } from "../../utils/constants";
import { useGlobalState } from "../../App";

function Login(): JSX.Element {
  const [{ isAuthenticated }, dispatchGlobalState] = useGlobalState();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const [passwordRecovered, setPasswordRecovered] = useState(
    query.get("passwordRecovered") === "true"
  );
  const [passwordChanged, setPasswordChanged] = useState(
    query.get("passwordChanged") === "true"
  );
  const [emailVerified, setEmailVerified] = useState(
    query.get("emailVerified") === "true"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [notify, setNotify] = useState(false);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(RouteNames.Dashboard, { replace: true });
    }
  });

  useEffect(() => {
    if (
      !notify &&
      (error || passwordChanged || passwordRecovered || emailVerified)
    ) {
      setNotify(true);
    }
  }, [error, passwordRecovered, passwordChanged, emailVerified, notify]);

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      const userData = {
        email,
        password,
        remember,
      };

      apiPostRequest("users/auth/login", userData)
        .then((isSuccess) => {
          if (isSuccess) {
            apiGetSessionRequest()
              .then((session) => {
                dispatchGlobalState(setSession(session));
              })
              .catch((e) => {
                // Assume user isn"t logged in
                dispatchGlobalState(setSession(EMPTY_SESSION));
              });
          } else {
            console.error(`Failed to login: request status not ok`);
            setError(true);
          }
        })
        .catch((e: any) => {
          console.error(`Failed to login: ${e}`);
          setError(true);
        });
    }
  }, [submitted]);

  function acknowledgeNotification(): void {
    // Reset all notifications flags if the notification is removed.
    setNotify(false);
    setError(false);
    setPasswordRecovered(false);
    setPasswordChanged(false);
    setEmailVerified(false);
  }

  function onSubmit(e: React.FormEvent<OurFormElement>) {
    e.preventDefault();

    setSubmitted(true);
    setError(false);
  }

  let notificationSeverity;
  let notificationText = "";
  if (error) {
    notificationSeverity = BasePageSeverity.Error;
    notificationText =
      "Es ist nicht möglich sich mit diesen Benutzerdaten einzuloggen.";
  } else if (passwordRecovered) {
    notificationSeverity = BasePageSeverity.Info;
    notificationText =
      "Falls deine Email-Adresse bei uns gespeichert ist, " +
      "erhältst du in Kürze einen Password-Reset-Link zugesendet.";
  } else if (passwordChanged) {
    notificationSeverity = BasePageSeverity.Info;
    notificationText =
      "Dein Password wurder geändert, nun kannst du dich " +
      "mit deinem neuen Password einloggen.";
  } else if (emailVerified) {
    notificationSeverity = BasePageSeverity.Info;
    notificationText =
      "Deine E-Mail-Adresse wurde bestätigt, nun kannst du dich " +
      "einloggen.";
  }

  let submitDisabled = true;
  if (email.length >= 3 && password.length > 1) {
    submitDisabled = false;
  }

  return (
    <div>
      <BasePage
        active={notify}
        severity={notificationSeverity}
        message={notificationText}
        discardMessage={() => acknowledgeNotification()}
      >
        <CenteredBox>
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h1 className="title">Anmelden</h1>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <Link
                  className="has-text-primary"
                  to={RouteNames.Signup}
                  data-test="link-register"
                >
                  Registrieren
                </Link>
              </div>
            </div>
          </div>
          <form onSubmit={onSubmit}>
            <EmailField value={email} update={setEmail} />
            <PasswordField value={password} update={setPassword} />
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <p className="control">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        onChange={() => setRemember(!remember)}
                        data-test="field-checkbox-remember"
                      />
                      <span className="content pl-1">Angemeldet bleiben</span>
                    </label>
                  </p>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <p className="control">
                    <input
                      className="button is-primary"
                      type="submit"
                      value="Einloggen"
                      disabled={submitDisabled}
                      data-test="btn-submit"
                    />
                  </p>
                </div>
              </div>
            </div>
          </form>
          <hr />
          <p className="content is-small">
            <Link
              className="has-text-primary"
              to={RouteNames.PasswordRecoveryEmail}
              data-test="link-recovery-email"
            >
              Password vergessen?
            </Link>
          </p>
        </CenteredBox>
      </BasePage>
    </div>
  );
}

export default Login;
