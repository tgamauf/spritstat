import React, {useEffect, useRef, useState} from "react";

interface DateRangeItem {
  name: string;
  value: any;
}

interface Props {
  items: DateRangeItem[];
  setSelectedValue: (value: any) => void;
}

export default function DateRangeButton(
  {items, setSelectedValue}: Props
): JSX.Element {
  const [selected, setSelected] = useState(0);
  const itemRefs: React.MutableRefObject<HTMLButtonElement>[] = [];
  for (const _ in items) {
      itemRefs.push(useRef() as React.MutableRefObject<HTMLButtonElement>)
 }

  useEffect(() => {
    if (itemRefs.some((e) => !e.current)) {
      return;
   }

    const tokens = ["is-selected", "is-primary"];
    itemRefs[selected].current.classList.add(...tokens);
    for (let i = 0 ; i < itemRefs.length ; i++) {
      if (i === selected) {
        continue;
     }
      itemRefs[i].current.classList.remove(...tokens)
   }
 }, [selected]);

  return (
    <div className="buttons has-addons">
      {items.map(({name, value}, index) =>{
          return (
            <button
              className="button is-small is-selected"
              key={index}
              ref={itemRefs[index]}
              onClick={() => {
                setSelected(index);
                setSelectedValue(value);
             }}
            >
              {name}
            </button>
          );
       })
     }
    </div>
  );
};
