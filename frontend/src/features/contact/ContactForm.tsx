import React, { FormEvent, useEffect, useState } from "react";

import { OurFormElement } from "../../common/types";
import { apiPostRequest } from "../../services/api";

// This has to match the message length defined in the send view
const MAX_MESSAGE_LENGTH = 500;
const ERROR_MESSAGE =
  "Senden der Nachricht ist fehlgeschlagen, bitte probiere es erneut.";

interface Props {
  id: string;
  subjects?: string[];
  notifySubmitted: () => void;
  setErrorMessage: (message: string) => void;
}

export default function ContactForm({
  id,
  subjects,
  notifySubmitted,
  setErrorMessage,
}: Props): JSX.Element {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      const userData = {
        contact_form_id: id,
        name,
        subject,
        message,
      };
      apiPostRequest("users/account/contact", userData)
        .then((isSuccess) => {
          if (isSuccess) {
            notifySubmitted();
          } else {
            console.error(`Failed to send message: request status not ok`);
            setErrorMessage(ERROR_MESSAGE);
          }
        })
        .catch((e: any) => {
          console.error(`Failed to send message: ${e}`);
          setErrorMessage(ERROR_MESSAGE);
        });
    }
  }, [submitted]);

  function onSubmit(e: FormEvent<OurFormElement>) {
    e.preventDefault();

    setSubmitted(true);
    setErrorMessage("");
  }

  const submitDisabled = message.length <= 0;

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="field">
          <p className="control">
            <input
              className="input"
              title="Dein Name ist optional, aber wir freuen uns wenn du ihn
              angibst."
              type="text"
              placeholder="Name"
              value={name}
              required={false}
              onChange={(e) => setName(e.target.value)}
              data-test="field-name"
            />
          </p>
        </div>
        <div className="field">
          {subjects ? (
            <div className="select">
              <select
                title="Worum geht es bei deiner Anfrage?"
                required={true}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                data-test="field-select-subject"
              >
                <option value="" disabled={true}>
                  Betreff
                </option>
                {subjects.map((text, index) => {
                  return <option key={index}>{text}</option>;
                })}
              </select>
            </div>
          ) : (
            <input
              className="input"
              type="text"
              placeholder="Subject"
              value={subject}
              required={true}
              onChange={(e) => setSubject(e.target.value)}
              data-test="field-text-subject"
            />
          )}
        </div>
        <div className="field">
          <p className="control">
            <textarea
              className="textarea"
              rows={10}
              minLength={1}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="Wie können wir dir helfen?"
              value={message}
              required={true}
              onChange={(e) => setMessage(e.target.value)}
              data-test="field-message"
            />
          </p>
          <div className="field is-grouped is-grouped-right">
            <p className="help has-text-right">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </p>
          </div>
        </div>
        <div className="field is-grouped is-grouped-right">
          <p className="control">
            <input
              className="button is-primary"
              type="submit"
              value="Senden"
              disabled={submitDisabled}
              data-test="btn-submit"
            />
          </p>
        </div>
      </form>
    </div>
  );
}

export type { Props as ContactFormProps };
