import datetime

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from users.models import CustomUser


class TestSession(APITestCase):
    fixtures = ["user.json"]
    url: str
    email: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_session")
        cls.email = "test2@test.at"

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username=self.email, password="test")

    def test_ok(self):
        mock_datetime = datetime.datetime.strptime(
            "2022-02-02T22:53+0000", "%Y-%m-%dT%H:%M%z"
        )
        with patch("django.utils.timezone.now", return_value=mock_datetime):
            response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(
            response.data,
            {"isAuthenticated": True, "hasBetaAccess": False, "email": self.email},
        )
        self.assertEqual(
            CustomUser.objects.get(email=self.email).last_activity, mock_datetime
        )

        # Test beta access
        user = CustomUser.objects.get(email=self.email)
        user.has_beta_access = True
        user.save()
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(
            response.data,
            {"isAuthenticated": True, "hasBetaAccess": True, "email": self.email},
        )

    def test_not_logged_in(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.data, {"isAuthenticated": False})

    def test_get(self):
        response = self.client.get(self.url)
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
