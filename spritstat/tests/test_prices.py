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
        # Ensure that we get all entries and the corresponding fields

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
        # Ensure that we get all entries and the corresponding fields

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        # Compare with the calculated amounts
        self.assertListEqual(
            response.data,
            [
                {"day_of_week": 1, "amount": 1.5},  # Price 4 & 5 on Mondays
                {"day_of_week": 5, "amount": 1.0},  # Price 3 on Fridays
                {"day_of_week": 7, "amount": 2.5},  # Price 1 & 2 on Sundays
            ],
        )

    def test_date_ranges(self):
        # Test if the data for the correct date ranges is received. The date of

        mock_now = Price.objects.filter(
            location=self.location_id
        ).last().datetime + timedelta(days=1)
        with patch("spritstat.models.datetime") as mock_datetime:
            mock_datetime.now.return_value = mock_now
            for range_, values in zip(
                [entry.value for entry in DateRange],
                [
                    [  # One month back contains entries 4 & 5
                        {"day_of_week": 1, "amount": 1.5}
                    ],
                    [  # Three months back contains entries 3-5
                        {"day_of_week": 1, "amount": 1.5},  # Mondays
                        {"day_of_week": 7, "amount": 3.0},  # Sunday
                    ],
                    [  # Six months back contains entries 2-5
                        {"day_of_week": 1, "amount": 1.5},  # Mondays
                        {"day_of_week": 7, "amount": 2.5},  # Sundays
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
