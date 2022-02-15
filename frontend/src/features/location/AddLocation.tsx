import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {faPlusSquare} from "@fortawesome/free-solid-svg-icons";

import NamedLocationField from "./NamedLocationField";
import BasePage from "../../common/components/BasePage";
import RegionLocationField from "./RegionLocationField/RegionLocationField";
import {RegionType} from "../../common/types";
import {FuelType, LocationType, OurFormElement, RouteNames} from "../../common/types";
import {INVALID_LOCATION} from "../../common/constants";
import {useAppSelector} from "../../common/utils";
import {selectIsAuthenticated} from "../../common/sessionSlice";
import {useAddLocationMutation} from "./locationApiSlice";

const BREADCRUMB = {
  name: "Ort hinzufügen",
  icon: faPlusSquare,
  destination: RouteNames.AddLocation,
};

const INVALID_REGION: Region = {
  code: -1,
  type: RegionType.Invalid,
  name: ""
}

interface Region {
  code: number;
  type: RegionType;
  name: string;
}

export default function AddLocation(): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [addLocation, {isLoading}] = useAddLocationMutation();
  const buttonRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [errorMessage, setErrorMessage] = useState("");
  const [locationType, setLocationType] = useState<LocationType>(LocationType.Named);
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.Diesel);
  const [namedLocation, setNamedLocation] = useState(INVALID_LOCATION);
  const [region, setRegion] = useState(INVALID_REGION);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(RouteNames.Login);
    }
  });

  useEffect(() => {
    if (submitted) {
      setSubmitted(false);

      let name;
      let latitude;
      let longitude;
      let regionCode;
      let regionType;
      if (locationType === LocationType.Named) {
        name = namedLocation.name;
        latitude = namedLocation.coords.latitude;
        longitude = namedLocation.coords.longitude;
      } else {
        name = region.name;
        regionCode = region.code;
        regionType = region.type
      }
      addLocation({
        type: locationType,
        name,
        latitude,
        longitude,
        regionCode,
        regionType,
        fuelType,
      }).unwrap()
        .then((isSuccess) => {
          if (isSuccess) {
            navigate(RouteNames.Dashboard);
          } else {
            console.error(`Failed to add location: request status not ok`);
            setErrorMessage("Der Ort konnte nicht angelegt werden.");
          }
        })
        .catch((e: any) => {
          console.error(`Failed to add location: ${JSON.stringify(e, null, 2)}`);
          setErrorMessage("Der Ort konnte nicht angelegt werden");
        });
    }
  }, [submitted]);

  function changeLocationType(event: React.ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();

    const type = Number(event.target.value);
    if (type !== locationType) {
      // Clean up previously chosen locations
      setNamedLocation(INVALID_LOCATION);
      setRegion(INVALID_REGION);
      setLocationType(type);
    }
  }

  function onSubmit(e: React.FormEvent<OurFormElement>) {
    e.preventDefault();

    setSubmitted(true);
    setErrorMessage("");
  }

  if (buttonRef.current) {
    if (submitted || isLoading) {
      buttonRef.current.classList.add("is-loading");
    } else {
      buttonRef.current.classList.remove("is-loading");
    }
  }

  let mainComponent;
  if (locationType === LocationType.Named) {
    mainComponent = (
      <NamedLocationField
        setLocation={setNamedLocation}
        setErrorMessage={setErrorMessage}
      />
    );
  } else {
    mainComponent = (
      <RegionLocationField
        setRegion={setRegion}
        setErrorMessage={setErrorMessage}
      />
    );
  }

  return (
    <div>
      <BasePage
        breadcrumbItems={[BREADCRUMB]}
        active={errorMessage !== ""}
        message={errorMessage}
        discardMessage={() => setErrorMessage("")}
      >
        <div className="box">
          <h1 className="title">Neuen Ort hinzufügen</h1>
          <form onSubmit={onSubmit}>
            <div className="block">
              <div className="field is-grouped is-grouped-right">
                <div className="control">
                  <p className="select is-primary">
                    <select
                      title="Wähle den Typ von Ortsangabe aus."
                      value={locationType}
                      onChange={(e) => changeLocationType(e)}
                      data-test="field-location-type"
                    >
                      <option value={LocationType.Named}>Suche</option>
                      <option value={LocationType.Region}>Region</option>
                    </select>
                  </p>
                </div>
              </div>
            </div>
            <div className="block">{mainComponent}</div>
            <div className="block">
              <div className="field">
                <div className="control">
                  <div className="select is-primary">
                    <select
                      title="Wähle den Typ von Treibstoff aus für den Preise
                      aufgezeichnet werden sollen."
                      value={fuelType}
                      onChange={(e) => setFuelType(
                        e.target.value as FuelType
                      )}
                      data-test="field-fuel-type"
                    >
                      <option value={FuelType.Diesel}>
                        {FuelType.Diesel}
                      </option>
                      <option value={FuelType.Super}>
                        {FuelType.Super}
                      </option>
                      <option value={FuelType.Gas}>
                        {FuelType.Gas}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="block">
              <div className="field is-grouped is-grouped-right">
                <p className="control">
                  <input
                    className="button is-primary"
                    type="submit"
                    value="Hinzufügen"
                    disabled={
                      (namedLocation === INVALID_LOCATION)
                      && (region === INVALID_REGION)
                    }
                    ref={buttonRef}
                    data-test="btn-submit"
                  />
                </p>
              </div>
            </div>
          </form>
        </div>
      </BasePage>
    </div>
  );
}

export { BREADCRUMB as ADD_OCATION_BREADCRUMB };
