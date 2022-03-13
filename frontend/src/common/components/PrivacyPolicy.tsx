import React from "react";
import {Link} from "react-router-dom";
import { Trans } from "@lingui/macro";

import {RouteNames} from "../types";
import BasePage from "./BasePage";
import {useAppSelector} from "../utils";
import {selectIsAuthenticated} from "../auth/accountSlice";

export default function PrivacyPolicy() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  let contactFormLink = <span> <Trans>Kontaktformular</Trans> </span>;
  if (isAuthenticated) {
    contactFormLink = (
      <Link className="has-text-primary" to={RouteNames.Contact}>
        {contactFormLink}
      </Link>
    );
 }
  return (
    <BasePage>
      <div className="columns is-centered mx-auto">
        <div className="column is-10">
          <div className="content">
            <h1 className="title"><Trans>Datenschutzerklärung</Trans></h1>
            <div className="block">
              <h4 className="subtitle"><Trans>Grundlegendes</Trans></h4>
              <p>
                <Trans>
                  Diese Datenschutzerklärung soll die Nutzer dieser Website über
                  die Art, den Umfang und den Zweck der Erhebung und Verwendung
                  personenbezogener Daten durch den Websitebetreiber Thomas Gamauf
                  informieren.
                </Trans>
              </p>
              <p>
                <Trans>
                  Der Websitebetreiber nimmt Ihren Datenschutz sehr ernst und
                  behandelt Ihre personenbezogenen Daten vertraulich und
                  entsprechend der gesetzlichen Vorschriften. Da durch neue
                  Technologien und die ständige Weiterentwicklung dieser Webseite
                  Änderungen an dieser Datenschutzerklärung vorgenommen werden
                  können, empfehlen wir Ihnen sich die Datenschutzerklärung in
                  regelmäßigen Abständen wieder durchzulesen.
                </Trans>
              </p>
              <p>
                <Trans>
                  Definitionen der verwendeten Begriffe (z.B. “personenbezogene
                  Daten” oder “Verarbeitung”) finden Sie in Art. 4 DSGVO.
                </Trans>
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle"><Trans>Zugriffsdaten</Trans></h4>
              <div>
                <Trans>
                  Wir, der Websitebetreiber bzw. Seitenprovider, erheben aufgrund
                  unseres berechtigten Interesses (s. Art. 6 Abs. 1 lit. f. DSGVO)
                  Daten über Zugriffe auf die Website und speichern diese als
                  „Server-Logfiles“ auf dem Server der Website ab. Folgende Daten
                  werden so protokolliert:
                </Trans>
                <Trans>
                  <ul>
                    <li>Besuchte Website</li>
                    <li>Uhrzeit zum Zeitpunkt des Zugriffes</li>
                    <li>Menge der gesendeten Daten in Byte</li>
                    <li>Quelle/Verweis, von welchem Sie auf die Seite gelangten</li>
                    <li>Verwendeter Browser</li>
                    <li>Verwendetes Betriebssystem</li>
                    <li>Verwendete IP-Adresse</li>
                  </ul>
                </Trans>
              </div>
              <p>
                <Trans>
                  Die Server-Logfiles werden für maximal 30 Tage gespeichert und
                  anschließend gelöscht. Die Speicherung der Daten erfolgt aus
                  Sicherheitsgründen, um z. B. Missbrauchsfälle aufklären zu
                  können. Müssen Daten aus Beweisgründen aufgehoben werden, sind
                  sie solange von der Löschung ausgenommen bis der Vorfall
                  endgültig geklärt ist.
                </Trans>
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle"><Trans>Cookies</Trans></h4>
              <p>
                <Trans>
                  Diese Website verwendet nur technisch notwendige Cookies die der
                  Authentifizierung und dem Session-Management dienen.
                </Trans>
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle">
                <Trans>Erfassung und Verarbeitung personenbezogener Daten</Trans>
              </h4>
              <p>
                <Trans>
                  Der Websitebetreiber erhebt, nutzt und gibt Ihre
                  personenbezogenen Daten nur dann weiter, wenn dies im
                  gesetzlichen Rahmen erlaubt ist oder Sie in die Datenerhebung
                  einwilligen. Als personenbezogene Daten gelten sämtliche
                  Informationen, welche dazu dienen, Ihre Person zu bestimmen und
                  welche zu Ihnen zurückverfolgt werden können – also
                  beispielsweise Ihre E-Mail-Adresse.
                </Trans>
              </p>
              <p>
                <Trans>
                  Wir verarbeiten nur die im Zuge der Registrierung angegebene
                  E-Mail-Adresse. Diese wird nur zur Identifikation des Benutzers
                  und zur Zusendung von E-Mails die der Funktionserhaltung dienen
                  (z. B. Passwort-Reset). Alle personenbezogenen Daten werden bei
                  Löschung des Accounts entfernt.
                </Trans>
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle"><Trans>Umgang mit Kontaktdaten</Trans></h4>
              <p>
                <Trans>
                  Nehmen Sie mit uns als Websitebetreiber durch die angebotenen
                  Kontaktmöglichkeiten Verbindung auf, werden Ihre Angaben
                  gespeichert, damit auf diese zur Bearbeitung und Beantwortung
                  Ihrer Anfrage zurückgegriffen werden kann. Ohne Ihre
                  Einwilligung werden diese Daten nicht an Dritte weitergegeben.
                </Trans>
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle"><Trans>Rechte des Nutzers</Trans></h4>
              <p>
                <Trans>
                  Sie haben als Nutzer das Recht, auf Antrag eine kostenlose
                  Auskunft darüber zu erhalten, welche personenbezogenen Daten
                  über Sie gespeichert wurden. Sie haben außerdem das Recht auf
                  Berichtigung falscher Daten und auf die
                  Verarbeitungseinschränkung oder Löschung Ihrer personenbezogenen
                  Daten. Falls zutreffend, können Sie auch Ihr Recht auf
                  Datenportabilität geltend machen. Sollten Sie annehmen, dass
                  Ihre Daten unrechtmäßig verarbeitet wurden, können Sie eine
                  Beschwerde bei der zuständigen Aufsichtsbehörde einreichen.
                </Trans>
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle"><Trans>Widerspruchsrecht</Trans></h4>
              <p>
                <Trans>
                  Nutzer dieser Webseite können von ihrem Widerspruchsrecht
                  Gebrauch machen und der Verarbeitung ihrer personenbezogenen
                  Daten zu jeder Zeit widersprechen.
                </Trans>
              </p>
              <p>
                <Trans>
                  Wenn Sie eine Berichtigung, Sperrung, Löschung oder Auskunft
                  über die zu Ihrer Person gespeicherten personenbezogenen Daten
                  wünschen oder Fragen bzgl. der Erhebung, Verarbeitung oder
                  Verwendung Ihrer personenbezogenen Daten haben oder erteilte
                  Einwilligungen widerrufen möchten, nutzen Sie bitte das
                  {contactFormLink} das Ihnen nach dem Anmelden zur Verfügung
                  steht.
                </Trans>
              </p>
            </div>
          </div>
        </div>
      </div>
    </BasePage>
  );
}
