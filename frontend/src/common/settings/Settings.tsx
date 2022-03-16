import React, {useState} from "react";
import {Link} from "react-router-dom";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import {defineMessage, t, Trans} from "@lingui/macro";

import DeleteAccountModal from "./DeleteAccountModal";
import BasePage from "../components/BasePage";
import {RouteNames} from "../types";
import {useAppSelector} from "../utils";
import {selectEmail} from "../auth/accountSlice";
import {BreadcrumbItem} from "../components/Breadcrumb";
import {selectIntroActive, selectNotificationsActive} from "./settingsSlice";
import SettingsSwitch from "./SettingsSwitch";

const BREADCRUMB: BreadcrumbItem = {
  name: defineMessage({id: "breadcrumb.settings", message: "Einstellungen"}),
  icon: faCog,
  destination: RouteNames.Settings,
};

export default function Settings(): JSX.Element {
  const email = useAppSelector(selectEmail);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  return (
    <BasePage
      breadcrumbItems={[BREADCRUMB]}
      active={errorMessage !== ""}
      message={errorMessage}
      discardMessage={() => setErrorMessage("")}
    >
      <DeleteAccountModal
        show={showDeleteAccount}
        close={() => setShowDeleteAccount(false)}
        setErrorMessage={setErrorMessage}
      />
      <section className="section">
        <h1 className="title"><Trans>Einstellungen</Trans></h1>
        <div className="settings-block">
          <h2 className="subtitle"><Trans>Kontodaten</Trans></h2>
          <hr />
          <table className="table is-fullwidth">
            <tbody>
              <tr>
                <td className="key"><Trans>Email</Trans></td>
                <td data-test="text-email">{email}</td>
                <td />
              </tr>
              <tr>
                <td className="key"><Trans>Passwort</Trans></td>
                <td>************</td>
                <td>
                  <Link
                    className="has-text-primary"
                    to={RouteNames.ChangePassword}
                    data-test="link-change-password"
                  >
                    <Trans>Passwort ändern</Trans>
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="settings-block">
          <h2 className="subtitle"><Trans>Funktionalität</Trans></h2>
          <hr />
          <SettingsSwitch
            id="intro"
            label={t`Aktiviere/deaktiviere die Einführung`}
            selectorFn={selectIntroActive}
            settingsFn={(value) => ({
              intro: {
                add_location_active: value,
                location_details_active: value,
                location_list_active: value,
                no_location_active: value
              }
            })
            }
          />
          <SettingsSwitch
            id="notifications"
            label={t`Aktiviere/deaktiviere Benachrichtigungen`}
            selectorFn={selectNotificationsActive}
            settingsFn={(value) => ({notifications_active: value})}
          />
        </div>
        <div className="settings-block">
          <h2 className="subtitle has-text-danger"><Trans>Konto löschen</Trans></h2>
          <hr />
          <p>
            <Trans>
              Nach dem Löschen kann das Konto nicht mehr wiederhergestellt
              werden. Bitte klicke nur wenn du dir sicher bist!
            </Trans>
          </p>
          <p className="mt-2">
            <button
              className="button is-danger"
              onClick={() => setShowDeleteAccount(true)}
              data-test="btn-open-delete-account"
            >
              <Trans>Löschen</Trans>
            </button>
          </p>
        </div>
      </section>
    </BasePage>
  );
}

export {BREADCRUMB as SETTINGS_BREADCRUMB};
