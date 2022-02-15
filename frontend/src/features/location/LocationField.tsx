import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGasPump} from "@fortawesome/free-solid-svg-icons";

import {Location, LocationType} from "../../common/types";

interface Props {
  location: Location;
}

export default function LocationField({location}: Props): JSX.Element {
  return (
    <div>
      <div>
        <p className="card-key mb-0">{
          location.type === LocationType.Named ? "Name" : "Region"
        }</p>
        <p className="card-value">{location.name}</p>
      </div>
      <div className="mt-3">
        <FontAwesomeIcon className="card-key" icon={faGasPump} />
        <span className="card-value ml-2">
          {location.fuelType}
        </span>
      </div>
    </div>
  );
}

export type { Props as LocationFieldProps };
