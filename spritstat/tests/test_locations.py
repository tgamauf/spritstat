import unittest
from copy import deepcopy
from django.conf import settings
from django.urls import reverse
from django.db import transaction
from django.db.utils import DataError, IntegrityError
from django_q.tasks import Schedule
from rest_framework import status
from rest_framework.test import APITestCase
import re

from spritstat.models import Location
from users.models import CustomUser


class TestLocationCreate(APITestCase):
    fixtures = ["user.json", "settings.json"]
    global_fields = ["type", "name", "fuel_type"]
    address_type_fields = ["latitude", "longitude"]
    region_type_fields = ["region_code", "region_type"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("locations")

    def setUp(self):
        self.default_address_location_data = {
            "type": 1,
            "name": "Default Name 1, 1234 Default City 1",
            "latitude": 48.1234567,
            "longitude": 16.1234567,
            "fuel_type": "DIE",
        }
        self.default_region_location_data = {
            "type": 2,
            "name": "Test",
            "region_code": 1,
            "region_type": "PB",
            "fuel_type": "DIE",
        }

        if not self.id().endswith("_not_logged_in"):
            self.client.login(username="test@test.at", password="test")

    def test_not_logged_in(self):
        response = self.client.post(self.url, self.default_address_location_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_address_ok(self):
        # Test adding three different locations with different fuel types.
        # This will check if all three fuel types work and if adding to an empty
        #  database works as well as to the database if it isn't empty anymore.
        # In addition all fields are explicitly checked here

        # Ensure that the database is empty and the fuel type is in fact diesel
        self.assertFalse(Location.objects.count())

        data_1 = self.default_address_location_data
        data_2 = {
            "type": 1,
            "name": "Default Name 2, 5678 Default City 2",
            "latitude": 49.1234567,
            "longitude": 17.1234567,
            "fuel_type": "SUP",
        }
        data_3 = {
            "type": 1,
            "name": "Default Name 3, 4321 Default City 3",
            "latitude": 50.1234567,
            "longitude": 18.1234567,
            "fuel_type": "GAS",
        }
        check_data = [data_1, data_2, data_3]

        for data in check_data:
            with self.subTest(data=data):
                response = self.client.post(self.url, data)
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Location.objects.count(), len(check_data))

        # Ensure that all fields are set correctly
        locations = list(Location.objects.all())
        for field in self.global_fields + self.address_type_fields:
            if field in ["latitude", "longitude"]:
                with self.subTest(field=field):
                    self.assertListEqual(
                        [float(loc.__getattribute__(field)) for loc in locations],
                        [d[field] for d in check_data],
                    )
            else:
                with self.subTest(field=field):
                    self.assertListEqual(
                        [loc.__getattribute__(field) for loc in locations],
                        [d[field] for d in check_data],
                    )

        # Ensure that a schedule has been created correctly for each location.
        for loc in locations:
            with self.subTest(msg="Schedule", location=loc):
                self.assertEqual(
                    loc.schedule.func, "spritstat.services.request_location_prices"
                )
                match = re.match(r"^\((\d+),", loc.schedule.args)
                self.assertEqual(match.group(1), str(loc.id))
                self.assertEqual(loc.schedule.schedule_type, Schedule.HOURLY)

    def test_max_allowed_locations(self):
        # Ensure that at max LOCATION_LIMIT locations can be created.

        # Create the maximum allowed limit of locations for a user
        Location.objects.bulk_create(
            [
                Location(user_id=300, **self.default_address_location_data)
                for _ in range(settings.LOCATION_LIMIT)
            ]
        )

        response = self.client.post(self.url, self.default_address_location_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_global_field_missing(self):
        # Ensure that the two global values type and fuel_type are required.

        for field in self.global_fields:
            with self.subTest(field=field):
                data = deepcopy(self.default_address_location_data)
                del data[field]

                with transaction.atomic():
                    response = self.client.post(self.url, data)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_global_field_invalid_value(self):
        # Ensure that the two global values type, name, and fuel_type only
        #  accept allowed values.

        for field, value in zip(self.global_fields, (10, "X" * 201, "INVALID")):
            with self.subTest(field=field, value=value):
                data = deepcopy(self.default_address_location_data)
                data[field] = value

                with transaction.atomic():
                    response = self.client.post(self.url, data)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_address_check_coordinate_decimals_rounded(self):
        # Ensure that the latitude and longitude of coordinates are rounded if
        #  the number of decimals is higher than the maximum. This allows to add
        #  coordinates from Google Maps and other Google geo APIs to be added
        #  without any rounding or cropping by the client.

        for field, value in [("latitude", 48.123456789), ("longitude", 16.123456789)]:
            with self.subTest(field=field, value=value):
                data = deepcopy(self.default_address_location_data)
                data[field] = value

                response = self.client.post(self.url, data)
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                self.assertEqual(
                    float(Location.objects.last().__getattribute__(field)),
                    round(value, 7),
                )

    def test_address_field_too_large_coordinate_value(self):
        # Ensure that the that only valid coordinates are accepted, which means
        #  we do not accept more than two digits before the decimal point.
        # We are checking this here to verify the API and ensure consistent
        #  lengths on the backend and frontend.

        for field, value in [("latitude", 123.1234567), ("longitude", 123.1234567)]:
            with self.subTest(field=field, value=value):
                data = deepcopy(self.default_address_location_data)
                data[field] = value

                with self.assertRaisesMessage(DataError, "numeric field overflow"):
                    with transaction.atomic():
                        response = self.client.post(self.url, data)
                    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_address_field_missing(self):
        # Ensure that the address parts of the location are required

        for field in self.address_type_fields:
            with self.subTest(field=field):
                data = deepcopy(self.default_address_location_data)
                del data[field]

                with self.assertRaisesMessage(
                    IntegrityError,
                    'new row for relation "spritstat_location" violates '
                    'check constraint "spritstat_location_value_matches_type"',
                ):
                    with transaction.atomic():
                        response = self.client.post(self.url, data)
                    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_address_field_invalid_value(self):
        # Verify the maximum length of the name - we are checking this here to
        #  verify the API and ensure consistent lengths on the backend and
        #  frontend

        for field, value in zip(self.address_type_fields, ["X", "X"]):
            with self.subTest(field=field, value=value):
                data = deepcopy(self.default_address_location_data)
                data[field] = value

                with transaction.atomic():
                    response = self.client.post(self.url, data)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_region_ok(self):
        # Create a new region location and check if all required fields are
        #  added correctly. We do not check any of the global fields anymore, as
        #  this has been done already for address locations.

        response = self.client.post(self.url, self.default_region_location_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Location.objects.count(), 1)

        # Ensure that all region fields are set correctly
        for field in self.region_type_fields:
            with self.subTest(field=field):
                self.assertEqual(
                    Location.objects.last().__getattribute__(field),
                    self.default_region_location_data[field],
                )

    def test_region_field_missing(self):
        # Ensure that all region parts of the location are required

        for field in self.region_type_fields:
            with self.subTest(field=field):
                data = deepcopy(self.default_region_location_data)
                del data[field]

                with self.assertRaisesMessage(
                    IntegrityError,
                    'new row for relation "spritstat_location" violates '
                    'check constraint "spritstat_location_value_matches_type"',
                ):
                    with transaction.atomic():
                        response = self.client.post(self.url, data)
                    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_region_field_invalid_value(self):
        # Ensure that the region values accept only allowed values

        for field, value in zip(self.region_type_fields, ("X" * 201, "X", "INVALID")):
            with self.subTest(field=field, value=value):
                data = deepcopy(self.default_region_location_data)
                data[field] = value

                with transaction.atomic():
                    response = self.client.post(self.url, data)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestLocationList(APITestCase):
    fixtures = ["user.json", "settings.json", "location.json"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("locations")

    def test_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_no_locations_for_user(self):
        # No locations exist for this user.

        user = CustomUser.objects.get(email="test@test.at")
        user.locations.get_queryset().delete()

        self.client.login(username=user.email, password="test")

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data)

    def test_ok(self):
        # Two locations exist for this user - validate data for users.

        self.client.login(username="test2@test.at", password="test")

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        for response_entry, db_entry in zip(
            response.data, Location.objects.filter(user=4).order_by("id")
        ):
            db_entry_dict = db_entry.__dict__
            [db_entry_dict.pop(key) for key in ["_state", "user_id", "schedule_id"]]
            for key in ["latitude", "longitude"]:
                if db_entry_dict[key] is not None:
                    db_entry_dict[key] = str(db_entry_dict[key])
            self.assertDictEqual(response_entry, db_entry_dict)


class TestLocationOther(APITestCase):
    fixtures = ["user.json", "location.json"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("locations")

    def setUp(self):
        self.client.login(username="test2@test.at", password="test")

    def test_put(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
