from datetime import datetime
from allauth.account.forms import default_token_generator
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import MagicMock, patch

from users.models import CustomUser


class TestUserDetail(APITestCase):
    fixtures = ["emailaddress.json", "customuser.json"]
    url: str
    email: str

    @classmethod
    def setUpTestData(cls):
        cls.email = "test@test.at"
        cls.url = reverse("account_user_details")

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username=self.email, password="test")

    def test_get_ok(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(
            response.data,
            {
                "pk": 3,
                "username": "test",
                "email": self.email,
                "first_name": "",
                "last_name": "",
            },
        )

    def test_get_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_ok(self):
        response = self.client.put(
            self.url, {"username": "new", "first_name": "First", "last_name": "Last"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = CustomUser.objects.get(email=self.email)
        self.assertEqual(user.username, "new")
        self.assertEqual(user.first_name, "First")
        self.assertEqual(user.last_name, "Last")

    def test_put_not_logged_in(self):
        response = self.client.put(
            self.url, {"username": "new", "first_name": "First", "last_name": "Last"}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_no_change_admin_attributes(self):
        response = self.client.put(
            self.url,
            {
                "username": "new",
                "email": "new@test.at",
                "is_active": False,
                "is_authenticated": False,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = CustomUser.objects.get(email=self.email)
        self.assertEqual(user.username, "new")
        self.assertEqual(user.is_active, True)
        self.assertEqual(user.is_authenticated, True)
        self.assertEqual(user.is_staff, False)
        self.assertEqual(user.is_superuser, False)

    def test_patch_ok(self):
        response = self.client.patch(
            self.url, {"username": "new", "first_name": "First", "last_name": "Last"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = CustomUser.objects.get(email=self.email)
        self.assertEqual(user.username, "new")
        self.assertEqual(user.first_name, "First")
        self.assertEqual(user.last_name, "Last")

    def test_patch_not_logged_in(self):
        response = self.client.patch(
            self.url, {"username": "new", "first_name": "First", "last_name": "Last"}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_no_change_admin_attributes(self):
        response = self.client.patch(
            self.url,
            {
                "username": "new",
                "email": "new@test.at",
                "is_active": False,
                "is_authenticated": False,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = CustomUser.objects.get(email=self.email)
        self.assertEqual(user.username, "new")
        self.assertEqual(user.is_active, True)
        self.assertEqual(user.is_authenticated, True)
        self.assertEqual(user.is_staff, False)
        self.assertEqual(user.is_superuser, False)

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
