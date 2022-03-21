import React, {useCallback, useEffect, useState} from "react";
import _debuounce from "lodash.debounce";
import {useIntl} from "react-intl";

import PasswordField, {PasswordFieldProps} from "./PasswordField";
import {PasswordValidationResponse, useValidatePasswordMutation} from "../apis/spritstatApi";

const DEBOUNCE_TIMEOUT_MS = 200;
// as defined by Django settings PASSWORD_MINIMUM_SCORE
const MIN_VALID_PASSWORD_SCORE = 2;
const GOOD_PASSWORD_SCORE = 4;
const MAX_PASSWORD_SCORE = 4; // as defined by zxcvbn
const EMAIL_REGEX = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);


interface Props extends PasswordFieldProps {
  setPasswordValid: (passwordValid: boolean) => void;
  email?: string;
  autoComplete?: string;
  dataTest?: string;
}

export default function PasswordWithValidationField({
  value: password,
  label,
  update,
  children,
  setPasswordValid,
  email = "",
  autoComplete = "new-password",
  dataTest = "field-new-password"
}: Props): JSX.Element {
  const [apiValidatePassword] = useValidatePasswordMutation();
  const [score, setScore] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const intl = useIntl();

  useEffect(() => {
    // Ignore email if it isn't valid
    let email_;
    if (email && EMAIL_REGEX.test(email)) {
      email_ = email;
   }

    if (password.length > 0) {
      validatePasswordDebounced(password, email_);
   }
 }, [password, email]);

  function validatePassword(password: string, email?: string) {
    apiValidatePassword({password, email}).unwrap()
      .then((validation: PasswordValidationResponse) => {
        setPasswordValid(validation.valid);
        setScore(validation.score);
        setSuggestions(validation.suggestions)
     })
      .catch((e: any) => {
        // We just log this, but take no action as nothing can be done anyway.
        console.error(`Failed to validate password: ${JSON.stringify(e, null, 2)}`);
     });
 }

  const validatePasswordDebounced = useCallback(
    _debuounce(validatePassword, DEBOUNCE_TIMEOUT_MS),
    []
  );

  let passwordIndicatorColor;
  if (score < MIN_VALID_PASSWORD_SCORE) {
    passwordIndicatorColor = "is-danger";
 } else if (
    score >= MIN_VALID_PASSWORD_SCORE &&
    score < GOOD_PASSWORD_SCORE
  ) {
    passwordIndicatorColor = "is-warning";
 } else {
    passwordIndicatorColor = "is-success";
 }

  return (
    <PasswordField
      label={label}
      value={password}
      update={update}
      autoComplete={autoComplete}
      dataTest={dataTest}
    >
      <progress
        className={`progress is-small ${passwordIndicatorColor}`}
        title={intl.formatMessage({
            description: "PasswordWithValidationField progress title",
            defaultMessage: "Dies zeigt die Passwortstärke an. Rot zeigt ein schlechtes " +
              "Passwort an, Gelb ein mäßiges und Grün ein gutes. {suggestions}"
          },
          {suggestions: suggestions.join(",")}
        )}
        max={MAX_PASSWORD_SCORE}
        value={score}
        data-test="field-new-password-progress"
      />
      {children}
    </PasswordField>
  );
};
