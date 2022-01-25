import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

import ContactForm from "../../components/ContactForm";
import BasePage from "../../components/BasePage";
import { RouteNames } from "../../utils/types";
import { useGlobalState } from "../../App";

const BREADCRUMB = {
  name: "Kontakt",
  icon: faEnvelope,
  destination: RouteNames.Contact,
};

export default function Contact(): JSX.Element {
  const [{ isAuthenticated }] = useGlobalState();
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(RouteNames.Login);
    }
  });

  function notifySubmitted() {
    setErrorMessage("");
    navigate(RouteNames.Dashboard);
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
