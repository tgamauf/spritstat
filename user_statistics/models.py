from __future__ import annotations
from django.db import models

from user_visit.models import UserVisit


class DailyActiveUsers(models.Model):
    date = models.DateField(primary_key=True)
    count = models.PositiveIntegerField()
    fraction = models.DecimalField(max_digits=3, decimal_places=2)


class MonthlyActiveUsers(models.Model):
    date = models.DateField(primary_key=True)
    count = models.PositiveIntegerField()
    fraction = models.DecimalField(max_digits=3, decimal_places=2)
