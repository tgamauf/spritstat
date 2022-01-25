import React from "react";

import CenteredBox from "../../components/CenteredBox";
import BasePage from "../../components/BasePage";

export default function Imprint() {
  return (
    <BasePage>
      <CenteredBox>
        <h1 className="title">Impressum</h1>
        <div className="block">
          <p className="block">
            Diese Website wird als ein Hobbyprojekt betrieben.
          </p>
          <table className="table">
            <tbody>
              <tr>
                <th className="has-text-right">Inhaber:</th>
                <td>Thomas Gamauf</td>
              </tr>
              <tr>
                <th className="has-text-right">Ort:</th>
                <td>Wien</td>
              </tr>
              <tr>
                <th className="has-text-right">Kontakt:</th>
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
