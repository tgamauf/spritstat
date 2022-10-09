import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {faPlusSquare} from "@fortawesome/free-solid-svg-icons";
import introJs from "intro.js";
import {defineMessage, useIntl} from "react-intl";

import BasePage from "../../common/components/BasePage";
import RegionLocationField, {
  DROPDOWN_DISTRICT_ID,
  DROPDOWN_STATE_ID,
  TEXT_POSTAL_CODE_ID
} from "./RegionLocationField";
import {FuelType, IntroJs, LocationType, OurFormElement, RegionType, RouteNames} from "../../common/types";
import {INVALID_LOCATION} from "../../common/constants";
import {useAddLocationMutation} from "./locationApiSlice";
import {BreadcrumbItem} from "../../common/components/Breadcrumb";
import {getFormattedIntroOption, updateIntroStepElement, useAppSelector} from "../../common/utils";
import {selectIntroSettingsAddLocation} from "../../common/settings/settingsSlice";
import {useSetSettingMutation} from "../../common/apis/spritstatApi";
import {BTN_CURRENT_LOCATION_ID, NamedLocationField, TEXT_LOCATION_ID} from "./NamedLocationField";
import {BTN_FUEL_TYPE_ID, FuelTypeButtonGroup} from "../../common/components/FuelTypeButtonGroup";


const BREADCRUMB: BreadcrumbItem = {
  name: defineMessage({
    description: "AddLocation breadcrumb",
    defaultMessage: "Ort hinzufügen"
  }),
  icon: faPlusSquare,
  destination: RouteNames.AddLocation,
};

const INVALID_REGION: Region = {
  code: -1,
  type: RegionType.Invalid,
  name: ""
}

const TAB_LOCATION_TYPE_NAMED_ID = "tab-location-type-named";
const TAB_LOCATION_TYPE_REGION_ID = "tab-location-type-region";
const BTN_ADD_LOCATION_ID = "btn-add-location"

interface Region {
  code: number;
  type: RegionType;
  name: string;
}

