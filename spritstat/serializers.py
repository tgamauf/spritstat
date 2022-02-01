from django.conf import settings
from rest_framework import serializers

from .models import Price, Station, Location


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
            "latitude",
            "longitude",
        )


class PriceSerializer(serializers.ModelSerializer):
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
