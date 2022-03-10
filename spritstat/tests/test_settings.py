from allauth.account.utils import user_pk_to_url_str
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from spritstat.models import Settings
from spritstat.services import Token
from users.models import CustomUser


class TestSettings(APITestCase):
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
        cls.url = reverse("settings")
        cls.user = CustomUser.objects.get(id=4)

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username=self.user.email, password="test")

    def test_ok_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        test_payload = {
            "intro": {
                "no_location_active": True,
                "location_list_active": False,
                "add_location_active": True,
                "location_details_active": False,
            },
            "notifications_active": True,
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
        self.assertEqual(response.data["notifications_active"], True)

        # Test if we can set the settings using put
        test_payload = {
            "intro": {
                "no_location_active": False,
                "location_list_active": True,
                "add_location_active": False,
                "location_details_active": True,
            },
            "notifications_active": False,
        }
        response = self.client.put(self.url, test_payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data, test_payload)
        self.assertDictEqual(response.data["intro"], self.intro_settings_as_dict())
        self.assertEqual(response.data["notifications_active"], False)

        # Test if we can set the one of the intro settings using patch
        test_payload["intro"]["add_location_active"] = True
        response = self.client.patch(self.url, {"intro": {"add_location_active": True}})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data, test_payload)
        self.assertDictEqual(response.data["intro"], self.intro_settings_as_dict())

        test_payload["notifications_active"] = True
        response = self.client.patch(self.url, {"notifications_active": True})
        self.assertDictEqual(response.data, test_payload)

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class TestUnsubscribe(APITestCase):
    fixtures = ["customuser.json", "settings.json"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("unsubscribe")

    def test_ok(self):
        user_1 = CustomUser.objects.get(pk=3)
        user_2 = CustomUser.objects.get(pk=4)

        # Test with user logged out
        response = self.client.post(
            self.url, {"uid": user_pk_to_url_str(user_1), "token": Token(user_1).value}
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        settings = Settings.objects.get(user=user_1)
        self.assertEqual(settings.notifications_active, False)
        settings.notifications_active = True
        settings.save()

        # Test with a different user logged in, as it must not matter which user
        #  is logged in
        self.client.login(username=user_1.email, password="test")
        response = self.client.post(
            self.url, {"uid": user_pk_to_url_str(user_2), "token": Token(user_2).value}
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Settings.objects.get(user=user_2).notifications_active, False)

    def test_invalid_token(self):
        user = CustomUser.objects.get(pk=1)
        response = self.client.post(
            self.url, {"uid": user_pk_to_url_str(user), "token": "invalid-token"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get(self):
        # Get is valid, but it requires the url to contain the uid and token, so
        #  this is a bad request. This case is handled by TestUnsubscribeRedirect.

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class TestUnsubscribeRedirect(APITestCase):
    fixtures = ["customuser.json"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("unsubscribe_redirect", args=[3, "test"])

    def test_ok(self):
        # Test not logged in
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

        # Test logged in
        self.client.login(username="test@test.at", password="test")
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

    def test_post(self):
        # Post is valid, but it requires the uid and token in the body, so this
        #  is an invalid request. This case is handled by TestUnsubscribe.

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
