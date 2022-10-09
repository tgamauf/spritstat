import React from "react";
import FuelTypeButton from "./FuelTypeButton";
import {FuelType} from "../../types";

const BTN_FUEL_TYPE_ID = "btn-fuel-type";

interface Props {
  value: FuelType;
  setSelected: (value: FuelType) => void;
}

export default function FuelTypeButtonGroup({value, setSelected}: Props): JSX.Element {
  return (
    <div className="field has-addons" id={BTN_FUEL_TYPE_ID}>
      <FuelTypeButton
        value={FuelType.Super}
        selected={value === FuelType.Super}
        onClick={setSelected}
      />
      <FuelTypeButton
        value={FuelType.Diesel}
        selected={value === FuelType.Diesel}
        onClick={setSelected}
      />
      <FuelTypeButton
        value={FuelType.Gas}
        selected={value === FuelType.Gas}
        onClick={setSelected} />
    </div>
  );
}

export {BTN_FUEL_TYPE_ID};
