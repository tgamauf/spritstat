from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from spritstat.models import Settings
from users.models import CustomUser


class TestStations(APITestCase):
    fixtures = ["customuser.json", "settings.json"]
    url: str
    user: CustomUser

    def intro_settings_as_dict(self):
        return {
            k: v
            for k, v in Settings.objects.get(user=self.user).intro.__dict__.items()
            if k not in ["_state", "id"]
        }

    @classmethod
    def setUpTestData(cls):
        cls.station_id = 2
        cls.url = reverse("settings")
        cls.user = CustomUser.objects.get(id=4)

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username=self.user.email, password="test")

    def test_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        test_payload = {
            "intro": {
                "no_location_active": True,
                "location_list_active": False,
                "add_location_active": True,
                "location_details_active": False,
            }
        }

        response = self.client.put(self.url, test_payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.patch(self.url, test_payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ok(self):
        # Test if we get the correct settings
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data["intro"], self.intro_settings_as_dict())

        # Test if we can set the settings using put
        test_payload = {
            "intro": {
                "no_location_active": False,
                "location_list_active": True,
                "add_location_active": False,
                "location_details_active": True,
            }
        }
        response = self.client.put(self.url, test_payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data, test_payload)
        self.assertDictEqual(response.data["intro"], self.intro_settings_as_dict())

        # Test if we can set the one of the settings using patch
        test_payload["intro"]["add_location_active"] = True
        response = self.client.patch(self.url, {"intro": {"add_location_active": True}})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data, test_payload)
        self.assertDictEqual(response.data["intro"], self.intro_settings_as_dict())

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
