from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from spritstat.models import Station
from users.models import CustomUser


class TestStations(APITestCase):
    fixtures = [
        "customuser.json",
        "schedule.json",
        "location.json",
        "test_station.json",
    ]
    email: str
    station_id: int
    url: str
    user: CustomUser

    @classmethod
    def setUpTestData(cls):
        cls.station_id = 2
        cls.url = reverse("stations")
        cls.email = "test2@test.at"
        cls.user = CustomUser.objects.get(email=cls.email)

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username=self.email, password="test")

    def test_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ok(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        for station, check_station in zip(
            response.data, Station.objects.filter(users=self.user).values()
        ):
            [check_station.pop(key) for key in ["latitude", "longitude"]]
            self.assertDictEqual(station, check_station)

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
