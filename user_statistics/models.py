from __future__ import annotations
from django.db import models
from django.utils import timezone
from typing import Union

from user_visit.models import UserVisit


class DailyUsers(models.Model):
    date = models.DateField(auto_now_add=True)
    day_of_month = models.PositiveIntegerField()
    count = models.PositiveIntegerField()
    fraction = models.DecimalField(max_digits=3, decimal_places=2)

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        if not self.day_of_month:
            self.day_of_month = self.date.isoweekday()
        super().save(force_insert, force_update, using, update_fields)


class MonthlyUsers(models.Model):
    date = models.DateField(auto_now_add=True)
    month = models.PositiveIntegerField()
    count = models.PositiveIntegerField()
    fraction = models.DecimalField(max_digits=3, decimal_places=2)

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        if not self.month:
            self.month = self.date.month
        super().save(force_insert, force_update, using, update_fields)


class UserVisitQueryset(models.QuerySet):
    # The queryset is meant to be used on a UserVisit model in order to
    #  aggregate the number of uses for the specified timeframe.

    def __init__(self):
        super().__init__(model=UserVisit)

    def day(self) -> Union[UserVisitQueryset, models.QuerySet]:
        # Get the daily users for the current day of the provided date.
        now = timezone.now()
        return self.filter(
            timestamp__year=now.year, timestamp__month=now.month, timestamp__day=now.day
        )

    def month(self) -> Union[UserVisitQueryset, models.QuerySet]:
        # Get the daily users for the month of the provided date.
        now = timezone.now()
        return self.filter(timestamp__year=now.year, timestamp__month=now.month)

    def distinct_users(self) -> Union[UserVisitQueryset, models.QuerySet]:
        return self.distinct("user")
