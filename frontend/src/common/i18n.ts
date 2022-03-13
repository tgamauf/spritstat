import {i18n} from "@lingui/core";
import {de, en} from "make-plural/plurals";

enum Locales {
  DE = "de",
  EN = "en"
}

const defaultLocale = Locales.DE;

i18n.loadLocaleData({
  de: {plurals: de},
  en: {plurals: en},
})

async function dynamicActivate(locale: Locales) {
  try {
    const {messages} = await import(`@lingui/loader!./locales/${locale}/messages.po`);//TODO
    i18n.load(locale, messages);
    i18n.activate(locale);
  } catch (e) {
    console.error(`Failed to load locale "${locale}": ${e}`);
  }
}

function getLocale(): Locales {
  let locale;
  if (/^de\b/.test(navigator.language)) {
    locale = Locales.DE
  } else if (/^en\b/.test(navigator.language)) {
    locale = Locales.EN;
  } else {
    locale = defaultLocale;
  }

  return locale;
}

export {defaultLocale, dynamicActivate, getLocale, Locales}
