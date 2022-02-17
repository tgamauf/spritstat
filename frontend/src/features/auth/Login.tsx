import React, {useEffect, useRef, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";

import CenteredBox from "../../common/components/CenteredBox";
import EmailField from "./EmailField";
import PasswordField from "./PasswordField";
import BasePage, {BasePageSeverity} from "../../common/components/BasePage";
import {OurFormElement, RouteNames} from "../../common/types";
import {useLoginMutation} from "./authApiSlice";
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

  console.log(`Login [0] notify=${notify}, isError=${isError}, passwordChanged=${passwordChanged}, passwordRecovered=${passwordRecovered}, emailVerified=${emailVerified}`)//TODO

  useEffect(() => {
    if (!notify && (isError || passwordChanged || passwordRecovered || emailVerified)) {
      setNotify(true);
   }
 }, [isError, passwordRecovered, passwordChanged, emailVerified, notify]);

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      login({email, password, remember}).unwrap()
        .then((isSuccess) => {
          if (isSuccess) {
            navigate(fromPathName, {replace: true});
         } else {
            console.error(`Failed to login: request status not ok`);
            setIsError(true);
         }
       })
        .catch((e: any) => {
          console.error(`Failed to login: ${JSON.stringify(e, null, 2)}`);
          setIsError(true);
       });
   }
 }, [submitted]);

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

 console.log(`Login [1] error=${isError}`);//TODO

  let notificationSeverity;
  let notificationText = "";
  if (isError) {
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
            Password vergessen?
          </Link>
        </p>
      </CenteredBox>
    </BasePage>
  );
}

export default Login;
