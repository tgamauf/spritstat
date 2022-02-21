import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons";

import ContactForm from "./ContactForm";
import BasePage from "../../common/components/BasePage";
import {RouteNames} from "../../common/types";

const BREADCRUMB = {
  name: "Kontakt",
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
        <h1 className="title">Kontakt</h1>
        <ContactForm
          id="0"
          subjects={[
            "Ich benötige Hilfe",
            "Ich benötige weitere Informationen",
            "Etwas anderes",
          ]}
          notifySubmitted={notifySubmitted}
          setErrorMessage={setErrorMessage}
        />
      </div>
    </BasePage>
  );
}