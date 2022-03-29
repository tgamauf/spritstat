from django.core import mail
from django.test import override_settings
from django.urls import reverse
import re
from rest_framework import status
from rest_framework.test import APITestCase


@override_settings(ACCOUNT_EMAIL_CONFIRMATION_COOLDOWN=0)
class TestVerifyEmail(APITestCase):
    fixtures = ["user.json"]

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_verify_email")

    def setUp(self):
        # Signup to get the key from the confirmation email
        response = self.client.post(
            reverse("account_register"),
            {
                "email": "new@test.at",
                "password1": "cdpyHEKZ0KiJmlR",
                "password2": "cdpyHEKZ0KiJmlR",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        match = re.search(
            r"/confirm-email/(?P<key>[A-Za-z]{2,3}:[a-zA-Z\d]{6}:[\w-]{43})/",
            mail.outbox[0].body,
            re.ASCII,
        )
        self.assertIsNotNone(match, "Key wasn't found in email confirmation mail")
        self.key = match.group("key")

    def test_ok(self):
        response = self.client.post(self.url, {"key": self.key})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(response.cookies.get("sessionid").value)

    def test_logged_in(self):
        self.client.login(username="test@test.at", password="test")
        response = self.client.post(self.url, {"key": self.key})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(response.cookies.get("sessionid").value)

    def test_invalid_key(self):
        response = self.client.post(self.url, {"key": "invalid"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIsNone(response.cookies.get("sessionid"))

    def test_get(self):
        response = self.client.get(self.url, {"key": self.key})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(self.url, {"key": self.key})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url, {"key": self.key})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url, {"key": self.key})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
