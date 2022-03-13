import React from "react";
import {Link} from "react-router-dom";
import {Trans} from "@lingui/macro";

import CenteredBox from "./CenteredBox";
import {RouteNames} from "../types";
import BasePage from "./BasePage";

export default function NoMatch() {
  return (
    <BasePage>
      <CenteredBox>
        <div className="has-text-centered">
          <p className="huge-text">
            4<span className="has-text-info">0</span>4
          </p>
          <p>
            <Trans>
              Die gewünschte Seite konnte leider nicht gefunden werden.
            </Trans>
          </p>
          <p className="mt-4">
            <Link className="has-text-primary is-size-2" to={RouteNames.Index}>
              <Trans>Startseite</Trans>
            </Link>
          </p>
        </div>
      </CenteredBox>
    </BasePage>
  );
}
