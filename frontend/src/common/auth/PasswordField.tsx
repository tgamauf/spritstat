import React, {PropsWithChildren, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash, faLock} from "@fortawesome/free-solid-svg-icons";
import {useIntl} from "react-intl";

interface OwnProps {
  label?: string;
  value: string;
  update: (value: string) => void;
  autoComplete?: string;
  dataTest?: string;
}
type Props = PropsWithChildren<OwnProps>;

export default function PasswordField({
  label,
  value,
  update,
  autoComplete = "current-password",
  dataTest = "field-current-password",
  children,
}: Props): JSX.Element {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const intl = useIntl();

  if (!label) {
    label = intl.formatMessage({
      description: "PasswordField default label",
      defaultMessage: "Passwort"
    })
  }

  let passwordFieldType;
  let passwordVisibleIcon;
  if (passwordVisible) {
    passwordFieldType = "text";
    passwordVisibleIcon = faEyeSlash;
 } else {
    passwordFieldType = "password";
    passwordVisibleIcon = faEye;
 }

  let showButtonTitle;
  if (passwordVisible) {
    showButtonTitle = intl.formatMessage({
      description: "PasswordField hide message",
      defaultMessage: "Passwort verstecken."
    });
 } else {
    showButtonTitle = intl.formatMessage({
      description: "PasswordField show message",
      defaultMessage: "Passwort anzeigen."
    });
 }
  return (
    <div className="field" data-test={dataTest}>
      <div className="field has-addons mb-0">
        <p className="control has-icons-left is-expanded">
          <input
            className="input"
            title={intl.formatMessage({
              description: "PasswordField password field title",
              defaultMessage: "Bitte gib dein Passwort an."
            })}
            type={passwordFieldType}
            placeholder={label}
            value={value}
            required={true}
            autoComplete={autoComplete}
            onChange={(e) => update(e.target.value)}
          />
          <span className="icon is-small is-left">
            <FontAwesomeIcon icon={faLock} />
          </span>
        </p>
        <p className="control">
          <a
            className="button"
            title={showButtonTitle}
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            <span className="icon is-small is-right">
              <FontAwesomeIcon icon={passwordVisibleIcon} />
            </span>
          </a>
        </p>
      </div>
      {children}
    </div>
  );
}

export type {Props as PasswordFieldProps};
