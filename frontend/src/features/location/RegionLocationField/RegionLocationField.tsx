import React, {useEffect, useState} from "react";
import {t} from "@lingui/macro";

import {RegionType} from "../../../common/types";
import {useGetRegionsQuery} from "./regionsApiSlice";

const POSTAL_CODE_LENGTH = 4;
const NO_POSTAL_CODE = "";
const DROPDOWN_STATE_ID = "state";
const DROPDOWN_DISTRICT_ID = "district";
const TEXT_POSTAL_CODE_ID = "postal-code"

interface Props {
  setRegion: (region: { code: number, type: RegionType, name: string }) => void;
  setErrorMessage: (msg: string) => void;
}

export default function RegionLocationField(
  {setRegion, setErrorMessage}: Props
): JSX.Element {
  const {data: regionMap, error, isLoading} = useGetRegionsQuery();
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [postalCode, setPostalCode] = useState(NO_POSTAL_CODE);

  useEffect(() => {
    if (error) {
      console.error(`Failed to get region map: ${JSON.stringify(error, null, 2)}`);
      setErrorMessage(
        t`Die Seite konnte nicht vollständig geladen werden, bitte lade sie neu und versuche es nochmal.`
      );
    }
  }, [error]);

  useEffect(() => {
    if (
      !regionMap ||
      (postalCode === NO_POSTAL_CODE) ||
      (postalCode.length < POSTAL_CODE_LENGTH)
    ) {
      return;
    }

    // Reset any error if the postal code has been changed.
    setErrorMessage("");

    const stateCode = regionMap.postalCodeToState.get(postalCode);
    const districtCode = regionMap.postalCodeToDistrict.get(postalCode);

    if ((typeof stateCode !== "undefined") && (typeof districtCode !== "undefined")) {
      setSelectedState(stateCode);
      setSelectedDistrict(districtCode);
    } else {
      setSelectedState(null);
      setSelectedDistrict(null);

      setErrorMessage(
        t`Die Postleitzahl konnte nicht gefunden werden, bitte überprüfe diese nochmal.`
      );
    }
  }, [postalCode, isLoading]);

  useEffect(() => {
    if (!regionMap) {
      return;
    }

    // We always use the more specific region, so if the district code exists
    //  we will use it as region. If not we will use the state.
    if ((selectedState !== null) && (selectedDistrict !== null)) {
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
    t`Wähle ein Bundesland und optional einen Bezirk aus für den Spritpreise 
    aufgezeichnet werden sollen.`;
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
                  onChange={(e) => {
                    setSelectedState(Number(e.target.value))
                    setSelectedDistrict(null);
                    setPostalCode(NO_POSTAL_CODE);
                  }}
                  data-test="field-state"
                  id={DROPDOWN_STATE_ID}
                >
                  <option value="" disabled={true}>
                    {t`Bundesland`}
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
                  onChange={(e) => {
                    setSelectedDistrict(Number(e.target.value));
                    setPostalCode(NO_POSTAL_CODE);
                  }}
                  data-test="field-district"
                  id={DROPDOWN_DISTRICT_ID}
                >
                  <option value="" disabled={true}>
                    {t`Bezirk`}
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
          title={t`Gib eine Postleitzahl ein um den zugehörigen Bezirk zu suchen.`}
          type="text"
          maxLength={4}
          placeholder={t`PLZ`}
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          data-test="field-postal-code"
          id={TEXT_POSTAL_CODE_ID}
        />
      </div>
    </div>
  );
};

export {DROPDOWN_STATE_ID, DROPDOWN_DISTRICT_ID, TEXT_POSTAL_CODE_ID};
