import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGasPump} from "@fortawesome/free-solid-svg-icons";
import {MessageDescriptor, useIntl} from "react-intl";

import {fuelTypeNames, Location, LocationType} from "../../common/types";


const LOCATION_FIELD_ID = "location-field";

interface Props {
  location: Location;
}

export default function LocationField({location}: Props): JSX.Element {
  const intl = useIntl();

  return (
    <div id={LOCATION_FIELD_ID}>
      <div>
        <p className="card-key mb-0">
          {location.type === LocationType.Named ? (
            intl.formatMessage({
              description: "LocationField type named",
              defaultMessage: "Name"
            })
          ) : (
            intl.formatMessage({
              description: "LocationField type region",
              defaultMessage: "Region"
            })
          )}
        </p>
        <p className="card-value">{location.name}</p>
      </div>
      <div>
        <FontAwesomeIcon className="card-key" icon={faGasPump} />
        <span className="card-value ml-2">
          {intl.formatMessage(fuelTypeNames.get(location.fuelType) as MessageDescriptor)}
        </span>
      </div>
    </div>
  );
};

export {LOCATION_FIELD_ID};
