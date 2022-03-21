import React, {useEffect, useRef, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useIntl} from "react-intl";

import CenteredBox from "../components/CenteredBox";
import EmailField from "./EmailField";
import PasswordField from "./PasswordField";
import BasePage, {BasePageSeverity} from "../components/BasePage";
import {OurFormElement, RouteNames} from "../types";
import {useLoginMutation} from "../apis/spritstatApi";
import {LocationState} from "./AuthProvider";

function Login(): JSX.Element {
  const location = useLocation();
  const fromPathName = (location.state as LocationState)?.fromPathName || RouteNames.Dashboard;
  const query = new URLSearchParams(location.search);
  const [passwordRecovered, setPasswordRecovered] = useState(
    query.get("passwordRecovered") === "true"
  );
  const [passwordChanged, setPasswordChanged] = useState(
    query.get("passwordChanged") === "true"
  );
  const [emailVerified, setEmailVerified] = useState(
    query.get("emailVerified") === "true"
  );
  const [login, {isLoading}] = useLoginMutation();
  const buttonRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [notify, setNotify] = useState(false);
  const [isError, setIsError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const intl = useIntl();

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      login({email, password, remember}).unwrap()
        .then(() => {
          navigate(fromPathName, {replace: true});
        })
        .catch((e: any) => {
          console.error(`Failed to login: ${JSON.stringify(e, null, 2)}`);
          setIsError(true);
       });
   }
 }, [submitted]);

  useEffect(() => {
    if (!notify && (isError || passwordChanged || passwordRecovered || emailVerified)) {
      setNotify(true);
   }
 }, [isError, passwordRecovered, passwordChanged, emailVerified, notify]);

  function acknowledgeNotification(): void {
    // Reset all notifications flags if the notification is removed.
    setNotify(false);
    setIsError(false);
    setPasswordRecovered(false);
    setPasswordChanged(false);
    setEmailVerified(false);
 }

  function onSubmit(e: React.FormEvent<OurFormElement>) {
    e.preventDefault();

    setSubmitted(true);
    setIsError(false);
 }

  let notificationSeverity;
  let notificationText = "";
  if (isError) {
    notificationSeverity = BasePageSeverity.Error;
    notificationText = intl.formatMessage({
      description: "Login error",
      defaultMessage: "Es ist nicht möglich sich mit diesen Benutzerdaten einzuloggen."
    });
 } else if (passwordRecovered) {
    notificationSeverity = BasePageSeverity.Info;
    notificationText = intl.formatMessage({
      description: "Login notification 1",
      defaultMessage: "Falls deine Email-Adresse bei uns gespeichert ist, erhältst " +
        "du in Kürze einen Passwort-Reset-Link zugesendet."
    });
 } else if (passwordChanged) {
    notificationSeverity = BasePageSeverity.Info;
    notificationText = intl.formatMessage({
      description: "Login notification 2",
      defaultMessage: "Dein Passwort wurde geändert, nun kannst du dich mit deinem " +
        "neuen Passwort einloggen."
    });
 } else if (emailVerified) {
    notificationSeverity = BasePageSeverity.Info;
    notificationText = intl.formatMessage({
      description: "Login notification 3",
      defaultMessage: "Deine E-Mail-Adresse wurde bestätigt, nun kannst du dich einloggen."
    });
 }

  let submitDisabled = true;
  if (email.length >= 3 && password.length > 1) {
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
              <h1 className="title">
                {intl.formatMessage({
                  description: "Login title",
                  defaultMessage: "Anmelden"
                })}
              </h1>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <Link
                className="has-text-primary"
                to={RouteNames.Signup}
                title={intl.formatMessage({
                  description: "Login register link title",
                  defaultMessage: "Klicke hier um einen neuen Account anzulegen."
                })}
                data-test="link-register"
              >
                {intl.formatMessage({
                  description: "Login register link",
                  defaultMessage: "Registrieren"
                })}
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
                    <span className="content pl-1">
                      {intl.formatMessage({
                        description: "Login remember checkbox",
                        defaultMessage: "Angemeldet bleiben"
                      })}
                    </span>
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
                    value={intl.formatMessage({
                      description: "Login submit",
                      defaultMessage: "Einloggen"
                    })}
                    disabled={submitDisabled}
                    ref={buttonRef}
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
            {intl.formatMessage({
              description: "Login password recovery link",
              defaultMessage: "Passwort vergessen?"
            })}
          </Link>
        </p>
      </CenteredBox>
    </BasePage>
  );
}

export default Login;
