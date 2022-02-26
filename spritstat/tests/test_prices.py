from datetime import timedelta
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from spritstat.models import DateRange, Price


class TestPriceHistory(APITestCase):
    fixtures = [
        "customuser.json",
        "schedule.json",
        "location.json",
        "test_station.json",
        "test_price.json",
    ]
    location_id: int

    @classmethod
    def setUpTestData(cls):
        cls.location_id = 2
        cls.url = reverse("prices_history", args=[cls.location_id])

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username="test2@test.at", password="test")

    def test_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ok(self):
        # Ensure that we get all entries and the corresponding fields without
        #  any date filter

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)

        for result_entry, db_entry in zip(
            response.data,
            Price.objects.filter(location_id=self.location_id).order_by("datetime"),
        ):
            # max_amount, average_amount, median_amount are currently not
            #  provided to the user
            db_entry_dict = {
                "id": db_entry.id,
                "location": db_entry.location_id,
                "datetime": db_entry.datetime.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "stations": [s.id for s in db_entry.stations.all()],
                "min_amount": db_entry.min_amount,
            }
            with self.subTest(result=result_entry, db=db_entry_dict):
                self.assertDictEqual(result_entry, db_entry_dict)

    def test_date_ranges(self):
        # Test if the data for the correct date ranges is received.

        mock_now = Price.objects.filter(
            location=self.location_id
        ).last().datetime + timedelta(days=1)
        with patch("spritstat.models.datetime") as mock_datetime:
            mock_datetime.now.return_value = mock_now
            for range_, ids in zip(
                [entry.value for entry in DateRange],
                [
                    [5],  # One week back entry 5 exists
                    [4, 5],  # One month back entries 4 & 5 exist
                    [3, 4, 5],  # Three months back entries 3-5 exist
                    [2, 3, 4, 5],  # Six months back entries 2-5 exist
                ],
            ):
                with self.subTest(query=range_, ids=ids):
                    response = self.client.get(f"{self.url}?date_range={range_}")
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    self.assertListEqual([entry["id"] for entry in response.data], ids)

    def test_location_doesnt_exist(self):
        url = reverse("prices_history", args=[10])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_station_of_other_user(self):
        url = reverse("prices_history", args=[1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class TestPriceHour(APITestCase):
    fixtures = [
        "customuser.json",
        "schedule.json",
        "location.json",
        "test_station.json",
        "test_price.json",
    ]
    location_id: int

    @classmethod
    def setUpTestData(cls):
        cls.location_id = 2
        cls.url = reverse("prices_hour", args=[cls.location_id])

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username="test2@test.at", password="test")

    def test_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ok(self):
        # Ensure that we get the correctly calculated values without any date
        #  filter

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        # Compare with the calculated amounts
        self.assertListEqual(
            response.data,
            [
                {"hour": 0, "value": 2.0},  # Price 4 at midnight
                {"hour": 3, "value": 2.0},  # Price 2 at 3 o'clock
                {"hour": 12, "value": 2.0},  # Price 1, 3 and 5 at 12 o'clock
            ],
        )

    def test_date_ranges(self):
        # Test if the weekday data is calculated correctly for different date
        #  ranges.

        mock_now = Price.objects.filter(
            location=self.location_id
        ).last().datetime + timedelta(days=1)
        with patch("spritstat.models.datetime") as mock_datetime:
            mock_datetime.now.return_value = mock_now
            for range_, values in zip(
                [entry.value for entry in DateRange],
                [
                    [  # One week back contains entry 5
                        {"hour": 12, "value": 1.0},  # Price 5 at 12 o'clock
                    ],
                    [  # One month back contains entries 4 & 5
                        {"hour": 0, "value": 2.0},  # Price 4 at midnight
                        {"hour": 12, "value": 1.0},  # Price 5 at 12 o'clock
                    ],
                    [  # Three months back contains entries 3-5
                        {"hour": 0, "value": 2.0},  # Price 4 at midnight
                        {"hour": 12, "value": 2.0},  # Price 3 & 5 at 12 o'clock
                    ],
                    [  # Six months back contains entries 2-5
                        {"hour": 0, "value": 2.0},  # Price 4 at midnight
                        {"hour": 3, "value": 2.0},  # Price 2 at 3 o'clock
                        {"hour": 12, "value": 2.0},  # Price 3 & 5 at 12 o'clock
                    ],
                ],
            ):
                with self.subTest(query=range_, values=values):
                    response = self.client.get(f"{self.url}?date_range={range_}")
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    self.assertListEqual(response.data, values)

    def test_location_doesnt_exist(self):
        url = reverse("prices_hour", args=[10])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_station_of_other_user(self):
        url = reverse("prices_hour", args=[1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class TestPriceDayOfWeek(APITestCase):
    fixtures = [
        "customuser.json",
        "schedule.json",
        "location.json",
        "test_station.json",
        "test_price.json",
    ]
    location_id: int

    @classmethod
    def setUpTestData(cls):
        cls.location_id = 2
        cls.url = reverse("prices_day_of_week", args=[cls.location_id])

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username="test2@test.at", password="test")

    def test_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ok(self):
        # Ensure that we get the correctly calculated values without any date
        #  filter

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        # Compare with the calculated amounts
        self.assertListEqual(
            response.data,
            [
                {"day_of_week": 1, "value": 1.5},  # Price 4 & 5 on Mondays
                {"day_of_week": 5, "value": 2.5},  # Price 1 & 3 on Fridays
                {"day_of_week": 6, "value": 2.0},  # Price 2 on Saturdays
            ],
        )

    def test_date_ranges(self):
        # Test if the weekday data is calculated correctly for different date
        #  ranges.

        mock_now = Price.objects.filter(
            location=self.location_id
        ).last().datetime + timedelta(days=1)
        with patch("spritstat.models.datetime") as mock_datetime:
            mock_datetime.now.return_value = mock_now
            for range_, values in zip(
                [entry.value for entry in DateRange],
                [
                    [  # One week back contains entry 5
                        {"day_of_week": 1, "value": 1.0}
                    ],
                    [  # One month back contains entries 4 & 5
                        {"day_of_week": 1, "value": 1.5}
                    ],
                    [  # Three months back contains entries 3-5
                        {"day_of_week": 1, "value": 1.5},  # Mondays
                        {"day_of_week": 5, "value": 3.0},  # Friday
                    ],
                    [  # Six months back contains entries 2-5
                        {"day_of_week": 1, "value": 1.5},  # Mondays
                        {"day_of_week": 5, "value": 3.0},  # Friday
                        {"day_of_week": 6, "value": 2.0},  # Saturdays
                    ],
                ],
            ):
                with self.subTest(query=range_, values=values):
                    response = self.client.get(f"{self.url}?date_range={range_}")
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    self.assertListEqual(response.data, values)

    def test_location_doesnt_exist(self):
        url = reverse("prices_day_of_week", args=[10])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_station_of_other_user(self):
        url = reverse("prices_day_of_week", args=[1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class TestPriceDayOfMonth(APITestCase):
    fixtures = [
        "customuser.json",
        "schedule.json",
        "location.json",
        "test_station.json",
        "test_price.json",
    ]
    location_id: int

    @classmethod
    def setUpTestData(cls):
        cls.location_id = 2
        cls.url = reverse("prices_day_of_month", args=[cls.location_id])

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username="test2@test.at", password="test")

    def test_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ok(self):
        # Ensure that the correct values are calculated without any date filter.

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)

        # Compare with the calculated amounts
        self.assertListEqual(
            response.data,
            [
                {"day_of_month": 1, "value": 2.0},  # Price 1 on 1st of month
                {"day_of_month": 3, "value": 2.0},  # Price 4 on 3rd of month
                {"day_of_month": 10, "value": 2.0},  # Price 3 & 5 on 10th of month
                {"day_of_month": 31, "value": 2.0},  # Price 2 on 31st of month
            ],
        )

    def test_date_ranges(self):
        # Test if the correct values are calculated for each date range.

        mock_now = Price.objects.filter(
            location=self.location_id
        ).last().datetime + timedelta(days=1)
        with patch("spritstat.models.datetime") as mock_datetime:
            mock_datetime.now.return_value = mock_now
            for range_, values in zip(
                [entry.value for entry in DateRange],
                [
                    [  # One week back contains entry 5
                        {"day_of_month": 10, "value": 1.0},
                    ],
                    [  # One month back contains entries 4 & 5
                        {"day_of_month": 3, "value": 2.0},
                        {"day_of_month": 10, "value": 1.0},
                    ],
                    [  # Three months back contains entries 3-5
                        {"day_of_month": 3, "value": 2.0},
                        {
                            "day_of_month": 10,
                            "value": 2.0,
                        },  # The 10th is contained twice
                    ],
                    [  # Six months back contains entries 2-5
                        {"day_of_month": 3, "value": 2.0},
                        {
                            "day_of_month": 10,
                            "value": 2.0,
                        },  # The 10th is contained twice
                        {"day_of_month": 31, "value": 2.0},
                    ],
                ],
            ):
                with self.subTest(query=range_, values=values):
                    response = self.client.get(f"{self.url}?date_range={range_}")
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    self.assertListEqual(response.data, values)

    def test_location_doesnt_exist(self):
        url = reverse("prices_day_of_month", args=[10])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_station_of_other_user(self):
        url = reverse("prices_day_of_month", args=[1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class TestPriceStationFrequency(APITestCase):
    fixtures = [
        "customuser.json",
        "schedule.json",
        "location.json",
        "test_station.json",
        "test_price.json",
    ]
    location_id: int

    @classmethod
    def setUpTestData(cls):
        cls.location_id = 2
        cls.url = reverse("prices_station_frequency", args=[cls.location_id])

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username="test2@test.at", password="test")

    def test_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ok(self):
        # Ensure that the correct station frequency is calculated.

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Compare with the calculated amounts
        self.assertListEqual(
            response.data,
            [{"station_id": 2, "frequency": 1}, {"station_id": 3, "frequency": 0.6}],
        )

    def test_date_ranges(self):
        # Test if the correct values are calculated for each date range.

        mock_now = Price.objects.filter(
            location=self.location_id
        ).last().datetime + timedelta(days=1)
        with patch("spritstat.models.datetime") as mock_datetime:
            mock_datetime.now.return_value = mock_now
            for range_, values in zip(
                [entry.value for entry in DateRange],
                [
                    [  # One week back contains entry 5
                        {"station_id": 2, "frequency": 1},
                        {"station_id": 3, "frequency": 1},
                    ],
                    [  # One month back contains entries 4 & 5
                        {"station_id": 2, "frequency": 1},
                        {"station_id": 3, "frequency": 1},
                    ],
                    [  # Three months back contains entries 3-5
                        {"station_id": 2, "frequency": 1},
                        {"station_id": 3, "frequency": 1},
                    ],
                    [  # Six months back contains entries 2-5
                        {"station_id": 2, "frequency": 1},
                        {"station_id": 3, "frequency": 0.75},
                    ],
                ],
            ):
                with self.subTest(query=range_, values=values):
                    response = self.client.get(f"{self.url}?date_range={range_}")
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    self.assertListEqual(response.data, values)

    def test_location_doesnt_exist(self):
        url = reverse("prices_station_frequency", args=[10])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_station_of_other_user(self):
        url = reverse("prices_station_frequency", args=[1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
