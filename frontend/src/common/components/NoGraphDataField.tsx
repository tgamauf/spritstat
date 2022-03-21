import React from "react";
import {useIntl} from "react-intl";


export default function NoGraphDataField(): JSX.Element {
  const intl = useIntl();

  return (
    <span>
      {intl.formatMessage({
        description: "NoGraphDataField",
        defaultMessage: "Die Aufzeichnung hat gerade erst begonnen, daher sind noch " +
          "keine Daten vorhanden."
      })}
    </span>
  );
}