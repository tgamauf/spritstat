import React, {useEffect, useState} from "react";

import {useAppSelector} from "../utils";
import {SettingsData, useSetSettingMutation} from "../apis/spritstatApi";
import {RootState} from "../../app/store";


interface Props {
  id: string;
  label: string;
  selectorFn: (state: RootState) => boolean;
  settingsFn: (active: boolean) => RecursivePartial<SettingsData>;
}

export default function SettingsSwitch(
  {id, label, selectorFn, settingsFn}: Props
): JSX.Element {
  const [setSettings] = useSetSettingMutation();
  const active = useAppSelector(selectorFn);
  const [doToggle, setDoToggle] = useState(false);

  useEffect(() => {
    if (doToggle) {
      setDoToggle(false);

      setSettings(settingsFn(!active)).unwrap()
        .catch((e) => {
          console.log(`${id} failed to toggle setting: ${JSON.stringify(e, null, 2)}`);
        });
    }
  }, [doToggle])

  return (
    <div className="field">
      <input
        id={id}
        className="switch is-rounded"
        type="checkbox"
        checked={active}
        onChange={() => setDoToggle(!doToggle)}
        data-test={`settings-switch-checkbox-${id}`}
      />
      <label
        htmlFor={id}
        className="is-unselectable"
        data-test={`settings-switch-${id}`}
      >
        {label}
      </label>
    </div>
  );
}
