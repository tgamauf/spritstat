from abc import ABC, abstractmethod
from typing import Union

from django.conf import settings
from django.db.models import Count, QuerySet, F, FloatField
from django.db.models.functions import Cast
from django.shortcuts import render, get_object_or_404, redirect
from django_q.tasks import schedule, Schedule
from rest_framework import generics, status
from rest_framework import permissions
from rest_framework.serializers import Serializer
from rest_framework.views import APIView, Response

from . import models
from . import serializers
from .permissions import IsOwner
from .serializers import PriceStationFrequencySerializer, UnsubscribeSerializer


def index(request):
    return render(
        request,
        "index.html",
        context={"google_maps_api_key": settings.GOOGLE_MAPS_API_KEY},
    )


class Settings(generics.RetrieveUpdateAPIView):
    queryset = models.Settings.objects.all()
    serializer_class = serializers.SettingsSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), user=self.request.user)
        self.check_object_permissions(self.request, obj)

        return obj


class UnsubscribeView(generics.GenericAPIView):
    UNSUBSCRIBE_PATH_TEMPLATE = "/unsubscribe/{uid}/{token}"
    serializer_class = UnsubscribeSerializer

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        # Redirect to frontend URL, so we can display something to the user and
        #  also use POST instead of GET for the call.
        uid = kwargs.get("uid")
        token = kwargs.get("token")

        if uid is None or token is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return redirect(self.UNSUBSCRIBE_PATH_TEMPLATE.format(uid=uid, token=token))

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class LocationList(generics.ListCreateAPIView):
    serializer_class = serializers.LocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        # We only list the objects of the current user
        return models.Location.objects.filter(user=self.request.user.id)

    def perform_create(self, serializer):
        # Add the current user to the created database object
        serializer.save(user=self.request.user)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # We schedule that the current prices are requested every hour for the
        #  created location in order to save the price history.
        # To allow automatic deletion of the schedule if the location is
        #  deleted we update the location object with the created schedule.
        #  TODO: this probably could be done more efficiently
        location_id = response.data["id"]
        schedule_object = schedule(
            "spritstat.services.request_location_prices",
            location_id,
            schedule_type=Schedule.HOURLY,
        )
        location_object = models.Location.objects.get(pk=location_id)
        location_object.schedule = schedule_object
        location_object.save()

        return response


class LocationDetail(generics.RetrieveDestroyAPIView):
    # We don't want to allow change of a location as this wouldn't make any
    #  sense considering that the data is supposed to be shown in a graph and
    #  if we change the location it wouldn't match anymore.

    queryset = models.Location.objects.all()
    serializer_class = serializers.LocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]


class StationList(generics.ListAPIView):
    serializer_class = serializers.StationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        # We only list the objects of the current user
        return models.Station.objects.filter(users=self.request.user)


class UserLocationMixin(APIView):
    def _get_user_location(self) -> models.Location:
        location_id = self.kwargs["location_id"]
        location = get_object_or_404(models.Location, id=location_id)

        if location.user != self.request.user:
            self.permission_denied(
                self.request,
                message=getattr(IsOwner, "message", None),
                code=getattr(IsOwner, "code", None),
            )

        return location


class DateRangeMixin(APIView):
    def _get_date_range(self) -> str:
        return self.request.query_params.get("date_range")


class AbstractPriceList(ABC, UserLocationMixin, DateRangeMixin, generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    serializer_class: Serializer

    def get_queryset(self) -> Union[models.PriceQuerySet, QuerySet]:
        location = self._get_user_location()
        date_range = self._get_date_range()

        return self._process_data(
            models.Price.objects.filter(location=location).date_range(date_range)
        )

    @abstractmethod
    def _process_data(
        self, data: Union[models.PriceQuerySet, QuerySet]
    ) -> Union[models.PriceQuerySet, QuerySet]:
        pass


class PriceHistory(AbstractPriceList):
    serializer_class = serializers.PriceHistorySerializer

    def _process_data(self, data: QuerySet[models.Price]) -> QuerySet[models.Price]:
        return data


class PriceHour(AbstractPriceList):
    serializer_class = serializers.PriceHourSerializer

    def _process_data(
        self, data: Union[models.PriceQuerySet, QuerySet]
    ) -> Union[models.PriceQuerySet, QuerySet]:
        return data.average_hour()


class PriceDayOfWeek(AbstractPriceList):
    serializer_class = serializers.PriceDayOfWeekSerializer

    def _process_data(
        self, data: Union[models.PriceQuerySet, QuerySet]
    ) -> Union[models.PriceQuerySet, QuerySet]:
        return data.average_day_of_week()


class PriceDayOfMonth(AbstractPriceList):
    serializer_class = serializers.PriceDayOfMonthSerializer

    def _process_data(
        self, data: Union[models.PriceQuerySet, QuerySet]
    ) -> Union[models.PriceQuerySet, QuerySet]:
        return data.average_day_of_month()


class PriceStationFrequency(UserLocationMixin, DateRangeMixin, generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    serializer_class = PriceStationFrequencySerializer

    def get_queryset(self) -> QuerySet:
        location = self._get_user_location()
        date_range = self._get_date_range()

        prices = models.Price.objects.filter(location=location).date_range(date_range)
        count = prices.count()
        return (
            models.Price.stations.through.objects.filter(price__in=prices)
            .values("station_id")
            .alias(count=Count("station_id"))
            .annotate(frequency=Cast(F("count"), output_field=FloatField()) / count)
        )
