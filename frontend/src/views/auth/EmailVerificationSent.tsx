import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CenteredBox from "../../components/CenteredBox";
import { apiPostRequest } from "../../services/api";
import BasePage from "../../components/BasePage";

function EmailVerificationSent(): JSX.Element {
  const { email } = useParams();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      const data = {
        email,
      };

      apiPostRequest("users/auth/resend-email", data)
        .then((isSuccess) => {
          if (!isSuccess) {
            console.error(`Failed to resend email: request status not ok`);
          }
        })
        .catch((e: any) => {
          console.error(`Failed to resend email: ${e}`);
        });
    }
  }, [submitted]);

  return (
    <BasePage>
      <CenteredBox>
        <p>Wir haben ein Email an deine Adresse gesendet.</p>
        <p>Bitte klicke auf den Link um die Registrierung abzuschließen!</p>
        <p className="mt-3">
          <button
            className="button is-primary is-ghost"
            onClick={() => setSubmitted(true)}
            data-test="btn-resend"
          >
            Nicht erhalten?
          </button>
        </p>
      </CenteredBox>
    </BasePage>
  );
}

export default EmailVerificationSent;
