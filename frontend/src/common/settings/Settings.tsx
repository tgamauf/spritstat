import React, {useState} from "react";
import {Link} from "react-router-dom";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import {defineMessage, useIntl} from "react-intl";

import DeleteAccountModal from "./DeleteAccountModal";
import BasePage from "../components/BasePage";
import {RouteNames} from "../types";
import {useAppSelector} from "../utils";
import {selectEmail} from "../auth/accountSlice";
import {BreadcrumbItem} from "../components/Breadcrumb";
import {selectIntroActive, selectNotificationsActive} from "./settingsSlice";
import SettingsSwitch from "./SettingsSwitch";

const BREADCRUMB: BreadcrumbItem = {
  name: defineMessage({
    description: "Settings breadcrumb",
    defaultMessage: "Einstellungen"
  }),
  icon: faCog,
  destination: RouteNames.Settings,
};

export default function Settings(): JSX.Element {
  const email = useAppSelector(selectEmail);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const intl = useIntl();

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
        <h1 className="title">
          {intl.formatMessage({
            description: "Settings title",
            defaultMessage: "Einstellungen"
          })}
        </h1>
        <div className="settings-block">
          <h2 className="subtitle">
            {intl.formatMessage({
              description: "Settings account data subtitle",
              defaultMessage: "Kontodaten"
            })}
          </h2>
          <hr />
          <table className="table is-fullwidth">
            <tbody>
              <tr>
                <td className="key">
                  {intl.formatMessage({
                    description: "Settings key email",
                    defaultMessage: "Email"
                  })}
                </td>
                <td data-test="text-email">{email}</td>
                <td />
              </tr>
              <tr>
                <td className="key">
                  {intl.formatMessage({
                    description: "Settings key password",
                    defaultMessage: "Passwort"
                  })}
                </td>
                <td>************</td>
                <td>
                  <Link
                    className="has-text-primary"
                    to={RouteNames.ChangePassword}
                    data-test="link-change-password"
                  >
                    {intl.formatMessage({
                      description: "Settings link password change",
                      defaultMessage: "Passwort ändern"
                    })}
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="settings-block">
          <h2 className="subtitle">
            {intl.formatMessage({
              description: "Settings functionality subtitle",
              defaultMessage: "Funktionalität"
            })}
          </h2>
          <hr />
          <SettingsSwitch
            id="intro"
            label={
              intl.formatMessage({
                description: "Settings switch intro",
                defaultMessage: "Aktiviere/deaktiviere die Einführung"
              })
            }
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
            label={
              intl.formatMessage({
                description: "Settings switch notifications",
                defaultMessage: "Aktiviere/deaktiviere Benachrichtigungen"
              })
            }
            selectorFn={selectNotificationsActive}
            settingsFn={(value) => ({notifications_active: value})}
          />
        </div>
        <div className="settings-block">
          <h2 className="subtitle has-text-danger">
            {intl.formatMessage({
              description: "Settings delete account subtitle",
              defaultMessage: "Konto löschen"
            })}
          </h2>
          <hr />
          <p>
            {intl.formatMessage({
              description: "Settings delete account check text",
              defaultMessage: "Nach dem Löschen kann das Konto nicht mehr " +
                "wiederhergestellt werden. Bitte klicke nur wenn du dir sicher bist!"
            })}
          </p>
          <p className="mt-2">
            <button
              className="button is-danger"
              onClick={() => setShowDeleteAccount(true)}
              data-test="btn-open-delete-account"
            >
            {intl.formatMessage({
              description: "Settings delete account button",
              defaultMessage: "Löschen"
            })}
            </button>
          </p>
        </div>
      </section>
    </BasePage>
  );
}

export {BREADCRUMB as SETTINGS_BREADCRUMB};
