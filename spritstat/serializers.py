from typing import Dict

from allauth.account.utils import url_str_to_user_pk
from django.conf import settings
from django.utils.encoding import force_str
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from users.models import CustomUser
from .models import IntroSettings, Location, Price, Settings, Station
from .services import Token


class IntroSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntroSettings
        fields = [
            "add_location_active",
            "location_details_active",
            "location_list_active",
            "no_location_active",
        ]


class SettingsSerializer(serializers.ModelSerializer):
    intro = IntroSettingsSerializer()

    class Meta:
        ordering = ["id"]
        model = Settings
        fields = ["intro", "notifications_active"]
        depth = 1

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.user = getattr(self.context.get("request"), "user", None)

    def update(self, instance: Settings, validated_data: Dict) -> Settings:
        intro_data = validated_data.get("intro")
        if intro_data is not None:
            self.fields["intro"].update(instance.intro, intro_data)

        notifications_active = validated_data.get("notifications_active")
        if notifications_active is not None:
            instance.notifications_active = notifications_active
            instance.save()

            # Also delete the currently scheduled notification if notifications
            #  have been deactivated
            if not notifications_active and self.user.next_notification:
                self.user.next_notification.delete()

        return instance


class UnsubscribeSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

    user: CustomUser

    def validate(self, attrs):
        # Decode the uidb64 (allauth use base36) to uid to get User object
        try:
            uid = force_str(url_str_to_user_pk(attrs["uid"]))
            self.user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            raise ValidationError({"uid": ["Invalid value"]})

        if not Token(self.user).check(attrs["token"]):
            raise ValidationError({"token": ["Invalid value"]})

        return attrs

    def save(self, **kwargs):
        # Disable notifications in the settings
        self.user.settings.notifications_active = False
        self.user.settings.save()

        # Delete the currently scheduled notifications
        if self.user.next_notification:
            self.user.next_notification.delete()


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
        fields = ("id", "name")


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


class PriceHourSerializer(serializers.BaseSerializer):
    day_of_week = serializers.IntegerField(min_value=0, max_value=23)
    value = serializers.FloatField(min_value=0)

    def to_representation(self, instance):
        return instance


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
    frequency = serializers.FloatField(min_value=0, max_value=1)

    def to_representation(self, instance):
        return instance
