from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from spritstat.models import Settings
from users.models import CustomUser


class TestStations(APITestCase):
    fixtures = ["customuser.json", "settings.json"]
    url: str
    user: CustomUser

    @staticmethod
    def create_payload(enable: bool):
        return {"intro": {"enable": enable}}

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

        response = self.client.put(self.url, self.create_payload(True))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.patch(self.url, self.create_payload(True))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ok(self):
        # Test if we get the correct settings
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data["intro"], self.intro_settings_as_dict())

        false_check_settings = {
            "intro": {
                "no_location_active": False,
                "location_list_active": False,
                "add_location_active": False,
                "location_details_active": False,
            }
        }
        true_check_settings = {
            "intro": {
                "no_location_active": True,
                "location_list_active": True,
                "add_location_active": True,
                "location_details_active": True,
            }
        }
        # Test if we can disable the settings using put
        response = self.client.put(self.url, self.create_payload(False))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data, false_check_settings)
        self.assertDictEqual(response.data["intro"], self.intro_settings_as_dict())
        # Test if we can enable the settings again using put
        response = self.client.put(self.url, self.create_payload(True))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data, true_check_settings)
        self.assertDictEqual(response.data["intro"], self.intro_settings_as_dict())

        # Test if we can disable the settings using patch
        response = self.client.patch(self.url, self.create_payload(False))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data, false_check_settings)
        self.assertDictEqual(response.data["intro"], self.intro_settings_as_dict())
        # Test if we can enable the settings again using patch
        response = self.client.patch(self.url, self.create_payload(True))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data, true_check_settings)
        self.assertDictEqual(response.data["intro"], self.intro_settings_as_dict())

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
