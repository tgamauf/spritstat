import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { faKey } from "@fortawesome/free-solid-svg-icons";

import { useGlobalState } from "../../App";
import CenteredBox from "../../components/CenteredBox";
import PasswordField from "../../components/PasswordField";
import PasswordWithValidationField from "../../components/PasswordWithValidationField";
import BasePage from "../../components/BasePage";
import { apiPostRequest } from "../../services/api";
import { OurFormElement, RouteNames } from "../../utils/types";
import { SETTINGS_BREADCRUMB } from "../app/Settings";

const BREADCRUMB = {
  name: "Passwort ändern",
  icon: faKey,
  destination: RouteNames.ChangePassword,
};

function ChangePassword(): JSX.Element {
  const [{ isAuthenticated }] = useGlobalState();
  const { uid, token } = useParams();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordValid, setNewPasswordValid] = useState(false);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(RouteNames.Login, { replace: true });
    }
  });

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      const userData = {
        uid,
        token,
        old_password: oldPassword,
        // We have to send the new password twice to satisfy
        //  dj_rest_auth/allauth
        new_password1: newPassword,
        new_password2: newPassword,
      };

      apiPostRequest("users/auth/password/change", userData)
        .then((isSuccess) => {
          if (isSuccess) {
            navigate(-1);
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
  if (oldPassword.length > 1 && newPassword.length > 1 && newPasswordValid) {
    submitDisabled = false;
  }

  return (
    <div>
      <BasePage
        breadcrumbItems={[SETTINGS_BREADCRUMB, BREADCRUMB]}
        active={error}
        message="Passwordänderung ist fehlgeschlagen."
        discardMessage={() => setError(false)}
      >
        <CenteredBox>
          <h1 className="title">Password ändern</h1>
          <form onSubmit={onSubmit}>
            <PasswordField
              label="Aktuelles Passwort"
              value={oldPassword}
              update={setOldPassword}
            />
            <PasswordWithValidationField
              label="Neues Passwort"
              value={newPassword}
              update={setNewPassword}
              setPasswordValid={setNewPasswordValid}
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

export default ChangePassword;
