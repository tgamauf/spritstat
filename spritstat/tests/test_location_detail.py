from django.core.exceptions import ObjectDoesNotExist
from django.urls import reverse
from django_q.tasks import Schedule
from rest_framework import status
from rest_framework.test import APITestCase

from spritstat.models import Location


class TestLocationDetail(APITestCase):
    fixtures = ["customuser.json", "schedule.json", "location.json"]

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username="test2@test.at", password="test")

    def test_not_logged_in(self):
        url = reverse("location_detail", args=[2])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ok(self):
        location_id = 2
        url = reverse("location_detail", args=[location_id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        db_entry_dict = Location.objects.get(id=location_id).__dict__
        [
            db_entry_dict.pop(key)
            for key in [
                "_state",
                "user_id",
                "schedule_id",
                "address",
                "city",
                "postal_code",
                "region_name",
            ]
        ]
        for key in ["latitude", "longitude"]:
            if db_entry_dict[key] is not None:
                db_entry_dict[key] = str(db_entry_dict[key])
        self.assertDictEqual(response.data, db_entry_dict)

    def test_location_doesnt_exist(self):
        url = reverse("location_detail", args=[10])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_location_of_other_user(self):
        url = reverse("location_detail", args=[1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TestLocationDelete(APITestCase):
    fixtures = ["customuser.json", "schedule.json", "location.json"]

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username="test2@test.at", password="test")

    def test_not_logged_in(self):
        url = reverse("location_detail", args=[2])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ok(self):
        location_id = 2
        schedul_id = Location.objects.get(id=location_id).schedule.id
        url = reverse("location_detail", args=[location_id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        with self.assertRaisesMessage(
            ObjectDoesNotExist, "Location matching query does not exist."
        ):
            Location.objects.get(id=location_id)
        with self.assertRaisesMessage(
            ObjectDoesNotExist, "Schedule matching query does not exist."
        ):
            Schedule.objects.get(id=schedul_id)

    def test_location_doesnt_exist(self):
        url = reverse("location_detail", args=[10])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_location_of_other_user(self):
        url = reverse("location_detail", args=[1])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TestLocationDetailOther(APITestCase):
    fixtures = ["customuser.json", "schedule.json", "location.json"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("location_detail", args=[2])

    def setUp(self):
        self.client.login(username="test2@test.at", password="test")

    def test_put(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
