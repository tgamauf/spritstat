import React from "react";
import {useIntl} from "react-intl";

import CenteredBox from "../components/CenteredBox";
import BasePage from "../components/BasePage";

export default function AccountDeleted() {
  const intl = useIntl();

  return (
    <BasePage>
      <CenteredBox>
        <div className="content has-text-centered">
          {intl.formatMessage({
            description: "AccountDeleted text",
            defaultMessage: "<p>Es tut uns leid dass du deinen Account gelöscht " +
              "hast.</p><p>Hoffentlich sehen wir uns trotzdem bald wieder!</p>"
            },
            {p: str => <p>{str}</p>}
          )}
        </div>
      </CenteredBox>
    </BasePage>
  );
}
