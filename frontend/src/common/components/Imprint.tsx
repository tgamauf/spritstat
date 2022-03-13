import React from "react";

import CenteredBox from "./CenteredBox";
import BasePage from "./BasePage";

export default function Imprint() {
  return (
    <BasePage>
      <CenteredBox>
        <h1 className="title">Impressum</h1>
        <div className="block has-text-left">
          <p>
            Diese Website wird als ein Hobbyprojekt betrieben, daher alle Angaben ohne gewähr.
          </p>
          <p>
            Die Website ist Open Source, der Quellcode ist
            <a
              className="has-text-primary"
              href="https://github.com/tgamauf/spritstat"
              target="_blank"
              rel="noopener noreferrer"
            > hier </a>
            zu finden.
          </p>
        </div>
        <div className="block">
          <table className="table has-no-lines is-fullwidth is-narrow has-text-left">
            <tbody>
              <tr>
                <td className="key has-text-weight-medium">Inhaber:</td>
                <td>Thomas Gamauf</td>
              </tr>
              <tr>
                <td className="key has-text-weight-medium">Ort:</td>
                <td>Wien</td>
              </tr>
              <tr>
                <td className="key has-text-weight-medium">Kontakt:</td>
                <td>
                  <a
                    className="has-text-primary"
                    href="https://at.linkedin.com/in/thomas-gamauf-15aa96105"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Linkedin
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
