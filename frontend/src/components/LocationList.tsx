import React, {useCallback, useEffect, useState} from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

import {apiGetStations} from "../services/api";
import {Location, RouteNames, StationMap} from "../utils/types";
import LocationCard from "./LocationCard";
import DeleteLocationModal, {NO_LOCATION_ID} from "./DeleteLocationModal";

interface Props {
  locations: Location[];
  setErrorMessage: (msg: string) => void;
  triggerLocationsRefresh: () => void;
}

export default function LocationList(
  {locations, setErrorMessage, triggerLocationsRefresh}: Props
): JSX.Element {
  const [locationToDelete, setLocationToDelete] =
    useState<number>(NO_LOCATION_ID);
  const [stations, setStations] = useState<StationMap>([]);

  useEffect(() => {
    apiGetStations()
      .then((stations_) => {
        setStations(stations_.reduce(function(map: StationMap, item) {
            map[item.id] = item;
            return map;
          }, {})
        );
      })
      .catch((error) => {
        // We aren't notifying the user about this as stations aren't mandatory
        console.error(`Failed to get stations: ${error}`);
      });
  }, []);

  const setErrorMessageCallback = useCallback(
    (msg: string) => setErrorMessage(msg),
    []
  );

  const setLocationToDeleteCallback = useCallback(
    (id: number) => setLocationToDelete(id),
    []
  );

  function closeDeleteLocationModal() {
    setLocationToDelete(NO_LOCATION_ID);
  }

  function notifyLocationDeleted() {
    setLocationToDelete(NO_LOCATION_ID);
    triggerLocationsRefresh();
  }

  return (
    <div data-test="location-list">
      <DeleteLocationModal
        locationId={locationToDelete}
        close={closeDeleteLocationModal}
        notifyDeleted={notifyLocationDeleted}
        setErrorMessage={setErrorMessage}
      />
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
                >
                  <FontAwesomeIcon className="icon" icon={faMapMarkerAlt} />
                  <span>Hinzufügen</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
        {locations.map((location) => {
          return (
            <LocationCard
              key={location.id}
              location={location}
              stations={stations}
              setLocationToDelete={setLocationToDeleteCallback}
              setErrorMessage={setErrorMessageCallback}
            />
          );
        })}
      </div>
    </div>
  );
}

export type {
  Props as LocationListProps
}
