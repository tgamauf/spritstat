import React from "react";
import {Trans} from "@lingui/macro";


export default function NoGraphDataField(): JSX.Element {
  return (
    <span>
      <Trans>
        Die Aufzeichnung hat gerade erst begonnen, daher sind noch keine Daten
        vorhanden.
      </Trans>
    </span>
  );
}