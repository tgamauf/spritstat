import React, {FormEvent, useEffect, useRef, useState} from "react";
import {useIntl} from "react-intl";

import {OurFormElement} from "../../common/types";
import {useSendContactFormMutation} from "./contactApiSlice";

// This has to match the message length defined by the send view
const MAX_MESSAGE_LENGTH = 500;

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
  const [sendContactForm, {isLoading}] = useSendContactFormMutation();
  const buttonRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      const error = intl.formatMessage({
        description: "ContactForm error",
        defaultMessage: "Senden der Nachricht ist fehlgeschlagen, bitte probiere es " +
          "erneut."
      });
      sendContactForm({formId: id, name, subject, message}).unwrap()
        .then((isSuccess) => {
          if (isSuccess) {
            notifySubmitted();
         } else {
            console.error(`Failed to send message: request status not ok`);
            setErrorMessage(error);
         }
       })
        .catch((e: any) => {
          console.error(`Failed to send message: ${JSON.stringify(e, null, 2)}`);
          setErrorMessage(error);
       });
   }
 }, [submitted]);

  function onSubmit(e: FormEvent<OurFormElement>) {
    e.preventDefault();

    setSubmitted(true);
    setErrorMessage("");
 }

  if (buttonRef.current) {
    if (submitted || isLoading) {
      buttonRef.current.classList.add("is-loading");
   } else {
      buttonRef.current.classList.remove("is-loading");
   }
 }

  const submitDisabled = message.length <= 0;

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="field">
          <p className="control">
            <input
              className="input"
              title={intl.formatMessage({
                description: "ContactForm title name",
                defaultMessage: "Dein Name ist optional, aber wir freuen uns wenn " +
                  "du ihn angibst."
              })}
              type="text"
              placeholder={intl.formatMessage({
                description: "ContactForm placeholder name",
                defaultMessage: "Name"
              })}
              value={name}
              required={false}
              onChange={(e) => setName(e.target.value)}
              data-test="field-name"
            />
          </p>
        </div>
        <div className="field">
          {subjects && (
            <div className="select">
              <select
                title={intl.formatMessage({
                  description: "ContactForm subject title",
                  defaultMessage: "Worum geht es bei deiner Anfrage?"
                })}
                required={true}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                data-test="field-select-subject"
              >
                <option value="" disabled={true}>
                  {intl.formatMessage({
                    description: "ContactForm subject dropdown text",
                    defaultMessage: "Betreff"
                  })}
                </option>
                {subjects.map((text, index) => {
                  return <option key={index}>{text}</option>;
               })}
              </select>
            </div>
          )}
        </div>
        <div className="field">
          <p className="control">
            <textarea
              className="textarea"
              rows={10}
              minLength={1}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder={intl.formatMessage({
                description: "ContactForm text",
                defaultMessage: "Wie können wir dir helfen?"
              })}
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
              value={intl.formatMessage({
                description: "ContactForm submit",
                defaultMessage: "Senden"
              })}
              disabled={submitDisabled}
              ref={buttonRef}
              data-test="btn-submit"
            />
          </p>
        </div>
      </form>
    </div>
  );
};
