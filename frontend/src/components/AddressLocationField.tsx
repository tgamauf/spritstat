import React, { useCallback, useEffect, useState } from "react";
import _debuounce from "lodash.debounce";

import { geoAPIGetCoordinatesForAddress } from "../services/geocodeApi";

const DEBOUNCE_TIMEOUT_MS = 500;

interface Props {
  setAddress: (address: {
    address: string,
    postalCode: string,
    city: string,
    latitude: number,
    longitude: number
  }) => void;
  setErrorMessage: (msg: string) => void;
}

export default function AddressLocationField({
  setAddress: setAddressOuter,
  setErrorMessage,
}: Props): JSX.Element {
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    // Reset any error if the address has been changed.
    setErrorMessage("");

    if (address.length > 0 && postalCode.length > 0 && city.length > 0) {
      getCoordinatesDebounced(address, postalCode, city);
    }
  }, [address, postalCode, city]);

  function getCoordinates(address: string, postalCode: string, city: string) {
    geoAPIGetCoordinatesForAddress(address, postalCode, city)
      .then((coordinates) => {
        if (coordinates !== null) {
          setAddressOuter({
            address,
            postalCode,
            city,
            ...coordinates
          });
        } else {
          console.error(
            `Failed to get coordinates for address: request status not ok`
          );
          setErrorMessage(
            "Die Adresse konnte nicht verifiziert werden, bitte überprüfe " +
              "diese nochmal."
          );
        }
      })
      .catch((e: any) => {
        console.error(`Failed to get coordinates for address: ${e}`);
        setErrorMessage(
          "Die Adresse konnte nicht verifiziert werden, bitte laden die " +
            "Seite neu und probiere es nochmal."
        );
      });
  }

  const getCoordinatesDebounced = useCallback(
    _debuounce(getCoordinates, DEBOUNCE_TIMEOUT_MS),
    []
  );

  const fieldTitle =
    "Gib die Adresse des Ortes ein, für den Spritpreise aufgezeichnet werden " +
    "sollen.";
  return (
    <div className="field" data-test="location-add-address">
      <div className="field">
        <p className="control">
          <input
            className="input"
            title={fieldTitle}
            type="text"
            placeholder="Adresse"
            value={address}
            required={true}
            onChange={(e) => setAddress(e.target.value)}
            data-test="field-address"
          />
        </p>
      </div>
      <div className="field is-horizontal">
        <div className="field-body">
          <div className="field">
            <p className="control">
              <input
                className="input"
                title={fieldTitle}
                type="text"
                maxLength={4}
                placeholder="PLZ"
                value={postalCode}
                required={true}
                onChange={(e) => setPostalCode(e.target.value)}
            data-test="field-postal-code"
              />
            </p>
          </div>
          <div className="field">
            <p className="control is-expanded">
              <input
                className="input"
                title={fieldTitle}
                type="text"
                placeholder="Stadt"
                value={city}
                required={true}
                onChange={(e) => setCity(e.target.value)}
                data-test="field-city"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { Props as AddressLocationFieldProps };
