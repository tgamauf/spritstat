import React from "react";
import {Link} from "react-router-dom";
import {RouteNames} from "../types";

export default function HeaderLoginButton(): JSX.Element {
  return (
    <div className="navbar-item">
      <Link
        className="button is-link is-outlined"
        to={RouteNames.Login}
        data-test="header-btn-login"
      >
        Anmelden
      </Link>
    </div>
  );
}
