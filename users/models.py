from __future__ import annotations
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django_q.models import Schedule


class Locales(models.TextChoices):
    DE = "de", _("Deutsch")
    EN = "en", _("Englisch")


class CustomUser(AbstractUser):
    locale = models.CharField(choices=Locales.choices, max_length=2, null=True)
    has_beta_access = models.BooleanField(default=False)
    last_activity = models.DateTimeField(auto_now=True)
    next_notification = models.OneToOneField(
        Schedule, null=True, on_delete=models.SET_NULL
    )

    def __str__(self):
        return f"{self.email} ({self.id})"
