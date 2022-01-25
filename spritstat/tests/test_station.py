from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from spritstat.models import Station


class TestStationDetail(APITestCase):
    fixtures = [
        "customuser.json",
        "schedule.json",
        "location.json",
        "test_station.json",
    ]
    station_id: int

    @classmethod
    def setUpTestData(cls):
        cls.station_id = 2
        cls.url = reverse("station_detail", args=[cls.station_id])

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username="test2@test.at", password="test")

    def test_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ok(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        db_entry_dict = Station.objects.get(id=self.station_id).__dict__
        [db_entry_dict.pop(key) for key in ["_state", "user_id"]]
        for key in ["latitude", "longitude"]:
            if db_entry_dict[key] is not None:
                db_entry_dict[key] = str(db_entry_dict[key])
        self.assertDictEqual(response.data, db_entry_dict)

    def test_station_doesnt_exist(self):
        url = reverse("station_detail", args=[10])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_station_of_other_user(self):
        url = reverse("station_detail", args=[1])
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
