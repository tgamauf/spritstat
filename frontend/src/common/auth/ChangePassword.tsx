import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {faKey} from "@fortawesome/free-solid-svg-icons";
import {defineMessage, useIntl} from "react-intl";

import CenteredBox from "../components/CenteredBox";
import PasswordField from "./PasswordField";
import PasswordWithValidationField from "./PasswordWithValidationField";
import BasePage from "../components/BasePage";
import {OurFormElement, RouteNames} from "../types";
import {SETTINGS_BREADCRUMB} from "../settings/Settings";
import {useChangePasswordMutation} from "../apis/spritstatApi";
import {BreadcrumbItem} from "../components/Breadcrumb";

const BREADCRUMB: BreadcrumbItem = {
  name: defineMessage({
    description: "ChangePassword breadcrumb",
    defaultMessage: "Passwort ändern"
  }),
  icon: faKey,
  destination: RouteNames.ChangePassword,
};

function ChangePassword(): JSX.Element {
  const [changePassword, {isLoading}] = useChangePasswordMutation();
  const buttonRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordValid, setNewPasswordValid] = useState(false);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const intl = useIntl();

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      changePassword({oldPassword, newPassword}).unwrap()
        .then((isSuccess) => {
          if (isSuccess) {
            navigate(-1);
         } else {
            console.error("Failed to reset password: request status not ok");
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
  if (oldPassword.length > 1 && newPassword.length > 1 && newPasswordValid) {
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
        breadcrumbItems={[SETTINGS_BREADCRUMB, BREADCRUMB]}
        active={error}
        message={intl.formatMessage(
          {
            description: "ChangePassword error message",
            defaultMessage: "Passwortänderung ist fehlgeschlagen."
          })
        }
        discardMessage={() => setError(false)}
      >
        <CenteredBox>
          <h1 className="title">
            {intl.formatMessage({
              description: "ChangePassword title",
              defaultMessage: "Passwort ändern"
            })}
          </h1>
          <form onSubmit={onSubmit}>
            <PasswordField
              label={intl.formatMessage({
                description: "ChangePassword current password field label",
                defaultMessage: "Aktuelles Passwort"
              })}
              value={oldPassword}
              update={setOldPassword}
            />
            <PasswordWithValidationField
              label={intl.formatMessage({
                description: "ChangePassword new password field label",
                defaultMessage: "Neues Passwort"
              })}
              value={newPassword}
              update={setNewPassword}
              setPasswordValid={setNewPasswordValid}
            />
            <div className="field is-grouped is-grouped-right">
              <p className="control">
                <input
                  className="button is-primary"
                  type="submit"
                  value={intl.formatMessage({
                    description: "ChangePassword submit label",
                    defaultMessage: "Speichern"
                  })}
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

export default ChangePassword;
