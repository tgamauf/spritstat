import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {faPlusSquare} from "@fortawesome/free-solid-svg-icons";

import {useGlobalState} from "../../App";
import NamedLocationField from "../../components/NamedLocationField";
import BasePage from "../../components/BasePage";
import RegionLocationField from "../../components/RegionLocationField";
import {apiCreateLocation} from "../../services/api";
import {RegionType} from "../../services/econtrolApi";
import {
  FuelType,
  FuelTypeLabels,
  LocationType,
  OurFormElement,
  NamedLocation,
  RouteNames
} from "../../utils/types";

const BREADCRUMB = {
  name: "Ort hinzufügen",
  icon: faPlusSquare,
  destination: RouteNames.AddLocation,
};

interface Region {
  code: number;
  type: RegionType;
  name: string;
}

export default function AddLocation(): JSX.Element {
  const [{ isAuthenticated, hasBetaAccess }] = useGlobalState();
  const [errorMessage, setErrorMessage] = useState("");
  const [locationType, setLocationType] = useState<LocationType>(LocationType.Named);
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.Diesel);
  const [namedLocation, setNamedLocation] = useState<NamedLocation>();
  const [region, setRegion] = useState<Region>();
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

      apiCreateLocation({
        type: locationType,
        name: locationType === LocationType.Named
          ? namedLocation?.name : region?.name,
        latitude: namedLocation?.coords.latitude,
        longitude: namedLocation?.coords.longitude,
        regionCode: region?.code,
        regionType: region?.type,
        fuelType,
      })
        .then((isSuccess) => {
          if (isSuccess) {
            navigate(RouteNames.Dashboard);
          } else {
            console.error(`Failed to add location: request status not ok`);
            setErrorMessage("Der Ort konnte nicht angelegt werden.");
          }
        })
        .catch((e: any) => {
          console.error(`Failed to to add location: ${e}`);
          setErrorMessage("Der Ort konnte nicht angelegt werden");
        });
    }
  }, [submitted]);

  function changeLocationType(event: React.ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();

    const type = Number(event.target.value);
    if (type !== locationType) {
      // Clean up previously chosen locations
      setNamedLocation(undefined);
      setRegion(undefined);
      setLocationType(type);
    }
  }

  function onSubmit(e: React.FormEvent<OurFormElement>) {
    e.preventDefault();

    setSubmitted(true);
    setErrorMessage("");
  }

  let mainComponent;
  if (locationType === LocationType.Named) {
    mainComponent = (
      <NamedLocationField
        setLocation={setNamedLocation}
        setErrorMessage={setErrorMessage}
        hasBetaAccess={hasBetaAccess}
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
                        {FuelTypeLabels.get(FuelType.Diesel)}
                      </option>
                      <option value={FuelType.Super}>
                        {FuelTypeLabels.get(FuelType.Super)}
                      </option>
                      <option value={FuelType.Gas}>
                        {FuelTypeLabels.get(FuelType.Gas)}
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
                    disabled={!namedLocation && !region}
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
