import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {i18n as i18nLib} from "@lingui/core";
import {de, en} from 'make-plural/plurals'

import {RootState} from "../app/store";


// Initial plurals
i18nLib.loadLocaleData({
  de: { plurals: de },
  en: { plurals: en },
})

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

async function activateLocale(locale: Locale) {
    const {messages} = await import(`../../locales/${locale}/messages.po`)
    i18nLib.load(locale, messages);
    i18nLib.activate(locale);
}

const setLocale = createAsyncThunk<Locale, Locale>(
  "locale/activate",
  async (locale) => {
    try {
      await activateLocale(locale)

      return locale;
    } catch (e) {
      throw new Error(`Failed to load locale "${locale}": ${e}`);
    }
  }
)

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

export {activateLocale, Locale, localeNames, i18n, selectLocale, setLocale};
