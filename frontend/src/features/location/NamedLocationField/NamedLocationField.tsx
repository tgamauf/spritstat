import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMapMarkerAlt, faSearch} from "@fortawesome/free-solid-svg-icons";
import {useIntl} from "react-intl";

import {Prediction, GoogleMapsAPI, loadGoogleMapsAPI, INVALID_PREDICTION} from "./google";
import {INVALID_COORDINATES, INVALID_LOCATION} from "../../../common/constants";
import {NamedLocation} from "../../../common/types";

const MAX_LOCATION_NAME_LENGTH = 200;  // mirrors the length of the model field
const LOCATION_REQUEST_TIMEOUT_MS = 5000;
const INVALID_SEARCH_TEXT = "";
const NO_PREDICTIONS: Prediction[] = [];
const TEXT_LOCATION_ID = "location-text";
const BTN_CURRENT_LOCATION_ID = "current-location";

interface Props {
  setLocation: (location: NamedLocation) => void;
  setErrorMessage: (msg: string) => void;
}

export function NamedLocationField({
  setLocation,
  setErrorMessage,
}: Props): JSX.Element {
  const dropdownRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const buttonRef = useRef() as React.MutableRefObject<HTMLAnchorElement>
  const [googleMapsAPI, setGoogleMapsAPI] = useState<GoogleMapsAPI | null>(null);
  const [searchText, setSearchText] = useState(INVALID_SEARCH_TEXT);
  const [searchCoordinates, setSearchCoordinates] = useState(INVALID_COORDINATES);
  const [predictions, setPredictions] = useState(NO_PREDICTIONS);
  const [selectedPrediction, setSelectedPrediction] = useState(INVALID_PREDICTION);
  const [displayText, setDisplayText] = useState("");
  const intl = useIntl();

  const escapePressed = useCallback((event) => {
    if(event.key === "Escape") {
      // Clear predictions if the escape key is pressed
      setPredictions(NO_PREDICTIONS);
   }
 }, []);

  useEffect(() => {
    if (!googleMapsAPI) {
      loadGoogleMapsAPI().then((api) => setGoogleMapsAPI(api));
   }
 }, [])

  useEffect(() => {
    document.addEventListener("keydown", escapePressed, false);

    return () => {
      document.removeEventListener("keydown", escapePressed, false);
   };
 }, []);

  useEffect(() => {
    if (searchText === INVALID_SEARCH_TEXT) {
      return;
   }

    googleMapsAPI?.getPredictionsFromText(searchText)
      .then((predictions) => {
        setPredictions(predictions);
     });
 }, [searchText]);

  useEffect(() => {
    if (searchCoordinates === INVALID_COORDINATES) {
      return;
   }

    googleMapsAPI?.getPredictionsFromCoordinates(searchCoordinates)
      .then((predictions) => {
        setPredictions(predictions);
     });
 }, [searchCoordinates]);

  useEffect(() => {
    if (selectedPrediction === INVALID_PREDICTION) {
      return;
   }

    googleMapsAPI?.selectPrediction(selectedPrediction)
      .then((location) => {
        if (location === INVALID_LOCATION) {
          setErrorMessage(intl.formatMessage({
              description: "NamedLocationField error 1",
              defaultMessage: "Der Ort konnte nicht gefunden werden."
            })
          );
          return;
       }

        setLocation(location);
     });
 }, [selectedPrediction]);

  useLayoutEffect(() => {
    // One of the location sources has changed, so let's delete the previous
    //  location.
    setLocation(INVALID_LOCATION);

    if (searchCoordinates !== INVALID_COORDINATES) {
      setDisplayText(
        `${searchCoordinates.latitude}, ${searchCoordinates.longitude}`
      );
      return;
   } else if (selectedPrediction !== INVALID_PREDICTION) {
      setDisplayText(selectedPrediction.description);
      return;
   } else {
      // If none of the others is valid we set the search text.
      setDisplayText(searchText);
   }
 }, [searchText, searchCoordinates, selectedPrediction]);

  function changeSearchText(event: React.FormEvent<HTMLInputElement>) {
    event.preventDefault();

    const target = event.target as HTMLInputElement;
    setSearchText(target.value);

    setSearchCoordinates(INVALID_COORDINATES);
    setSelectedPrediction(INVALID_PREDICTION);
    setPredictions(NO_PREDICTIONS);
 }

  function changeSelectedPrediction(prediction: Prediction) {
    setSelectedPrediction(prediction);

    setSearchText(INVALID_SEARCH_TEXT);
    setSearchCoordinates(INVALID_COORDINATES);
    setPredictions(NO_PREDICTIONS);
 }

  function setPosition(position: GeolocationPosition) {
    setSearchCoordinates(position.coords);

    setSearchText(INVALID_SEARCH_TEXT);
    setSelectedPrediction(INVALID_PREDICTION);
    setPredictions(NO_PREDICTIONS);
 }

  function setPositionError(error: GeolocationPositionError) {
    console.error(`Failed to get position: ${error.message}`);
    if (error.code === GeolocationPositionError.PERMISSION_DENIED) {
      setErrorMessage(intl.formatMessage({
        description: "NamedLocationField error 2",
        defaultMessage: "Du hast leider nicht die erforderlichen Berechtigungen " +
          "um diesen Ort abzurufen."
      }));
   } else {
      setErrorMessage(intl.formatMessage({
        description: "NamedLocationField error 3",
        defaultMessage: "Der Ort ist aktuell nicht verfügbar."
      }));
   }
 }

  function requestLocation() {
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
    if (predictions.length > 0) {
      dropdownRef.current.classList.add("is-active");
   } else {
      dropdownRef.current.classList.remove("is-active");
   }
 }

  if (buttonRef.current) {
    if (navigator.geolocation) {
      buttonRef.current.classList.remove("is-static");
   } else {
      buttonRef.current.classList.add("is-static");
   }
 }

  return (
    <div
      className="field is-horizontal has-addons"
      data-test="location-add-address"
    >
      <div className="dropdown" ref={dropdownRef}>
        <div className="dropdown-trigger">
          <div className="field">
            <p className="control has-icons-right">
              <input
                className="input"
                title={intl.formatMessage({
                  description: "NamedLocationField title location",
                  defaultMessage: "Gib den Ort ein, für den Spritpreise aufgezeichnet " +
                    "werden sollen."
                })}
                type="text"
                placeholder={intl.formatMessage({
                  description: "NamedLocationField placeholder location",
                  defaultMessage: "Ort"
                })}
                maxLength={MAX_LOCATION_NAME_LENGTH}
                value={displayText}
                onChange={(e) => changeSearchText(e)}
                data-test="field-search"
                id={TEXT_LOCATION_ID}
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
                    onClick={() => changeSelectedPrediction(item)}
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
      <div className="control">
        <a
          className="button is-ghost"
          title={intl.formatMessage({
            description: "NamedLocationField title button current location",
            defaultMessage: "Übernimm deinen aktuellen Ort."
          })}
          ref={buttonRef}
          onClick={() => requestLocation()}
          data-test="btn-location"
          id={BTN_CURRENT_LOCATION_ID}
        >
          <FontAwesomeIcon
            className="icon has-text-primary"
            icon={faMapMarkerAlt}
          />
        </a>
      </div>
    </div>
  );
}

export {TEXT_LOCATION_ID, BTN_CURRENT_LOCATION_ID};
