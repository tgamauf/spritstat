import React, {useEffect, useState} from "react";

import {RegionType, useGetRegionsQuery} from "./regionsApiSlice";

const POSTAL_CODE_LENGTH = 4;

interface Props {
  setRegion: (region: {code: number, type: RegionType, name: string}) => void;
  setErrorMessage: (msg: string) => void;
}

export default function RegionLocationField({
  setRegion,
  setErrorMessage,
}: Props): JSX.Element {
  const {data: regionMap, error, isLoading} = useGetRegionsQuery();
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    if (error) {
      console.error(`Failed to get region map: ${JSON.stringify(error, null, 2)}`);
      setErrorMessage(
        "Die Seite konnte nicht vollständig geladen werden, bitte lade sie " +
        "neu und versuche es nochmal."
      );
    }
  }, [error]);

  useEffect(() => {
    if (
      !regionMap ||
      postalCode === "" ||
      postalCode.length < POSTAL_CODE_LENGTH
    ) {
      return;
    }

    // Reset any error if the postal code has been changed.
    setErrorMessage("");

    const stateCode = regionMap.postalCodeToState.get(postalCode);
    const districtCode = regionMap.postalCodeToDistrict.get(postalCode);

    if (
      typeof stateCode !== "undefined" &&
      typeof districtCode !== "undefined"
    ) {
      setSelectedState(stateCode);
      setSelectedDistrict(districtCode);
    } else {
      setSelectedState(null);
      setSelectedDistrict(null);

      setErrorMessage(
        "Die Postleitzahl konnte nicht gefunden werden, bitte überprüfe diese nochmal."
      );
    }
  }, [postalCode, isLoading]);

  useEffect(() => {
    if (!regionMap) {
      return;
    }

    // We always use the more specific region, so if the district code exists
    //  we will use it as region. If not we will use the state.
    if (selectedState !== null && selectedDistrict !== null) {
      const state = regionMap.states.get(selectedState);
      if (typeof state !== "undefined") {
        const district = state.districts.get(selectedDistrict);
        if (typeof district !== "undefined") {
          setRegion({
            code: selectedDistrict,
            type: district.type,
            name: district.name
          });
        }
      }
    } else if (selectedState !== null) {
      const state = regionMap.states.get(selectedState);
      if (typeof state !== "undefined") {
        setRegion({
          code: selectedState,
          type: state.type,
          name: state.name
        });
      }
    }
  }, [isLoading, selectedState, selectedDistrict]);

  let states: { code: number; name: string }[] = [];
  let districts: { code: number; name: string }[] = [];
  if (regionMap) {
    states = Array.from(regionMap.states, ([code, state]) => ({
      code,
      name: state.name,
    }));

    if (selectedState !== null) {
      const state = regionMap.states.get(selectedState);
      if (typeof state !== "undefined") {
        districts = Array.from(state.districts, ([code, district]) => ({
          code,
          name: district.name,
        }));
      }
    }
  }

  const dropdownTitle =
    "Wähle ein Bundesland und optional einen Bezirk aus für den " +
    "Spritpreise gesucht werden sollen.";
  return (
    <div className="field" data-test="location-add-region">
      <div className="field is-horizontal">
        <div className="field-body">
          <div className="field ">
            <div className="control is-expanded">
              <div className="select is-fullwidth is-primary">
                <select
                  title={dropdownTitle}
                  required={true}
                  value={selectedState === null ? "" : selectedState}
                  onChange={(e) => setSelectedState(Number(e.target.value))}
                  data-test="field-state"
                >
                  <option value="" disabled={true}>
                    Bundesland
                  </option>
                  {states.map((entry, index) => {
                    return (
                      <option key={index} value={entry.code}>
                        {entry.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
          <div className="field">
            <div className="control is-expanded">
              <div className="select is-fullwidth is-primary">
                <select
                  title={dropdownTitle}
                  required={false}
                  disabled={selectedState === null}
                  value={selectedDistrict === null ? "" : selectedDistrict}
                  onChange={(e) => setSelectedDistrict(Number(e.target.value))}
                  data-test="field-district"
                >
                  <option value="" disabled={true}>
                    Bezirk
                  </option>
                  {districts.map((entry, index) => {
                    return (
                      <option key={index} value={entry.code}>
                        {entry.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="field ml-4">
        <span>oder</span>
      </div>
      <div className="control">
        <input
          className="input"
          title="Gib eine Postleitzahl ein um die zugehörige Region zu suchen."
          type="text"
          maxLength={4}
          placeholder="PLZ"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          data-test="field-postal-code"
        />
        <p className="help">
          Es wird der zur Postleitzahl gehörige Bezirk ausgewählt.
        </p>
      </div>
    </div>
  );
}

export type { Props as RegionLocationFieldProps };
