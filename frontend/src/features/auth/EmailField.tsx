import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

interface Props {
  value: string;
  update: (value: string) => void;
  autoComplete?: string;
}

export default function EmailField({
  value,
  update,
  autoComplete = "username",
}: Props): JSX.Element {
  return (
    <div className="field" data-test="field-username">
      <p className="control has-icons-left">
        <input
          className="input"
          title="Bitte gib deine E-Mail-Adressse an."
          type="email"
          placeholder="Email"
          value={value}
          required={true}
          autoComplete={autoComplete}
          onChange={(e) => update(e.target.value)}
        />
        <span className="icon is-small is-left">
          <FontAwesomeIcon icon={faEnvelope} />
        </span>
      </p>
    </div>
  );
}

export type { Props as EmailFieldProps };
