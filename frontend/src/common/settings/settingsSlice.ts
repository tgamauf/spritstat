import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {RootState} from "../../app/store";


interface IntroSettingsState {
  add_location_active: boolean;
  location_details_active: boolean;
  location_list_active: boolean;
  no_location_active: boolean;
}

interface SettingsState {
  intro: IntroSettingsState;
}

const INITIAL_INTRO_SETTINGS: IntroSettingsState = {
  add_location_active: false,
  location_details_active: false,
  location_list_active: false,
  no_location_active: false
};
const INITIAL_SETTINGS: SettingsState = {
  intro: {...INITIAL_INTRO_SETTINGS}
}

const initialState: SettingsState = {...INITIAL_SETTINGS};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<SettingsState>) => {
      const {
        add_location_active,
        location_details_active,
        location_list_active,
        no_location_active
      } = action.payload.intro;
      Object.assign(
        state,
        {
          intro: {
            add_location_active,
            location_details_active,
            location_list_active,
            no_location_active
          }
        }
      );
    },
  }
});

const {setSettings} = settingsSlice.actions;
const selectIntroSettingsAddLocation = (state: RootState) => state.settings.intro.add_location_active;
const selectIntroSettingsLocationDetails = (state: RootState) => state.settings.intro.location_details_active;
const selectIntroSettingsLocationList = (state: RootState) => state.settings.intro.location_list_active;
const selectIntroSettingsNoLocation = (state: RootState) => state.settings.intro.no_location_active;
const selectIntroActive = (state: RootState) => Object.values(state.settings.intro).every(v => v === true);

export {
  INITIAL_SETTINGS,
  selectIntroActive,
  selectIntroSettingsAddLocation,
  selectIntroSettingsLocationDetails,
  selectIntroSettingsLocationList,
  selectIntroSettingsNoLocation,
  setSettings,
  settingsSlice,
};
