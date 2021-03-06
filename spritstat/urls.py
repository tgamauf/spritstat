from django.contrib import admin
from django.urls import path, include, re_path

from . import views


urlpatterns = [
    path("", views.index),
    path("manifest.json", views.manifest),
    path("service-worker.js", views.service_worker),
    path("offline.html", views.offline),
    path("admin/", admin.site.urls),
    path("api/v1/users/", include("users.urls")),
    path("api/v1/sprit/settings/", views.Settings.as_view(), name="settings"),
    path("api/v1/sprit/", views.LocationList.as_view(), name="locations"),
    path(
        "api/v1/sprit/<int:pk>/", views.LocationDetail.as_view(), name="location_detail"
    ),
    path(
        "api/v1/sprit/<int:location_id>/prices/",
        views.PriceHistory.as_view(),
        name="prices_history",
    ),
    path(
        "api/v1/sprit/<int:location_id>/prices/hour/",
        views.PriceHour.as_view(),
        name="prices_hour",
    ),
    path(
        "api/v1/sprit/<int:location_id>/prices/day_of_week/",
        views.PriceDayOfWeek.as_view(),
        name="prices_day_of_week",
    ),
    path(
        "api/v1/sprit/<int:location_id>/prices/day_of_month/",
        views.PriceDayOfMonth.as_view(),
        name="prices_day_of_month",
    ),
    path(
        "api/v1/sprit/<int:location_id>/prices/station_frequency/",
        views.PriceStationFrequency.as_view(),
        name="prices_station_frequency",
    ),
    path(
        "api/v1/sprit/station/",
        views.StationList.as_view(),
        name="stations",
    ),
    path(
        "api/v1/sprit/unsubscribe/",
        views.UnsubscribeView.as_view(),
        name="unsubscribe",
    ),
    # This is really just used to redirect the GET request to the unsubscribe-URL
    #  to the frontend. Unsubscribe is handled by the POST request to the URL
    #  above.
    path(
        "api/v1/sprit/unsubscribe/<slug:uid>/<slug:token>/",
        views.UnsubscribeView.as_view(),
        name="unsubscribe",
    ),
    re_path(r".*", views.index),
]
