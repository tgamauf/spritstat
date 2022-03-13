import React from "react";
import {Trans} from "@lingui/macro";

import CenteredBox from "./CenteredBox";
import BasePage from "./BasePage";

export default function Imprint() {
  return (
    <BasePage>
      <CenteredBox>
        <h1 className="title">Impressum</h1>
        <div className="block has-text-left">
          <p>
            <Trans>
              Diese Website wird als ein Hobbyprojekt betrieben, daher sind alle Angaben ohne gewähr.
            </Trans>
          </p>
          <p>
            <Trans>
              Die Website ist Open Source und der Quellcode ist
              <a
                className="has-text-primary"
                href="https://github.com/tgamauf/spritstat"
                target="_blank"
                rel="noopener noreferrer"
              > hier </a>
              zu finden - ich freue mich wenn du mir hilfst die Seite besser zu machen! :)
            </Trans>
          </p>
        </div>
        <div className="block">
          <table className="table has-no-lines is-fullwidth is-narrow has-text-left">
            <tbody>
              <tr>
                <td className="key has-text-weight-medium">
                  <Trans>Inhaber:</Trans>
                </td>
                <td>Thomas Gamauf</td>
              </tr>
              <tr>
                <td className="key has-text-weight-medium">
                  <Trans>Ort:</Trans>
                </td>
                <td><Trans>Wien</Trans></td>
              </tr>
              <tr>
                <td className="key has-text-weight-medium">
                  <Trans>Kontakt:</Trans>
                </td>
                <td>
                  <a
                    className="has-text-primary"
                    href="https://at.linkedin.com/in/thomas-gamauf-15aa96105"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CenteredBox>
    </BasePage>
  );
}
