import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGasPump } from "@fortawesome/free-solid-svg-icons";

import { FuelTypeLabels, Location, LocationType } from "../utils/types";

interface Props {
  location: Location;
}

export default function LocationField({ location }: Props): JSX.Element {
  let name;
  let locationElement;
  if (location.type === LocationType.Address) {
    const { address, postal_code, city } = location;
    name = "Adresse";
    locationElement = (
      <div>
        <p>{address}</p>
        <p>
          {postal_code} {city}
        </p>
      </div>
    );
  } else {
    name = "Region";
    locationElement = (
      <div>
        <p>{location.region_name}</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <p className="card-key mb-0">{name}</p>
        <div className="card-value">{locationElement}</div>
      </div>
      <div className="mt-3">
        <FontAwesomeIcon className="card-key" icon={faGasPump} />
        <span className="card-value ml-2">
          {FuelTypeLabels.get(location.fuel_type)}
        </span>
      </div>
    </div>
  );
}

export type { Props as LocationFieldProps };
