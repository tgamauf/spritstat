from datetime import datetime
from allauth.account.forms import default_token_generator
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import MagicMock, patch

from users.models import CustomUser


class TestPasswordChange(APITestCase):
    fixtures = ["emailaddress.json", "customuser.json"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_password_change")

        cls.current_password = "test"

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username="test@test.at", password=self.current_password)

    def test_ok(self):
        response = self.client.post(
            self.url,
            {
                "old_password": self.current_password,
                "new_password1": "GoodNewPassword",
                "new_password2": "GoodNewPassword",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_not_logged_in(self):
        response = self.client.post(
            self.url,
            {
                "new_password1": "GoodNewPassword",
                "new_password2": "GoodNewPassword",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_bad_password(self):
        response = self.client.post(
            self.url,
            {
                "new_password1": "test",
                "new_password2": "test",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put(self):
        response = self.client.put(
            self.url,
            {
                "new_password1": "test",
                "new_password2": "test",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(
            self.url,
            {
                "new_password1": "test",
                "new_password2": "test",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
