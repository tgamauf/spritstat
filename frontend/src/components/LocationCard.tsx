import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import CurrentPriceField from "./CurrentPriceField";
import LocationField from "./LocationField";
import LocationPriceLineChart from "./LocationPriceLineChart";
import { Location } from "../utils/types";

interface Props {
  location: Location;
  setLocationToDelete: (id: number) => void;
  setErrorMessage: (msg: string) => void;
}

export default function LocationCard({
  location,
  setLocationToDelete,
  setErrorMessage,
}: Props): JSX.Element {
  return (
    <div className="card mb-6" data-test={`card-location-${location.id}`}>
      <header className="card-header has-background-primary-light">
        <div className="card-header-title">
          <div className="tile">
            <LocationField location={location} />
          </div>
          <div className="tile is-ancestor">
            <CurrentPriceField location={location} />
          </div>
        </div>
        <button
          className="card-header-icon
                is-align-items-start
                has-text-primary"
          onClick={() => setLocationToDelete(location.id)}
          data-test="btn-open-delete"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </header>
      <div className="card-content">
        <LocationPriceLineChart
          id={String(location.id)}
          location={location}
          setErrorMessage={setErrorMessage}
        />
      </div>
    </div>
  );
}

export type { Props as LocationCardProps };
