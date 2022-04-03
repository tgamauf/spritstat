import React, {MutableRefObject, useEffect, useRef} from "react";

import {FuelType, fuelTypeNames} from "../../common/types";
import {MessageDescriptor, useIntl} from "react-intl";

interface Props {
  value: FuelType;
  selected: boolean;
  onClick: (value: FuelType) => void;
}

export default function FuelTypeButton({value, selected, onClick}: Props): JSX.Element {
  const ref = useRef() as MutableRefObject<HTMLButtonElement>;
  const intl = useIntl();

  function buttonOnClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    onClick(value);
  }

  useEffect(() => {
    if (ref.current) {
      if (selected) {
        ref.current.classList.add("is-selected", "is-primary");
      } else {
        ref.current.classList.remove("is-selected", "is-primary");
      }
    }
  })

  return (
    <p className="control">
      <button
        className="button"
        ref={ref}
        onClick={(e) => buttonOnClick(e)}
        data-test={`btn-fuel-${value}`}
      >
        {intl.formatMessage(fuelTypeNames.get(value) as MessageDescriptor)}
      </button>
    </p>
  )
}
