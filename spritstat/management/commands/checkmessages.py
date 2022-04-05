from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
import os
import polib


MESSAGE_DIR = "LC_MESSAGES"
TRANSLATION_FILENAME = "django.po"


class Command(BaseCommand):
    help = "Checks if all messages for a locale are translated"

    def handle(self, *args, **kwargs):
        # Collect all translation file paths and create a dict that maps the locale
        #  to the file paths.
        locales = {}
        for path in settings.LOCALE_PATHS:
            for loc in os.listdir(path):
                locales.setdefault(loc, []).append(
                    os.path.join(path, loc, MESSAGE_DIR, TRANSLATION_FILENAME)
                )

        # Check for missing translations in all translation files.
        error = False
        for loc, file_paths in locales.items():
            for path in file_paths:
                data = polib.pofile(path)

                for entry in data:
                    if entry.msgid and entry.msgstr == "":
                        self.stderr.write(
                            f"Missing translation found for locale '{loc}' in file "
                            f"'{path}'': {entry.msgid}"
                        )
                        error = True

        if error:
            raise CommandError("Missing translations found")
