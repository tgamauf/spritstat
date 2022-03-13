import {i18n} from "@lingui/core";
import {de, en} from "make-plural/plurals";

const locales = {
  de: "Deutsch",
  en: "English",
};
const defaultLocale = "de";

i18n.loadLocaleData({
  de: {plurals: de},
  en: {plurals: en},
})

async function dynamicActivate(locale: string) {
  try {
    const {messages} = await import(`./locales/${locale}/messages`)
    i18n.load(locale, messages)
    i18n.activate(locale)
  } catch (e) {
    console.error(`Failed to load locale "${locale}": ${e}`);
  }
}

export {locales, defaultLocale, dynamicActivate}
