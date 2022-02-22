from datetime import datetime
from enum import Enum
from typing import Optional, Union

from dateutil.relativedelta import relativedelta
from django.db import models
from django.db.models import Avg
from django.db.models.functions import Length, ExtractIsoWeekDay, ExtractDay

from django_q.models import Schedule
from users.models import CustomUser


# We need to modify the CharField, so it provides the length function for our
#  constraints
models.CharField.register_lookup(Length)


REGION_TYPES = (("BL", "Bundesland"), ("PB", "Bezirk"))
FUEL_TYPES = (("DIE", "Diesel"), ("SUP", "Super"), ("GAS", "Gas"))


class LocationType(models.IntegerChoices):
    NAMED = 1, "Named"
    REGION = 2, "Region"


class Location(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="locations"
    )
    type = models.IntegerField(choices=LocationType.choices)
    name = models.CharField(max_length=200)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=7, blank=True, null=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=7, blank=True, null=True
    )
    region_code = models.IntegerField(blank=True, null=True)
    region_type = models.CharField(max_length=2, choices=REGION_TYPES, blank=True)
    fuel_type = models.CharField(max_length=10, choices=FUEL_TYPES)
    schedule = models.OneToOneField(Schedule, null=True, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.CheckConstraint(
                name="%(app_label)s_%(class)s_value_matches_type",
                check=(
                    models.Q(
                        type=LocationType.NAMED,
                        latitude__isnull=False,
                        longitude__isnull=False,
                        region_code__isnull=True,
                        region_type__exact="",
                    )
                    | models.Q(
                        type=LocationType.REGION,
                        latitude__isnull=True,
                        longitude__isnull=True,
                        region_code__isnull=False,
                        region_type__length__gt=0,
                    )
                ),
            )
        ]

    def delete(self, *args, **kwargs):
        self.schedule.delete()
        return super(self.__class__, self).delete(*args, **kwargs)


class Station(models.Model):
    users = models.ManyToManyField(CustomUser, related_name="stations")
    name = models.CharField(max_length=80)
    address = models.CharField(max_length=80)
    postal_code = models.CharField(max_length=4)
    city = models.CharField(max_length=30)
    latitude = models.DecimalField(max_digits=9, decimal_places=7)
    longitude = models.DecimalField(max_digits=9, decimal_places=7)


class DateRange(str, Enum):
    OneMonth = "1m"
    ThreeMonth = "3m"
    SixMonths = "6m"


class PriceQuerySet(models.QuerySet):
    def date_range(
        self, date_range: Optional[DateRange]
    ) -> Union["PriceQuerySet", models.QuerySet]:
        now = datetime.now()

        if date_range == DateRange.OneMonth:
            data = self.filter(
                datetime__gte=now - relativedelta(months=1),
            )
        elif date_range == DateRange.ThreeMonth:
            data = self.filter(
                datetime__gte=now - relativedelta(months=3),
            )
        elif date_range == DateRange.SixMonths:
            data = self.filter(
                datetime__gte=now - relativedelta(months=6),
            )
        else:
            data = self.all()

        return data

    def average_day_of_week(self) -> Union["PriceQuerySet", models.QuerySet]:
        return (
            self.annotate(day_of_week=ExtractIsoWeekDay("datetime"))
            .values("day_of_week")
            .annotate(amount=Avg("min_amount"))
            .order_by("day_of_week")
        )

    def average_day_of_month(self) -> Union["PriceQuerySet", models.QuerySet]:
        return (
            self.annotate(day_of_month=ExtractDay("datetime"))
            .values("day_of_month")
            .annotate(amount=Avg("min_amount"))
            .order_by("day_of_month")
        )


class Price(models.Model):
    objects = PriceQuerySet.as_manager()

    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name="prices"
    )
    datetime = models.DateTimeField(auto_now_add=True)
    stations = models.ManyToManyField(Station, related_name="prices")
    min_amount = models.FloatField()
    max_amount = models.FloatField()
    average_amount = models.FloatField()
    median_amount = models.FloatField()
