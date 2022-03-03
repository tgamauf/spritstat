import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {faCog} from "@fortawesome/free-solid-svg-icons";

import DeleteAccountModal from "./DeleteAccountModal";
import BasePage from "../components/BasePage";
import {RouteNames} from "../types";
import {useAppSelector} from "../utils";
import {selectEmail} from "../auth/accountSlice";
import {BreadcrumbItem} from "../components/Breadcrumb";
import {selectIntroActive, setSettings} from "./settingsSlice";
import {useSetSettingMutation} from "../apis/spritstatApi";

const BREADCRUMB: BreadcrumbItem = {
  name: "Einstellungen",
  icon: faCog,
  destination: RouteNames.Settings,
};

export default function Settings(): JSX.Element {
  const [setSettings] = useSetSettingMutation();
  const email = useAppSelector(selectEmail);
  const introActive = useAppSelector(selectIntroActive);
  const [toggleIntro, setToggleIntro] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useEffect(() => {
    if (toggleIntro) {
      setToggleIntro(false);

      const active = !introActive;
      setSettings({
        intro: {
          add_location_active: active,
          location_details_active: active,
          location_list_active: active,
          no_location_active: active
        }
      }).unwrap()
        .catch((e) => {
          console.log(`Failed to toggle intro settings: ${JSON.stringify(e, null, 2)}`);
        });
    }
  }, [toggleIntro])

  return (
    <div>
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
          <h1 className="title">Einstellungen</h1>
          <div className="settings-block">
            <h2 className="subtitle">Kontodetails</h2>
            <hr />
            <table className="table is-fullwidth">
              <tbody>
                <tr>
                  <td className="has-text-right">
                    <b>Email</b>
                  </td>
                  <td data-test="text-email">{email}</td>
                  <td />
                </tr>
                <tr>
                  <td className="has-text-right">
                    <b>Password</b>
                  </td>
                  <td>************</td>
                  <td>
                    <Link
                      className="has-text-primary"
                      to={RouteNames.ChangePassword}
                      data-test="link-change-password"
                    >
                      Password ändern
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="settings-block">
            <h2 className="subtitle">Funktionen</h2>
            <hr />
            <div className="field">
              <input
                id="intro-active"
                className="switch is-rounded"
                type="checkbox"
                checked={introActive}
                onChange={() => setToggleIntro(!toggleIntro)}
              />
              <label htmlFor="intro-active" className="is-unselectable">
                Aktiviere/deaktiviere die Einführung
              </label>
            </div>
          </div>
          <div className="settings-block">
            <h2 className="subtitle has-text-danger">Konto löschen</h2>
            <hr />
            <p>
              Nach dem Löschen kann das Konto nicht mehr wiederhergestellt
              werden. Bitte klicke nur wenn du dir sicher bist!
            </p>
            <p className="mt-2">
              <button
                className="button is-danger"
                onClick={() => setShowDeleteAccount(true)}
                data-test="btn-open-delete-account"
              >
                Löschen
              </button>
            </p>
          </div>
        </section>
      </BasePage>
    </div>
  );
}

export {BREADCRUMB as SETTINGS_BREADCRUMB};
