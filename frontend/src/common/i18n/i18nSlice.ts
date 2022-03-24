import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import Cookie from "universal-cookie";

import {RootState} from "../../app/store";
import {Locale, Messages} from "./types";
import {localeApi} from "./i18nApiSlice";


interface I18nState {
  locale: Locale;
  messages: Messages;
}

interface LocaleData {
  locale: Locale;
  messages: Messages;
}

const DEFAULT_LOCALE = Locale.DE;
const NO_MESSAGES = {};

async function loadMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case Locale.EN:
      return await import("../../locales/en.json") as unknown as Messages;
    default:
      return NO_MESSAGES;
  }
}

const setLocale = createAsyncThunk<LocaleData, Locale>(
  "i18n/setLocale",
  async (locale, {dispatch}) => {
    dispatch(localeApi.endpoints.setLocale.initiate(locale));

    let messages = await loadMessages(locale);

    return {locale, messages};
  }
)

function initialState(): I18nState {
  // Check if we have a language cookie set and if this is the case use that.
  const cookie = new Cookie();
  let locale = cookie.get("locale")

  if (locale) {
    return {locale, messages: NO_MESSAGES};
  }

  if (/^de\b/.test(navigator.language)) {
    locale = Locale.DE
  } else if (/^en\b/.test(navigator.language)) {
    locale = Locale.EN;
  } else {
    locale = DEFAULT_LOCALE;
  }

  return {locale, messages: NO_MESSAGES};
}

const i18n = createSlice({
  name: "i18n",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Messages>) => {
      state.messages = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(
      setLocale.fulfilled,
      (state, action) => {
        state.locale = action.payload.locale;
        state.messages = action.payload.messages
      })
  }
});

const selectLocale = (state: RootState): Locale => state.i18n.locale;
const selectLocaleData = (state: RootState): LocaleData => {
  return {
    locale: state.i18n.locale,
    messages: state.i18n.messages
  }
};

const {setMessages} = i18n.actions;

export {i18n, loadMessages, selectLocale, selectLocaleData, setLocale, setMessages};
