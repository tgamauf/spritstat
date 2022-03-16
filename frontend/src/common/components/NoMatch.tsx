import React from "react";
import {Link} from "react-router-dom";
import {useIntl} from "react-intl";

import CenteredBox from "./CenteredBox";
import {RouteNames} from "../types";
import BasePage from "./BasePage";

export default function NoMatch() {
  const intl = useIntl();

  return (
    <BasePage>
      <CenteredBox>
        <div className="has-text-centered">
          <p className="huge-text">
            4<span className="has-text-info">0</span>4
          </p>
          <p>
            {intl.formatMessage({
              description: "NoMatch text",
              defaultMessage: "Die gewünschte Seite konnte leider nicht gefunden werden."
            })}
          </p>
          <p className="mt-4">
            <Link className="has-text-primary is-size-2" to={RouteNames.Index}>
              {intl.formatMessage({
                description: "NoMatch link",
                defaultMessage: "Startseite"
              })}
            </Link>
          </p>
        </div>
      </CenteredBox>
    </BasePage>
  );
}
