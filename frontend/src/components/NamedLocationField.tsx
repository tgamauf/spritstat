import React, {useEffect, useRef, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faSearch } from "@fortawesome/free-solid-svg-icons";

import {
  Prediction,
  GoogleMapsAPI,
  INVALID_LOCATION,
  loadGoogleMapsAPI
} from "../services/google";
import {Coordinates, NamedLocation} from "../utils/types";

const MAX_LOCATION_NAME_LENGTH = 200;  // mirrors the length of the model field
const LOCATION_REQUEST_TIMEOUT_MS = 5000;

interface Props {
  setLocation: (location: NamedLocation) => void;
  setErrorMessage: (msg: string) => void;
  hasBetaAccess: boolean
}

export default function NamedLocationField({
  setLocation,
  setErrorMessage,
  hasBetaAccess
}: Props): JSX.Element {
  const dropdownRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const [googleMapsAPI, setGoogleMapsAPI] = useState<GoogleMapsAPI | null>(null);
  const [searchText, setSearchText] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [searchCoordinates, setSearchCoordinates] = useState<Coordinates>();
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction>();

  useEffect(() => {
    if (!googleMapsAPI) {
      loadGoogleMapsAPI().then((api) => setGoogleMapsAPI(api));
    }
  }, [])

  useEffect(() => {
    // Clean up predictions if the user deleted the text
    if (searchText.length === 0) {
      setPredictions([]);

      return;
    }

    // We won't search for a location if the user selected a prediction
    if (selectedPrediction) {
      return;
    }

    googleMapsAPI?.getPredictionsFromText(searchText)
      .then((predictions) => {
        setPredictions(predictions);
      });
  }, [searchText]);

  useEffect(() => {
    if (selectedPrediction) {
      googleMapsAPI?.selectPrediction(selectedPrediction)
        .then((location) => {
          if (location === INVALID_LOCATION) {
            setErrorMessage("Der Ort konnte nicht gefunden werden.");
            return;
          }

          // Set the description of the selected prediction as search text, to
          //  maintain consistency.
          setSearchText(selectedPrediction.description);
          setLocation(location);
        });
    }
  }, [selectedPrediction]);

  useEffect(() => {
    if (searchCoordinates) {
      googleMapsAPI?.getPredictionsFromCoordinates(searchCoordinates)
        .then((predictions) => {
          setPredictions(predictions);
        });
    }
  }, [searchCoordinates]);

  function changeSearchText(event: React.FormEvent<HTMLInputElement>) {
    event.preventDefault();

    const target = event.target as HTMLInputElement;

    // If the user manually changed anything in the search text we remove the
    //  selected prediction again as the user obviously wasn't satisfied with it.
    setSelectedPrediction(undefined);
    setSearchText(target.value);
  }

  function setPosition(position: GeolocationPosition) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    setSearchText(`${latitude}, ${longitude}`);
    setSearchCoordinates({latitude, longitude});
  }

  function setPositionError(error: GeolocationPositionError) {
    console.error(`Failed to get position: ${error.message}`);
    if (error.code === GeolocationPositionError.PERMISSION_DENIED) {
      setErrorMessage("Die Seite hat nicht das Erlaubnis den Ort abzurufen.");
    } else {
      setErrorMessage("Der Ort ist aktuell nicht verfügbar.");
    }
  }

  function requestLocation(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();

    navigator.geolocation.getCurrentPosition(
      setPosition,
      setPositionError,
      {
        enableHighAccuracy: true,
        timeout: LOCATION_REQUEST_TIMEOUT_MS,
      }
    );
  }

  if (dropdownRef.current) {
    if ((predictions.length > 0) && !selectedPrediction) {
      dropdownRef.current.classList.add("is-active");
    } else {
      dropdownRef.current.classList.remove("is-active");
    }
  }

  const fieldTitle =
    "Gib den Ort ein, für den Spritpreise aufgezeichnet werden sollen.";
  return (
    <div className="field is-horizontal" data-test="location-add-address">
      {searchCoordinates && (
        <div className={`notification is-success`}>
          Current location: {searchCoordinates.latitude}/{searchCoordinates.longitude}
        </div>
      )}
      {hasBetaAccess && (
        <div className="field">
          <button
            className="button is-ghost"
            disabled={!navigator.geolocation}
            onClick={(e) => requestLocation(e)}
          >
            <FontAwesomeIcon
              className="icon has-text-primary"
              icon={faMapMarkerAlt}
            />
          </button>
        </div>
      )}
      <div className="dropdown" ref={dropdownRef}>
        <div className="dropdown-trigger">
          <div className="field">
            <p className="control has-icons-right">
              <input
                className="input"
                title={fieldTitle}
                type="text"
                placeholder="Ort"
                maxLength={MAX_LOCATION_NAME_LENGTH}
                value={searchText}
                required={true}
                onInput={(e) => changeSearchText(e)}
                data-test="field-search"
              />
              <span className="icon is-small is-right">
                <FontAwesomeIcon icon={faSearch} />
              </span>
            </p>
          </div>
        </div>
        <div className="dropdown-menu">
          <div className="dropdown-content">
            {
              predictions.map((item, index) => {
                return (
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={() => setSelectedPrediction(item)}
                    key={index}
                    data-test={`field-search-dropdown-${index}`}
                  >
                    {item.description}
                  </a>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export type { Props as NamedLocationFieldProps };
