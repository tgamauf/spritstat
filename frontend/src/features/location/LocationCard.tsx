import React from "react";
import {Link} from "react-router-dom";

import CurrentPriceField from "../currentPrice/CurrentPriceField";
import LocationField from "./LocationField";
import LocationPriceLineChart from "./LocationPriceLineChart";
import {Location, RouteNames} from "../../common/types";

interface Props {
  location: Location;
  setErrorMessage: (msg: string) => void;
}

export default function LocationCard({location, setErrorMessage}: Props): JSX.Element {
  return (
    <div className="card is-focused mb-6" data-test={`card-location-${location.id}`}>
      <Link className="card-overlay" to={`${RouteNames.LocationDetails}/${location.id}`} />
      <header className="card-header has-background-primary-light">
        <div className="card-header-title">
          <div className="tile">
            <LocationField location={location} />
          </div>
          <div className="tile is-ancestor">
            <CurrentPriceField location={location} isInteractive={false} />
          </div>
        </div>
      </header>
      <div className="card-content">
        <LocationPriceLineChart
          location={location}
          isInteractive={false}
          setErrorMessage={setErrorMessage}
        />
      </div>
    </div>
  );
};