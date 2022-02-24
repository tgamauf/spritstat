from django.conf import settings
from rest_framework import serializers

from .models import Price, Station, Location, PriceQuerySet


class LocationSerializer(serializers.ModelSerializer):
    latitude = serializers.DecimalField(
        required=False, max_digits=None, decimal_places=None, allow_null=True
    )
    longitude = serializers.DecimalField(
        required=False, max_digits=None, decimal_places=None, allow_null=True
    )

    class Meta:
        ordering = ["id"]
        model = Location
        fields = (
            "id",
            "type",
            "name",
            "latitude",
            "longitude",
            "region_code",
            "region_type",
            "fuel_type",
        )

    def validate(self, data):
        count = Location.objects.filter(user=self.context["request"].user.id).count()
        if count >= settings.LOCATION_LIMIT:
            raise serializers.ValidationError(
                f"Location limit reached ({settings.LOCATION_LIMIT})"
            )
        return data


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        ordering = ["id"]
        model = Station
        fields = (
            "id",
            "name",
            "address",
            "postal_code",
            "city",
        )


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        ordering = ["datetime"]
        model = Price
        fields = (
            "id",
            "location",
            "datetime",
            "stations",
            "min_amount",
        )


class PriceDayOfWeekSerializer(serializers.BaseSerializer):
    day_of_week = serializers.IntegerField(min_value=1, max_value=7)
    value = serializers.FloatField(min_value=0)

    def to_representation(self, instance):
        return instance


class PriceDayOfMonthSerializer(serializers.BaseSerializer):
    day_of_month = serializers.IntegerField(min_value=1, max_value=31)
    value = serializers.FloatField(min_value=0)

    def to_representation(self, instance):
        return instance


class PriceStationFrequencySerializer(serializers.BaseSerializer):
    id = serializers.IntegerField(min_value=1)
    frequency = serializers.IntegerField(min_value=0)

    def to_representation(self, instance):
        return instance
