import React, {useCallback} from "react";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";

import {RouteNames} from "../../common/types";
import LocationCard from "./LocationCard";
import {useGetLocationsQuery} from "./locationApiSlice";

interface Props {
  setErrorMessage: (msg: string) => void;
}

export default function LocationList({setErrorMessage}: Props): JSX.Element {
  const {data: locations} = useGetLocationsQuery();

  const setErrorMessageCallback = useCallback(
    (msg: string) => setErrorMessage(msg),
    []
  );

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
                >
                  <FontAwesomeIcon className="icon" icon={faMapMarkerAlt} />
                  <span>Hinzufügen</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
        {locations && locations.map((location) => {
          return (
            <LocationCard
              key={location.id}
              location={location}
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
