import React, {useCallback, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";

import {RouteNames} from "../../common/types";
import LocationCard from "./LocationCard";
import {useGetLocationsQuery} from "./locationApiSlice";
import {useAppSelector} from "../../common/utils";
import {selectIntroSettingsLocationList} from "../../common/settings/settingsSlice";
import {useSetSettingMutation} from "../../common/apis/spritstatApi";
import {Steps} from "intro.js-react";
import {INTRO_OPTIONS} from "../../common/constants";


const BTN_ADD_LOCATION_ID = "btn-add";
const CARD_LOCATION_ID_PREFIX = "card-";

interface Props {
  setErrorMessage: (msg: string) => void;
}

export default function LocationList({setErrorMessage}: Props): JSX.Element {
  const {data: locations} = useGetLocationsQuery();
  const introActive = useAppSelector(selectIntroSettingsLocationList);
  const [setSettings] = useSetSettingMutation();
  const [introDone, setIntroDone] = useState(false);

  const setErrorMessageCallback = useCallback(
    (msg: string) => setErrorMessage(msg),
    []
  );

  useEffect(() => {
    if (introDone) {
      setIntroDone(false);

      setSettings({intro: {no_location_active: false}}).unwrap()
        .catch((e) => {
          console.error(`Failed to disable NoLocation intro: ${JSON.stringify(e, null, 2)}`);
        })
    }
  }, [introDone]);

  return (
    <div data-test="location-list">
      <div className="container">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h1 className="title">Deine Orte</h1>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item mr-3">
              <Link to={RouteNames.AddLocation}>
                <button
                  className="button is-primary is-outlined is-small"
                  title="Fügen einen neuen Ort hinzu für den Spritpreise
                    aufgezeichnet werden sollen."
                  data-test="btn-add-location-small"
                  id={BTN_ADD_LOCATION_ID}
                >
                  <FontAwesomeIcon className="icon" icon={faMapMarkerAlt} />
                  <span>Hinzufügen</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
        {locations && locations.map((location, index) => {
          return (
            <div id={`${CARD_LOCATION_ID_PREFIX}${index}`}>
              <LocationCard
                key={location.id}
                location={location}
                setErrorMessage={setErrorMessageCallback}
              />
            </div>
          );
       })}
      </div>
      <Steps
        enabled={introActive}
        steps={[
          {
            intro: "Auf dieser Seite werden alle deine Orte angezeigt."
          },
          {
            element: `#${CARD_LOCATION_ID_PREFIX}0`,
            intro: "Klicke auf einen Ort um die detaillierte Statistiken des Ortes zu erhalten."
          },
          {
            element: `#${BTN_ADD_LOCATION_ID}`,
            intro: "Klicke hier um einen neuen Ort hinzuzufügen."
          }
        ]}
        initialStep={0}
        onExit={() => setIntroDone(true)}
        options={INTRO_OPTIONS}
      />
    </div>
  );
}

export type {
  Props as LocationListProps
}
