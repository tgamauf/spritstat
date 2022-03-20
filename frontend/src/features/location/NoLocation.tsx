import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";
import introJs from "intro.js";
import {useIntl} from "react-intl";

import CenteredBox from "../../common/components/CenteredBox";
import {RouteNames} from "../../common/types";
import {getFormattedIntroOption, useAppSelector} from "../../common/utils";
import {selectIntroSettingsNoLocation} from "../../common/settings/settingsSlice";
import {useSetSettingMutation} from "../../common/apis/spritstatApi";


const BTN_ADD_LOCATION_ID = "btn-add";

export default function NoLocation() {
  const introActive = useAppSelector(selectIntroSettingsNoLocation);
  const [setSettings] = useSetSettingMutation();
  const [introDone, setIntroDone] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    if (introDone) {
      setIntroDone(false);

      setSettings({intro: {no_location_active: false}}).unwrap()
        .catch((e) => {
          console.error(`Failed to disable NoLocation intro: ${JSON.stringify(e, null, 2)}`);
        })
    }
  }, [introDone]);

  useEffect(() => {
    if (location && introActive) {
      introJs().setOptions({
        ...getFormattedIntroOption(intl),
        steps: [{
          element: `#${BTN_ADD_LOCATION_ID}`,
          intro: intl.formatMessage({
            description: "NoLocation intro 1",
            defaultMessage: "Du hast noch keinen Ort angelegt. Klicke hier um deinen " +
              "ersten Ort zu erstellen."
          })
        }]
      }).onexit(
        () => setIntroDone(true)
      ).start();
    }
  }, [introActive]);

  return (
    <div>
      <div className="tile is-anchestor" data-test="no-location">
        <div className="tile is-parent is-vertical is-align-items-center">
          <div className="tile is-child is-4">
            <p className="box has-background-info has-text-centered is-family-monospace">
              {intl.formatMessage({
                description: "NoLocation text",
                defaultMessage: "Fügen einen neuen Ort hinzu für den Spritpreise " +
                  "aufgezeichnet werden sollen."
              })}
            </p>
          </div>
          <div className="tile is-child" id={BTN_ADD_LOCATION_ID}>
            <CenteredBox>
              <Link to={RouteNames.AddLocation}>
                <div className="container has-text-centered has-text-primary">
                  <p>
                    <FontAwesomeIcon
                      className="icon is-large"
                      icon={faMapMarkerAlt}
                    />
                  </p>
                  <p className="mt-3">
                    {intl.formatMessage({
                      description: "NoLocation button text",
                      defaultMessage: "Neuen Ort hinzufügen"
                    })}
                  </p>
                </div>
              </Link>
            </CenteredBox>
          </div>
        </div>
      </div>
    </div>
  );
};
