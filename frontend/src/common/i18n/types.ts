import {MessageFormatElement} from "@formatjs/icu-messageformat-parser";

enum Locale {
  DE = "de",
  EN = "en"
}

const localeNames = new Map<Locale, string>([
  [Locale.DE, "Deutsch"], [Locale.EN, "English"]
]);

type MessageIds = FormatjsIntl.Message extends {
    ids: string;
} ? FormatjsIntl.Message['ids'] : string;
type Messages = Record<MessageIds, string> | Record<MessageIds, MessageFormatElement[]>;

export {Locale, localeNames};
export type {Messages};
