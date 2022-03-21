import React from "react";
import {Link} from "react-router-dom";
import {useIntl} from "react-intl";

import {RouteNames} from "../types";

export default function HeaderLoginButton(): JSX.Element {
  const intl = useIntl();

  return (
    <div className="navbar-item">
      <Link
        className="button is-link is-outlined"
        to={RouteNames.Login}
        data-test="header-btn-login"
      >
        {intl.formatMessage({
          description: "HeaderLoginButton link",
          defaultMessage: "Anmelden"
        })}
      </Link>
    </div>
  );
}
