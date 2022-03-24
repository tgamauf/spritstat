enum Locale {
  DE = "de",
  EN = "en"
}

const localeNames = new Map<Locale, string>([
  [Locale.DE, "Deutsch"], [Locale.EN, "English"]
]);

export {Locale, localeNames};
