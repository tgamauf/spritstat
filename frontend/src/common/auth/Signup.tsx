import React, {FormEvent, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";

import CenteredBox from "../components/CenteredBox";
import BasePage from "../components/BasePage";
import {OurFormElement, RouteNames} from "../types";
import {useSignupMutation} from "../apis/spritstatApi";
import EmailField from "./EmailField";
import PasswordWithValidationField from "./PasswordWithValidationField";

function Signup(): JSX.Element {
  const [signup, {isLoading}] = useSignupMutation();
  const buttonRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      if (!email || !password) {
        console.error(
          `Signup failed: email=${email}, password=${!password ? "INVALID" : "**********"}`
        );
        return;
     }

      signup({email, password}).unwrap()
        .then((isSuccess) => {
          if (isSuccess) {
            navigate(`${RouteNames.VerifyEmailSent}/${email}`);
         } else {
            console.error(`Failed to register: request status not ok`);
            setError(true);
         }
       })
        .catch((e: any) => {
          console.error(`Failed to register: ${JSON.stringify(e, null, 2)}`);
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

export default Signup;
