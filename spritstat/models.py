from django.db import models
from django.db.models.functions import Length

from django_q.models import Schedule
from users.models import CustomUser


# We need to modify the CharField so it provides the length function for our
#  constraints
models.CharField.register_lookup(Length)


REGION_TYPES = (("BL", "Bundesland"), ("PB", "Bezirk"))
FUEL_TYPES = (("DIE", "Diesel"), ("SUP", "Super"), ("GAS", "Gas"))


class LocationType(models.IntegerChoices):
    NAMED = 1, "Named"
    REGION = 2, "Region"


class Location(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    type = models.IntegerField(choices=LocationType.choices)
    name = models.CharField(max_length=200, null=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=7, blank=True, null=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=7, blank=True, null=True
    )
    address = models.CharField(max_length=80, blank=True)
    postal_code = models.CharField(max_length=4, blank=True)
    city = models.CharField(max_length=30, blank=True)
    region_code = models.IntegerField(blank=True, null=True)
    region_type = models.CharField(max_length=2, choices=REGION_TYPES, blank=True)
    region_name = models.CharField(max_length=50, blank=True)
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
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=80)
    postal_code = models.CharField(max_length=4)
    city = models.CharField(max_length=30)
    latitude = models.DecimalField(max_digits=9, decimal_places=7)
    longitude = models.DecimalField(max_digits=9, decimal_places=7)


class Price(models.Model):
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    datetime = models.DateTimeField(auto_now_add=True)
    stations = models.ManyToManyField(Station, related_name="prices")
    min_amount = models.FloatField()
    max_amount = models.FloatField()
    average_amount = models.FloatField()
    median_amount = models.FloatField()
