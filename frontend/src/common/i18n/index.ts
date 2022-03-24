import {localeNames, Locale} from "./types";
import {i18n, selectLocale, setLocale} from "./i18nSlice";


async function loadMessages(locale: Locale) {
  switch (locale) {
    case Locale.EN:
      return await import("../../locales/en.json");
    default:
      return;
  }
}

export {i18n, localeNames, Locale, loadMessages, selectLocale, setLocale};
