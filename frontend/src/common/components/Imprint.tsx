import React from "react";
import {useIntl} from "react-intl";

import CenteredBox from "./CenteredBox";
import BasePage from "./BasePage";

export default function Imprint() {
  const intl = useIntl();

  return (
    <BasePage>
      <CenteredBox>
        <h1 className="title">
          {intl.formatMessage({
            description: "Imprint title",
            defaultMessage: "Impressum"
          })}
        </h1>
        <div className="block has-text-left">
          <p>
            {intl.formatMessage({
              description: "Imprint block 1",
              defaultMessage: "Diese Website wird als ein Hobbyprojekt betrieben, " +
                "daher sind alle Angaben ohne gewähr."
            })}
          </p>
          <p>
            {intl.formatMessage({
              description: "Imprint block 2",
              defaultMessage: "Die Website ist Open Source und der Quellcode ist " +
                "<link>hier</link> zu finden - ich freue mich, wenn du mir hilfst die " +
                "Seite besser zu machen! :)"
              },
              {link: str => <a
                  className="has-text-primary"
                  href="https://github.com/tgamauf/spritstat"
                  target="_blank"
                  rel="noopener noreferrer"
                >{str}</a>
              }
            )}
          </p>
        </div>
        <div className="block">
          <table className="table has-no-lines is-fullwidth is-narrow has-text-left">
            <tbody>
              <tr>
                <td className="key has-text-weight-medium">
                  {intl.formatMessage({
                    description: "Imprint owner label",
                    defaultMessage: "Inhaber:"
                  })}
                </td>
                <td>Thomas Gamauf</td>
              </tr>
              <tr>
                <td className="key has-text-weight-medium">
                  {intl.formatMessage({
                    description: "Imprint location label",
                    defaultMessage: "Ort:"
                  })}
                </td>
                <td>
                  {intl.formatMessage({
                    description: "Imprint location value",
                    defaultMessage: "Wien"
                  })}
                </td>
              </tr>
              <tr>
                <td className="key has-text-weight-medium">
                  {intl.formatMessage({
                    description: "Imprint contact label",
                    defaultMessage: "Kontakt:"
                  })}
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
