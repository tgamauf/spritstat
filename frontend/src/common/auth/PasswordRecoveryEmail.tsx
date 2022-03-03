import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";

import CenteredBox from "../components/CenteredBox";
import EmailField from "./EmailField";
import BasePage from "../components/BasePage";
import {OurFormElement, RouteNames} from "../types";
import {useResetPasswordMutation} from "../apis/spritstatApi";

function PasswordRecoveryEmail(): JSX.Element {
  const [resetPassword, {isLoading}] = useResetPasswordMutation();
  const buttonRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      resetPassword(email).unwrap()
        .then((isSuccess) => {
          if (isSuccess) {
            navigate(`${RouteNames.Login}?passwordRecovered=true`, {replace: true});
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
  if (email.length >= 3) {
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

export default PasswordRecoveryEmail;
