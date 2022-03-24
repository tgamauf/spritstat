import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import Cookie from "universal-cookie";

import {RootState} from "../../app/store";
import {Locale} from "./types";
import {localeApi} from "./i18nApiSlice";


const defaultLocale = Locale.DE;

interface I18nState {
  locale: Locale
}

const setLocale = createAsyncThunk<Locale, Locale>(
  "i18n/setLocale",
  async (locale, {dispatch}) => {
    dispatch(localeApi.endpoints.setLocale.initiate(locale));
    return locale;
  }
)

function initialState(): I18nState {
  // Check if we have a language cookie set and if this is the case use that.
  const cookie = new Cookie();
  let locale = cookie.get("locale")

  if (locale) {
    return {locale};
  }

  if (/^de\b/.test(navigator.language)) {
    locale = Locale.DE
  } else if (/^en\b/.test(navigator.language)) {
    locale = Locale.EN;
  } else {
    locale = defaultLocale;
  }

  return {locale};
}

const i18n = createSlice({
  name: "i18n",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      setLocale.fulfilled,
      (state, action) => {
        state.locale = action.payload;
      })
  }
});

const selectLocale = (state: RootState): Locale => state.i18n.locale;

export {i18n, selectLocale, setLocale};
