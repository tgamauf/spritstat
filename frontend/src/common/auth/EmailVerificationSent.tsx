import React, {useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {useIntl} from "react-intl";

import CenteredBox from "../components/CenteredBox";
import BasePage from "../components/BasePage";
import {useResendEmailMutation} from "../apis/spritstatApi";

function EmailVerificationSent(): JSX.Element {
  const {email} = useParams();
  const [resendEmail, {isLoading}] = useResendEmailMutation();
  const buttonRef = useRef() as React.MutableRefObject<HTMLButtonElement>;
  const [submitted, setSubmitted] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      if (!email) {
        console.error(`Cannot resend email verification: email not available`);
        return;
     }

      resendEmail(email).unwrap()
        .then((isSuccess) => {
          if (!isSuccess) {
            console.error(`Failed to resend email: request status not ok`);
         }
       })
        .catch((e: any) => {
          console.error(`Failed to resend email: ${JSON.stringify(e, null, 2)}`);
       });
   }
 }, [submitted]);

  if (buttonRef.current) {
    if (submitted || isLoading) {
      buttonRef.current.classList.add("is-loading");
   } else {
      buttonRef.current.classList.remove("is-loading");
   }
 }

  return (
    <BasePage>
      <CenteredBox>
        <p>
          {intl.formatMessage({
            description: "EmailVerificationSent text paragraph 1",
            defaultMessage: "Wir haben ein Email an deine Adresse gesendet."
          })}
        </p>
        <p>
          {intl.formatMessage({
            description: "EmailVerificationSent text paragraph 2",
            defaultMessage: "Bitte klicke auf den Link um die Registrierung abzuschließen!"
          })}
        </p>
        <p className="mt-3">
          <button
            className="button is-primary is-ghost"
            onClick={() => setSubmitted(true)}
            ref={buttonRef}
            data-test="btn-resend"
          >
            {intl.formatMessage({
              description: "EmailVerificationSent button",
              defaultMessage: "Nicht erhalten?"
            })}
          </button>
        </p>
      </CenteredBox>
    </BasePage>
  );
}

export default EmailVerificationSent;
