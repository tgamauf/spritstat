import React, { PropsWithChildren, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons";

interface OwnProps {
  label?: string;
  value: string;
  update: (value: string) => void;
  autoComplete?: string;
  data_cy?: string;
}
type Props = PropsWithChildren<OwnProps>;

export default function PasswordField({
  label = "Passwort",
  value,
  update,
  autoComplete = "current-password",
  data_cy = "field-current-password",
  children,
}: Props): JSX.Element {
  const [passwordVisible, setPasswordVisible] = useState(true);

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
    showButtonTitle = "Klicke hier um dein Passwort zu verstecken.";
  } else {
    showButtonTitle = "Klicke hier um dein Passwort anzuzeigen.";
  }
  return (
    <div className="field" data-test={data_cy}>
      <div className="field has-addons mb-0">
        <p className="control has-icons-left is-expanded">
          <input
            className="input"
            title="Bitte gib dein Passwort an."
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

export type { Props as PasswordFieldProps };
