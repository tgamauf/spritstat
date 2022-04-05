from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
import os
import polib
from typing import List


MESSAGE_DIR = "LC_MESSAGES"
TRANSLATION_FILENAME = "django.po"


class Command(BaseCommand):
    help = "Checks if all messages for a locale are translated"

    COMMENT_TOKEN = "#|"
    OBSOLETE_MESSAGE_ID_TOKEN = f"{COMMENT_TOKEN} msgid"

    @staticmethod
    def _extract_msgid(line: str, token) -> str:
        return line.lstrip(token).lstrip().strip('"') + "\n"

    @classmethod
    def _parse_obsolete(cls, data: str) -> List[str]:
        # Quick and dirty parsing for obsolete message ids marked like that:
        #  #| msgid ""
        #  #| "..."
        # We need to do that as polib obviously doesn't recognize it as obsolete.
        obsolete_msgids = []
        parse_id = False
        msgid = ""
        for line in data.split("\n"):
            if not parse_id and line.startswith(cls.OBSOLETE_MESSAGE_ID_TOKEN):
                parse_id = True
                # Store the message id text including possible whitespace
                msgid = cls._extract_msgid(line, cls.OBSOLETE_MESSAGE_ID_TOKEN)
            elif parse_id:
                if line.startswith(cls.COMMENT_TOKEN):
                    # Add new lines to the existing id and intend follow up lines
                    msgid += "\t" + cls._extract_msgid(line, cls.COMMENT_TOKEN)
                else:
                    obsolete_msgids.append(msgid)
                    parse_id = False

        return obsolete_msgids

    def handle(self, *args, **kwargs):
        # Collect all translation file paths and create a dict that maps the locale
        #  to the file paths.
        locales = {}
        for path in settings.LOCALE_PATHS:
            for loc in os.listdir(path):
                locales.setdefault(loc, []).append(
                    os.path.join(path, loc, MESSAGE_DIR, TRANSLATION_FILENAME)
                )

        # Check for missing and changed translations in all translation files.
        error = False
        for loc, file_paths in locales.items():
            for path in file_paths:
                # Load and parse the file and check if any translation is missing
                with open(path) as file:
                    data = file.read()
                    for entry in self._parse_obsolete(data):
                        self.stdout.write(
                            f"* Obsolete translation found for locale '{loc}' in file "
                            f"'{path}'': {entry}"
                        )
                        error = True

                    pofile = polib.pofile(data)
                    for entry in pofile.untranslated_entries():
                        self.stdout.write(
                            f"* Missing translation found for locale '{loc}' in file "
                            f"'{path}'': {entry.msgid}"
                        )
                        error = True

        if error:
            raise CommandError("Missing translations found")
