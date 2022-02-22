from abc import ABC, abstractmethod
from django.conf import settings
from django.db.models import QuerySet
from django.shortcuts import render, get_object_or_404
from django_q.tasks import schedule, Schedule
from rest_framework import generics
from rest_framework import permissions
from typing import Union

from rest_framework.serializers import Serializer

from . import models
from .permissions import IsOwner
from . import serializers


def index(request):
    return render(
        request,
        "spritstat/index.html",
        context={"google_maps_api_key": settings.GOOGLE_MAPS_API_KEY},
    )


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
        response = self.create(request, *args, **kwargs)

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


class AbstractPriceList(ABC, generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    serializer_class: Serializer

    def get_queryset(self) -> Union[models.PriceQuerySet, QuerySet]:
        location_id = self.kwargs["location_id"]
        location = get_object_or_404(models.Location, id=location_id)

        if location.user != self.request.user:
            self.permission_denied(
                self.request,
                message=getattr(IsOwner, "message", None),
                code=getattr(IsOwner, "code", None),
            )

        date_range = self.request.query_params.get("date_range")

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
