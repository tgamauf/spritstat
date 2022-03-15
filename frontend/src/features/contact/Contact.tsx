import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons";

import ContactForm from "./ContactForm";
import BasePage from "../../common/components/BasePage";
import {RouteNames} from "../../common/types";
import {BreadcrumbItem} from "../../common/components/Breadcrumb";
import {defineMessage, t, Trans} from "@lingui/macro";

const BREADCRUMB: BreadcrumbItem = {
  name: defineMessage({id: "breadcrumb.contact", message: "Kontakt"}),
  icon: faEnvelope,
  destination: RouteNames.Contact,
};

export default function Contact(): JSX.Element {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

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
        <h1 className="title"><Trans>Kontakt</Trans></h1>
        <ContactForm
          id="0"
          subjects={[
            t`Ich benötige Hilfe`,
            t`Ich benötige weitere Informationen`,
            t`Etwas anderes`,
          ]}
          notifySubmitted={notifySubmitted}
          setErrorMessage={setErrorMessage}
        />
      </div>
    </BasePage>
  );
}
