from django.contrib import admin
from django.urls import path, include, re_path

from . import views


urlpatterns = [
    path("", views.index),
    path("admin/", admin.site.urls),
    path("api/v1/users/", include("users.urls")),
    path("api/v1/sprit/", views.LocationList.as_view(), name="locations"),
    path(
        "api/v1/sprit/<int:pk>/", views.LocationDetail.as_view(), name="location_detail"
    ),
    path(
        "api/v1/sprit/<int:location_id>/prices/",
        views.PriceList.as_view(),
        name="prices",
    ),
    path(
        "api/v1/sprit/station/",
        views.StationList.as_view(),
        name="stations",
    ),
    re_path(r".*", views.index),
]
