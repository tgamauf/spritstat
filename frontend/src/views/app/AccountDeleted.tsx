import React from "react";
import CenteredBox from "../../components/CenteredBox";
import BasePage from "../../components/BasePage";

export default function AccountDeleted() {
  return (
    <BasePage>
      <CenteredBox>
        <div className="content has-text-centered">
          <p>Es tut uns leid dass du deinen Account gelöscht hast.</p>
          <p>Hoffentlich sehen wir uns trotzdem bald wieder!</p>
        </div>
      </CenteredBox>
    </BasePage>
  );
}
