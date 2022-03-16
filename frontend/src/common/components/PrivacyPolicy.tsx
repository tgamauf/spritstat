import React from "react";

import BasePage from "./BasePage";
import {useIntl} from "react-intl";

export default function PrivacyPolicy() {
  const intl = useIntl();

  return (
    <BasePage>
      <div className="columns is-centered mx-auto">
        <div className="column is-10">
          <div className="content">
            <h1 className="title">
              {intl.formatMessage({
                description: "PrivacyPolicy title",
                defaultMessage: "Datenschutzerklärung"
              })}
            </h1>
            <div className="block">
              <h4 className="subtitle">
                {intl.formatMessage({
                  description: "PrivacyPolicy basic subtitle",
                  defaultMessage: "Grundlegendes"
                })}
              </h4>
              <p>
                {intl.formatMessage({
                  description: "PrivacyPolicy basic paragraph 1",
                  defaultMessage: "Diese Datenschutzerklärung soll die Nutzer dieser " +
                    "Website über die Art, den Umfang und den Zweck der Erhebung und " +
                    "Verwendung personenbezogener Daten durch den Websitebetreiber " +
                    "Thomas Gamauf informieren."
                })}
              </p>
              <p>
                {intl.formatMessage({
                  description: "PrivacyPolicy basic paragraph 2",
                  defaultMessage: "Der Websitebetreiber nimmt Ihren Datenschutz sehr " +
                    "ernst und behandelt Ihre personenbezogenen Daten vertraulich und " +
                    "entsprechend der gesetzlichen Vorschriften. Da durch neue " +
                    "Technologien und die ständige Weiterentwicklung dieser Webseite " +
                    "Änderungen an dieser Datenschutzerklärung vorgenommen werden " +
                    "können, empfehlen wir Ihnen sich die Datenschutzerklärung in " +
                    "regelmäßigen Abständen wieder durchzulesen."
                })}
              </p>
              <p>
                {intl.formatMessage({
                  description: "PrivacyPolicy basic paragraph 3",
                  defaultMessage: "Definitionen der verwendeten Begriffe (z.B. " +
                    "“personenbezogene Daten” oder “Verarbeitung”) finden Sie in Art. " +
                    "4 DSGVO."
                })}
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle">
                {intl.formatMessage({
                  description: "PrivacyPolicy account data subtitle",
                  defaultMessage: "Zugriffsdaten"
                })}
              </h4>
              <div>
                {intl.formatMessage({
                  description: "PrivacyPolicy account data paragraph 1",
                  defaultMessage: "Wir, der Websitebetreiber bzw. Seitenprovider, " +
                    "erheben aufgrund unseres berechtigten Interesses (s. Art. 6 Abs. " +
                    "1 lit. f. DSGVO) Daten über Zugriffe auf die Website und " +
                    "speichern diese als „Server-Logfiles“ auf dem Server der " +
                    "Website ab. Folgende Daten werden so protokolliert:\n" +
                    "<ul>\n" +
                    "  <li>Besuchte Website</li>\n" +
                    "  <li>Uhrzeit zum Zeitpunkt des Zugriffes</li>\n" +
                    "  <li>Menge der gesendeten Daten in Byte</li>\n" +
                    "  <li>Quelle/Verweis, von welchem Sie auf die Seite gelangten</li>\n" +
                    "  <li>Verwendeter Browser</li>\n" +
                    "  <li>Verwendetes Betriebssystem</li>\n" +
                    "  <li>Verwendete IP-Adresse</li>\n" +
                    "</ul>"
                  },
                  {
                    ul: block => <ul>{block}</ul>,
                    li: str => <li>{str}</li>
                  }
                )}
              </div>
              <p>
                {intl.formatMessage({
                  description: "PrivacyPolicy account data paragraph 2",
                  defaultMessage: "Die Server-Logfiles werden für maximal 30 Tage " +
                    "gespeichert und anschließend gelöscht. Die Speicherung der " +
                    "Daten erfolgt aus Sicherheitsgründen, um z. B. Missbrauchsfälle " +
                    "aufklären zu können. Müssen Daten aus Beweisgründen aufgehoben " +
                    "werden, sind sie solange von der Löschung ausgenommen bis der " +
                    "Vorfall endgültig geklärt ist."
                })}
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle">
                {intl.formatMessage({
                  description: "PrivacyPolicy cookies subtitle",
                  defaultMessage: "Cookies"
                })}
              </h4>
              <p>
                {intl.formatMessage({
                  description: "PrivacyPolicy cookies paragraph 1",
                  defaultMessage: "Diese Website verwendet nur technisch notwendige " +
                    "Cookies die der Authentifizierung und dem Session-Management " +
                    "dienen."
                })}
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle">
                {intl.formatMessage({
                  description: "PrivacyPolicy personal data subtitle",
                  defaultMessage: "Erfassung und Verarbeitung personenbezogener Daten."
                })}
              </h4>
              <p>
                {intl.formatMessage({
                  description: "PrivacyPolicy personal data paragraph 1",
                  defaultMessage: "Der Websitebetreiber erhebt, nutzt und gibt Ihre " +
                    "personenbezogenen Daten nur dann weiter, wenn dies im " +
                    "gesetzlichen Rahmen erlaubt ist oder Sie in die Datenerhebung " +
                    "einwilligen. Als personenbezogene Daten gelten sämtliche " +
                    "Informationen, welche dazu dienen, Ihre Person zu bestimmen und " +
                    "welche zu Ihnen zurückverfolgt werden können – also " +
                    "beispielsweise Ihre E-Mail-Adresse.."
                })}
              </p>
              <p>
                {intl.formatMessage({
                  description: "PrivacyPolicy personal data paragraph 2",
                  defaultMessage: "Wir verarbeiten nur die im Zuge der Registrierung " +
                    "angegebene E-Mail-Adresse. Diese wird nur zur Identifikation " +
                    "des Benutzers und zur Zusendung von E-Mails die der " +
                    "Funktionserhaltung dienen (z. B. Passwort-Reset). Alle " +
                    "personenbezogenen Daten werden bei Löschung des Accounts " +
                    "entfernt."
                })}
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle">
                {intl.formatMessage({
                  description: "PrivacyPolicy contact data subtitle",
                  defaultMessage: "Umgang mit Kontaktdaten"
                })}
              </h4>
              <p>
                {intl.formatMessage({
                  description: "PrivacyPolicy contact data paragraph 1",
                  defaultMessage: "Nehmen Sie mit uns als Websitebetreiber durch die " +
                    "angebotenen Kontaktmöglichkeiten Verbindung auf, werden Ihre " +
                    "Angaben gespeichert, damit auf diese zur Bearbeitung und " +
                    "Beantwortung Ihrer Anfrage zurückgegriffen werden kann. Ohne " +
                    "Ihre Einwilligung werden diese Daten nicht an Dritte " +
                    "weitergegeben."
                })}
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle">
                {intl.formatMessage({
                  description: "PrivacyPolicy user rights subtitle",
                  defaultMessage: "Rechte des Nutzers"
                })}
              </h4>
              <p>
                {intl.formatMessage({
                  description: "PrivacyPolicy user rights paragraph 1",
                  defaultMessage: "Sie haben als Nutzer das Recht, auf Antrag eine " +
                    "kostenlose Auskunft darüber zu erhalten, welche personenbezogenen " +
                    "Daten über Sie gespeichert wurden. Sie haben außerdem das Recht " +
                    "auf Berichtigung falscher Daten und auf die " +
                    "Verarbeitungseinschränkung oder Löschung Ihrer personenbezogenen " +
                    "Daten. Falls zutreffend, können Sie auch Ihr Recht auf " +
                    "Datenportabilität geltend machen. Sollten Sie annehmen, dass " +
                    "Ihre Daten unrechtmäßig verarbeitet wurden, können Sie eine " +
                    "Beschwerde bei der zuständigen Aufsichtsbehörde einreichen."
                })}
              </p>
            </div>
            <div className="block">
              <h4 className="subtitle">
                {intl.formatMessage({
                  description: "PrivacyPolicy right of objection subtitle",
                  defaultMessage: "Widerspruchsrecht"
                })}
              </h4>
              <p>
                {intl.formatMessage({
                  description: "PrivacyPolicy right of objection paragraph 1",
                  defaultMessage: "Nutzer dieser Webseite können von ihrem " +
                    "Widerspruchsrecht Gebrauch machen und der Verarbeitung ihrer " +
                    "personenbezogenen Daten zu jeder Zeit widersprechen."
                })}
              </p>
              <p>
                {intl.formatMessage({
                  description: "PrivacyPolicy right of objection paragraph 2",
                  defaultMessage: "Wenn Sie eine Berichtigung, Sperrung, Löschung " +
                    "oder Auskunft über die zu Ihrer Person gespeicherten " +
                    "personenbezogenen Daten wünschen oder Fragen bzgl. der " +
                    "Erhebung, Verarbeitung oder Verwendung Ihrer personenbezogenen " +
                    "Daten haben oder erteilte Einwilligungen widerrufen möchten, " +
                    "nutzen Sie bitte das Kontaktformular das Ihnen nach dem " +
                    "Anmelden zur Verfügung steht."
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </BasePage>
  );
}
