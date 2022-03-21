import {readFile, writeFile} from "fs/promises";

const DEFAULT_LOCALE = "de";
const LOCALES = ["en"];
const LOCALE_PATH = "translation/locales/";

interface LocaleEntry {
  description: string;
  defaultMessage: string;
  // This doesn't exist in react-intl, but we use it so already translated
  //  messages aren't lost.
  obsoleteMessage?: string;
}

interface LocaleData {
  [key: string]: LocaleEntry;
}

interface TranslationData {
  keys: Set<string>;
  data: LocaleData;
}

async function manageLocaleFiles() {
  const defaultData = await readLocale(DEFAULT_LOCALE);
  for (const locale of LOCALES) {
    const translatedData = await readLocale(locale);
    const mergedData = mergeChanges(defaultData, translatedData);
    await writeLocale(locale, mergedData);
  }
}

async function readLocale(locale: string, required: boolean = false): Promise<TranslationData> {
  const path = `${LOCALE_PATH}/${locale}.json`;
  try {
    const data = await readFile(path);
    const parsedData = JSON.parse(data.toString());
    return {
      keys: new Set<string>(Object.keys(parsedData)),
      data: parsedData
    };
  } catch (e) {
    if (required) {
      throw new Error(`Could not load locale from ${path}: ${e}`);
    }

    // File doesn't exist yet, so let's create a new one.
    return {
      keys: new Set<string>(),
      data: {}
    };
  }
}

function mergeChanges(
  defaultData: TranslationData,
  translatedData: TranslationData
): TranslationData {
  translatedData = updateChanged(defaultData, translatedData);
  translatedData = updateDescription(defaultData, translatedData);
  return translatedData
}

function updateChanged(
  defaultData: TranslationData,
  translatedData: TranslationData,
): TranslationData {
  const keysMissingInDefault = difference(defaultData.keys, translatedData.keys);
  const keysMissingInTranslated = difference(translatedData.keys, defaultData.keys);

  keysMissingInTranslated.forEach((translatedKey) => {
    keysMissingInDefault.forEach((defaultKey) => {

      const translatedEntry = translatedData.data[translatedKey];
      const defaultEntry = defaultData.data[defaultKey];
      if (translatedEntry.description === defaultEntry.description) {
        // The defaultMessage changed, so let's simply copy the entry and add the
        //  current translation as obsolete message.
        console.info(`Entry '${defaultEntry.description}' has changed`);
        translatedData.keys.add(defaultKey);
        translatedData.data[defaultKey] = {
          defaultMessage: "",
          description: defaultEntry.description,
          obsoleteMessage: translatedEntry.defaultMessage
        };

        // Delete defaultKey from the keysMissingInDefault, so we do not add it
        //  as a new entry later on.
        keysMissingInDefault.delete(defaultKey);
      } else {
        // Even the description is different, so either this entry was deleted
        //  or both the defaultMessage and description changed, which means we
        //  cannot associate the entries anymore.
        console.info(`Entry '${translatedEntry.description}' has been deleted`);
      }
    });

    // Delete the entry from the translated data.
    translatedData.keys.delete(translatedKey);
    delete translatedData.data[translatedKey];
  });

  // Add all remaining items as new translated items.
  keysMissingInDefault.forEach((defaultKey) => {
    const defaultEntry = defaultData.data[defaultKey];
    console.info(`Add new entry '${defaultEntry.description}'`);
    translatedData.keys.add(defaultKey);
    translatedData.data[defaultKey] = {
      defaultMessage: "",
      description: defaultEntry.description
    };
  });

  return translatedData;
}

function difference(setA: Set<string>, setB: Set<string>): Set<string> {
    const difference = new Set<string>(setA);
    setB.forEach((entry) => {
        difference.delete(entry);
    });
    return difference
}

function updateDescription(
  defaultData: TranslationData,
  translatedData: TranslationData,
): TranslationData {
  const commonKeys = intersection(defaultData.keys, translatedData.keys);
  commonKeys.forEach((key) => {
    const defaultDescription = defaultData.data[key].description;

    if (translatedData.data[key].description == defaultDescription) {
      return;
    }

    console.info(
      `Description for entry '${key}' changed: ${defaultDescription}`
    );
    translatedData.data[key].description = defaultDescription;
  });
  return translatedData;
}

function intersection(setA: Set<string>, setB: Set<string>): Set<string> {
    const intersection = new Set<string>();
    setB.forEach((entry) => {
        if (setA.has(entry)) {
            intersection.add(entry);
        }
    });
    return intersection
}

async function writeLocale(locale: string, translatedData: TranslationData) {
  const path = `${LOCALE_PATH}/${locale}.json`;
  try {
    await writeFile(
      path,
      JSON.stringify(translatedData.data, null, 2) + "\n"
    );
  } catch (e) {
    throw new Error(`Could not save locale to ${path}: ${e}`);
  }
}

void manageLocaleFiles().catch((e) => console.error(e));
