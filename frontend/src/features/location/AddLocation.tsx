import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {faPlusSquare} from "@fortawesome/free-solid-svg-icons";
import introJs from "intro.js";

import NamedLocationField from "./NamedLocationField";
import BasePage from "../../common/components/BasePage";
import RegionLocationField, {
  DROPDOWN_DISTRICT_ID,
  DROPDOWN_STATE_ID,
  TEXT_POSTAL_CODE_ID
} from "./RegionLocationField/RegionLocationField";
import {FuelType, IntroJs, LocationType, OurFormElement, RegionType, RouteNames} from "../../common/types";
import {INTRO_OPTIONS, INVALID_LOCATION} from "../../common/constants";
import {useAddLocationMutation} from "./locationApiSlice";
import {BreadcrumbItem} from "../../common/components/Breadcrumb";
import {updateIntroStepElement, useAppSelector} from "../../common/utils";
import {selectIntroSettingsAddLocation} from "../../common/settings/settingsSlice";
import {useSetSettingMutation} from "../../common/apis/spritstatApi";
import {BTN_CURRENT_LOCATION_ID, TEXT_LOCATION_ID} from "./NamedLocationField/NamedLocationField";


const BREADCRUMB: BreadcrumbItem = {
  name: "Ort hinzufügen",
  icon: faPlusSquare,
  destination: RouteNames.AddLocation,
};

const INVALID_REGION: Region = {
  code: -1,
  type: RegionType.Invalid,
  name: ""
}

const DROPDOWN_LOCATION_TYPE_ID = "dropdown-location-type";
const DROPDOWN_FUEL_ID = "dropdown-fuel-type";
const BTN_ADD_LOCATION_ID = "btn-add-location"

interface Region {
  code: number;
  type: RegionType;
  name: string;
}

export default function AddLocation(): JSX.Element {
  const [addLocation, {isLoading}] = useAddLocationMutation();
  const buttonRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  // @ts-ignore this is a fluke caused somehow by intro.js-react typing
  const stepsRef = useRef() as React.MutableRefObject<IntroJs>;
  const [errorMessage, setErrorMessage] = useState("");
  const [locationType, setLocationType] = useState<LocationType>(LocationType.Named);
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.Diesel);
  const [namedLocation, setNamedLocation] = useState(INVALID_LOCATION);
  const [region, setRegion] = useState(INVALID_REGION);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const introActive = useAppSelector(selectIntroSettingsAddLocation);
  const [setSettings] = useSetSettingMutation();
  const [introDone, setIntroDone] = useState(false);

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

  useEffect(() => {
    if (introDone) {
      setIntroDone(false);

      setSettings({intro: {add_location_active: false}}).unwrap()
        .catch((e) => {
          console.error(`Failed to disable AddLocation intro: ${JSON.stringify(e, null, 2)}`);
        })
    }
  }, [introDone]);

  useEffect(() => {
    if (location && introActive) {
      introJs().setOptions({
        ...INTRO_OPTIONS,
        steps: [
          {
            intro: "Es gibt zwei unterschiedliche Ortstypen: konkrete Positionen und "
              + "Bezirke/Bundesländer. Ergebnisse für eine konkrete Position sind im "
              + "Allgemeinen exakter als Ergebnisse für Bezirken/Bundesländer."
          },
          {
            element: `#${DROPDOWN_LOCATION_TYPE_ID}`,
            intro: "Klicke hier um den Ortstyp auszuwählen. Standardmäßig ist die Suche "
              + "nach einem konkreten Ort aktiviert."
          },
          {
            element: `#${TEXT_LOCATION_ID}`,
            intro: "Tipp einfach einen Suchbegriff (Adresse, Ortsname, ...) ein und du "
              + "erhältst die gefundenen Vorschläge angezeigt."
          },
          {
            element: `#${BTN_CURRENT_LOCATION_ID}`,
            intro: "Klicke hier um für den aktuellen Standort Vorschläge anzuzeigen."
          },
          {
            element: `#${DROPDOWN_LOCATION_TYPE_ID}`,
            intro: "Wenn du \"Region\" auswählst, kannst du entweder einen Bezirk oder "
              + "ein Bundesland auswählen."
          },
          {
            element: `#${DROPDOWN_STATE_ID}`,
            intro: "Wähle hier das gewünschte Bundesland aus."
          },
          {
            element: `#${DROPDOWN_DISTRICT_ID}`,
            intro: "Optional kannst du auch den gewünschten Bezirk im Bundesland auswählen."
          },
          {
            element: `#${TEXT_POSTAL_CODE_ID}`,
            intro: "Alternativ kannst du auch die gewünschte Postleitzahl eingeben. In "
              + "diesem Fall wird automatisch der zugehörige Bezirk ausgewählt."
          },
          {
            element: `#${DROPDOWN_FUEL_ID}`,
            intro: "Zusätzlich zum Ort kann auch der Treibstofftyp ausgewählt werden "
              + "für den die Preise aufgezeichnet werden sollen. Es stehen Diesel, " +
              "Super und Gas zur Verfügung."
          },
          {
            element: `#${BTN_ADD_LOCATION_ID}`,
            intro: "Sobald ein gültiger Ort ausgewählt wurde kann dieser hinzugefügt werden."
          }
        ]
      }).onexit(
        () => {
          setLocationType(LocationType.Named);
          setIntroDone(true);
        }
      ).onbeforechange(
        updateIntroStepElement
      ).onchange(
        function(this: IntroJs, targetElement) {
          // Switch to region location type if we select the location type dropdown
          //  the second time. While this is still kind of hacky, it should be
          //  reasonably reliable.
          if (
            (this._currentStep >= 2)
            && targetElement
            && (targetElement.id === DROPDOWN_LOCATION_TYPE_ID)
          ) {
            setLocationType(LocationType.Region);
          }
        }
      ).start();
    }
  }, [introActive]);

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
                    id={DROPDOWN_LOCATION_TYPE_ID}
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
                    id={DROPDOWN_FUEL_ID}
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
              <p className="control" id={BTN_ADD_LOCATION_ID}>
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
  );
}

export {BREADCRUMB as ADD_LOCATION_BREADCRUMB};
