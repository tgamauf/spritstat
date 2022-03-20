import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {RootState} from "../app/store";


enum Locale {
  DE = "de",
  EN = "en"
}

const localeNames = new Map<Locale, string>([
  [Locale.DE, "Deutsch"], [Locale.EN, "English"]
]);

const defaultLocale = Locale.DE;

interface I18nState {
  locale: Locale
}

async function loadMessages(locale: Locale) {
  switch (locale) {
    case Locale.EN:
      return await import("../locales/en.json");
    default:
      return;
  }
}

function initialState(): I18nState {
  let locale;
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
  reducers: {
    setLocale: (state, action: PayloadAction<I18nState>) => {
      state.locale = action.payload.locale;
   }
  },
});

const {setLocale} = i18n.actions;
const selectLocale = (state: RootState): Locale => state.i18n.locale;

export {i18n, Locale, localeNames, loadMessages, selectLocale, setLocale};
