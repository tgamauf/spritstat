import React, {useCallback, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";
import introJs from "intro.js";
import {useIntl} from "react-intl";

import {RouteNames} from "../../common/types";
import LocationCard from "./LocationCard";
import {useGetLocationsQuery} from "./locationApiSlice";
import {getFormattedIntroOption, useAppSelector} from "../../common/utils";
import {selectIntroSettingsLocationList} from "../../common/settings/settingsSlice";
import {useSetSettingMutation} from "../../common/apis/spritstatApi";
import {LOCATION_FIELD_ID} from "./LocationField";
import {CURRENT_PRICE_FIELD_ID} from "./CurrentPriceField";


const BTN_ADD_LOCATION_ID = "btn-add";
const CARD_LOCATION_ID_PREFIX = "card-";

interface Props {
  setErrorMessage: (msg: string) => void;
}

export default function LocationList({setErrorMessage}: Props): JSX.Element {
  const {data: locations, isFetching} = useGetLocationsQuery();
  const introActive = useAppSelector(selectIntroSettingsLocationList);
  const [setSettings] = useSetSettingMutation();
  const [introDone, setIntroDone] = useState(false);
  const intl = useIntl();

  const setErrorMessageCallback = useCallback(
    (msg: string) => setErrorMessage(msg),
    []
  );

  useEffect(() => {
    if (introDone) {
      setIntroDone(false);

      setSettings({intro: {location_list_active: false}}).unwrap()
        .catch((e) => {
          console.error(`Failed to disable LocationList intro: ${JSON.stringify(e, null, 2)}`);
        })
    }
  }, [introDone]);

  useEffect(() => {
    if (introActive) {
      introJs().setOptions({
        ...getFormattedIntroOption(intl),
        steps: [
          {
            intro: intl.formatMessage({
              description: "LocationList intro 1",
              defaultMessage: "Auf dieser Seite werden alle deine Orte angezeigt."
            })
          },
          {
            element: `#${CARD_LOCATION_ID_PREFIX}0`,
            intro: intl.formatMessage({
              description: "LocationList intro 2",
              defaultMessage: "Für jeden deiner Orte wird eine Übersicht angezeigt. " +
                "Klicke auf den Ort um die detaillierte Statistiken des Ortes zu " +
                "erhalten."
            })
          },
          {
            element: `#${LOCATION_FIELD_ID}`,
            intro: intl.formatMessage({
              description: "LocationList intro 3",
              defaultMessage: "Die Beschreibung des Ortes enthält den Namen und den " +
                "Treibstofftyp."
            })
          },
          {
            element: `#${CURRENT_PRICE_FIELD_ID}`,
            intro: intl.formatMessage({
              description: "LocationList intro 4",
              defaultMessage: "Außerdem wird der aktuell niedrigste Preis für den " +
                "angegebenen Treibstofftyp und die Tankstellen die diesen anbieten " +
                "angezeigt."
            })
          },
          {
            element: `#${BTN_ADD_LOCATION_ID}`,
            intro: intl.formatMessage({
              description: "LocationList intro 5",
              defaultMessage: "Klicke hier um einen neuen Ort hinzuzufügen."
            })
          }
        ]
      }).onexit(() => setIntroDone(true)).start();
    }
  }, [introActive]);

  return (
    <div data-test="location-list">
      <div className="container">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h1 className="title">
                {intl.formatMessage({
                  description: "LocationList title",
                  defaultMessage: "Deine Orte"
                })}
              </h1>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item mr-3">
              <Link to={RouteNames.AddLocation}>
                <button
                  className="button is-primary is-outlined is-small"
                  title={intl.formatMessage({
                    description: "LocationList add button title",
                    defaultMessage: "Fügen einen neuen Ort hinzu für den Spritpreise " +
                      "aufgezeichnet werden sollen."
                  })}
                  data-test="btn-add-location-small"
                  id={BTN_ADD_LOCATION_ID}
                >
                  <FontAwesomeIcon className="icon" icon={faMapMarkerAlt} />
                  <span>
                    {intl.formatMessage({
                      description: "LocationList add button text",
                      defaultMessage: "Hinzufügen"
                    })}
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
        {!isFetching && locations && locations.map((location, index) => {
          return (
            <div key={location.id} id={`${CARD_LOCATION_ID_PREFIX}${index}`}>
              <LocationCard
                location={location}
                setErrorMessage={setErrorMessageCallback}
              />
            </div>
          );
       })}
      </div>
    </div>
  );
}

export type {
  Props as LocationListProps
}
