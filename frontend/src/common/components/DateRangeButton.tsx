import React, {useEffect, useRef} from "react";

interface DateRangeItem {
  name: string;
  value: any;
}

interface Props {
  items: DateRangeItem[];
  selectedValue: any;
  setSelectedValue: (value: any) => void;
}

export default function DateRangeButton(
  {items, selectedValue, setSelectedValue}: Props
): JSX.Element {
  const itemRefs: React.MutableRefObject<HTMLButtonElement>[] = [];
  for (const _ in items) {
    itemRefs.push(useRef() as React.MutableRefObject<HTMLButtonElement>)
  }

  useEffect(() => {
    if (itemRefs.some((e) => !e.current)) {
      return;
    }

    const tokens = ["is-selected", "is-primary"];
    for (let i = 0; i < items.length; i++) {
      if (items[i].value === selectedValue) {
        itemRefs[i].current.classList.add(...tokens);
      } else {
        itemRefs[i].current.classList.remove(...tokens)
      }
    }
  }, [selectedValue]);

  return (
    <div className="buttons has-addons">
      {items.map(({name, value}, index) => {
        return (
          <button
            className="button is-small is-selected"
            key={index}
            ref={itemRefs[index]}
            onClick={() => setSelectedValue(value)}
          >
            {name}
          </button>
        );
      })
      }
    </div>
  );
};
