import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons";
import {defineMessage, useIntl} from "react-intl";

import ContactForm from "./ContactForm";
import BasePage from "../../common/components/BasePage";
import {RouteNames} from "../../common/types";
import {BreadcrumbItem} from "../../common/components/Breadcrumb";

const BREADCRUMB: BreadcrumbItem = {
  name: defineMessage({
    description: "Contact breadcrumb",
    defaultMessage: "Kontakt"
  }),
  icon: faEnvelope,
  destination: RouteNames.Contact,
};

export default function Contact(): JSX.Element {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const intl = useIntl();

  function notifySubmitted() {
    setErrorMessage("");
    navigate(-1);
 }

  return (
    <BasePage
      breadcrumbItems={[BREADCRUMB]}
      active={errorMessage !== ""}
      message={errorMessage}
      discardMessage={() => setErrorMessage("")}
    >
      <div className="box">
        <h1 className="title">
          {intl.formatMessage({
            description: "Contact title",
            defaultMessage: "Kontakt"
          })}
        </h1>
        <ContactForm
          id="0"
          subjects={[
            intl.formatMessage({
              description: "Contact subject 1",
              defaultMessage: "Ich benötige Hilfe"
            }),
            intl.formatMessage({
              description: "Contact subject 2",
              defaultMessage: "Ich benötige weitere Informationen"
            }),
            intl.formatMessage({
              description: "Contact subject 3",
              defaultMessage: "Etwas anderes"
            })
          ]}
          notifySubmitted={notifySubmitted}
          setErrorMessage={setErrorMessage}
        />
      </div>
    </BasePage>
  );
}