export default function AddLocation(): JSX.Element {
  const [addLocation, {isLoading}] = useAddLocationMutation();
  const namedTabRef = useRef() as React.MutableRefObject<HTMLLIElement>;
  const regionTabRef = useRef() as React.MutableRefObject<HTMLLIElement>;
  const buttonRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  // @ts-ignore this is a fluke caused somehow by intro.js-react typing
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
  const intl = useIntl();

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
      const error = intl.formatMessage({
        description: "AddLocation error",
        defaultMessage: "Der Ort konnte nicht angelegt werden."
      });
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
            setErrorMessage(error);
          }
        })
        .catch((e: any) => {
          console.error(`Failed to add location: ${JSON.stringify(e, null, 2)}`);
          setErrorMessage(error);
        });
    }
  }, [submitted]);

  useEffect(() => {
    if (namedTabRef.current && regionTabRef.current) {
      const token = "is-active";
      if (locationType == LocationType.Named) {
        namedTabRef.current.classList.add(token);
        regionTabRef.current.classList.remove(token);
      } else {
        namedTabRef.current.classList.remove(token);
        regionTabRef.current.classList.add(token);
      }
    }
  })

  useEffect(() => {
    if (buttonRef.current) {
      if (submitted || isLoading) {
        buttonRef.current.classList.add("is-loading");
      } else {
        buttonRef.current.classList.remove("is-loading");
      }
    }
  })

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
        ...getFormattedIntroOption(intl),
        steps: [
          {
            intro: intl.formatMessage({
              description: "AddLocation intro 1",
              defaultMessage: "Es gibt zwei unterschiedliche Ortstypen: konkrete " +
                "Positionen und Bezirke/Bundesländer. Ergebnisse für eine konkrete " +
                "Position sind im Allgemeinen exakter als Ergebnisse für " +
                "Bezirke/Bundesländer."
            })
          },
          {
            element: `#${TAB_LOCATION_TYPE_NAMED_ID}`,
            intro: intl.formatMessage({
              description: "AddLocation intro 2",
              defaultMessage: 'Standardmäßig ist der Ortstyp "Suche" nach einem konkreten Ort ' +
                'aktiviert.'
            })
          },
          {
            element: `#${TEXT_LOCATION_ID}`,
            intro: intl.formatMessage({
              description: "AddLocation intro 3",
              defaultMessage: "Tipp einfach einen Suchbegriff (Adresse, Ortsname, " +
                "...) ein und du erhältst die gefundenen Vorschläge angezeigt."
            })
          },
          {
            element: `#${BTN_CURRENT_LOCATION_ID}`,
            intro: intl.formatMessage({
              description: "AddLocation intro 4",
              defaultMessage: "Klicke hier um für den aktuellen Standort Vorschläge " +
                "anzuzeigen."
            })
          },
          {
            element: `#${TAB_LOCATION_TYPE_REGION_ID}`,
            intro: intl.formatMessage({
              description: "AddLocation intro 5",
              defaultMessage: 'Wenn du "Region" auswählst, kannst du entweder einen ' +
                'Bezirk oder ein Bundesland auswählen.'
            })
          },
          {
            element: `#${DROPDOWN_STATE_ID}`,
            intro: intl.formatMessage({
              description: "AddLocation intro 6",
              defaultMessage: "Wähle hier das gewünschte Bundesland aus."
            })
          },
          {
            element: `#${DROPDOWN_DISTRICT_ID}`,
            intro: intl.formatMessage({
              description: "AddLocation intro 7",
              defaultMessage: "Optional kannst du auch den gewünschten Bezirk im " +
                "Bundesland auswählen."
            })
          },
          {
            element: `#${TEXT_POSTAL_CODE_ID}`,
            intro: intl.formatMessage({
              description: "AddLocation intro 8",
              defaultMessage: "Alternativ kannst du auch die gewünschte Postleitzahl " +
                "eingeben. In diesem Fall wird automatisch der zugehörige Bezirk " +
                "ausgewählt."
            })
          },
          {
            element: `#${BTN_FUEL_TYPE_ID}`,
            intro: intl.formatMessage({
              description: "AddLocation intro 9",
              defaultMessage: "Zusätzlich zum Ort kann auch der Treibstofftyp " +
                "ausgewählt werden für den die Preise aufgezeichnet werden sollen. " +
                "Es stehen Diesel, Super und Gas zur Verfügung."
            })
          },
          {
            element: `#${BTN_ADD_LOCATION_ID}`,
            intro: intl.formatMessage({
              description: "AddLocation intro 10",
              defaultMessage: "Sobald ein gültiger Ort ausgewählt wurde kann dieser " +
                "hinzugefügt werden."
            })
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
          if (targetElement && (targetElement.id === TAB_LOCATION_TYPE_REGION_ID)) {
            setLocationType(LocationType.Region);
          }
        }
      ).start();
    }
  }, [introActive]);

  function changeLocationType(type: LocationType) {
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
        <h1 className="title">
          {intl.formatMessage({
            description: "AddLocation title",
            defaultMessage: "Neuen Ort hinzufügen"
          })}
        </h1>
        <form onSubmit={onSubmit}>
          <div className="tabs is-right is-boxed mb-0">
            <ul>
              <li
                ref={namedTabRef}
                id={TAB_LOCATION_TYPE_NAMED_ID}
                data-test="tab-location-type-named"
              >
                <a onClick={(e) => {
                    e.preventDefault();
                    changeLocationType(LocationType.Named);
                  }}>
                  {intl.formatMessage({
                    description: "AddLocation dropdown location type option 1",
                    defaultMessage: "Suche"
                  })}
                </a>
              </li>
              <li
                ref={regionTabRef}
                id={TAB_LOCATION_TYPE_REGION_ID}
                data-test="tab-location-type-region"
              >
                <a onClick={(e) => {
                    e.preventDefault();
                    changeLocationType(LocationType.Region);
                  }}>
                  {intl.formatMessage({
                    description: "AddLocation dropdown location type option 2",
                    defaultMessage: "Region"
                  })}
                </a>
              </li>
            </ul>
          </div>
          <div className="tabs-box">
            <div className="block">{mainComponent}</div>
            <div className="block">
              <div className="is-inline-block">
                <FuelTypeButtonGroup value={fuelType} setSelected={setFuelType} />
              </div>
            </div>
            <div className="block">
              <div className="field is-grouped is-grouped-right">
                <p className="control" id={BTN_ADD_LOCATION_ID}>
                  <input
                    className="button is-primary"
                    type="submit"
                    value={intl.formatMessage({
                      description: "AddLocation submit",
                      defaultMessage: "Hinzufügen"
                    })}
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
          </div>
        </form>
      </div>
    </BasePage>
  );
}

export {BREADCRUMB as ADD_LOCATION_BREADCRUMB};
