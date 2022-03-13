from datetime import datetime
from allauth.account.forms import default_token_generator
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import MagicMock, patch

from users.models import CustomUser


class TestUserDetail(APITestCase):
    fixtures = ["user.json"]
    url: str
    user: CustomUser

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_user_details")
        cls.user = CustomUser.objects.get(pk=300)

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username=self.user.email, password="test")

    @staticmethod
    def convert_id_to_pk(key: str) -> str:
        if key == "id":
            return "pk"
        return key

    def test_get_ok(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        check_dict = {
            self.convert_id_to_pk(key): value
            for key, value in self.user.__dict__.items()
            if key in ["id", "username", "email", "first_name", "last_name"]
        }
        self.assertDictEqual(response.data, check_dict)

    def test_get_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_put_ok(self):
        response = self.client.put(
            self.url, {"username": "new", "first_name": "First", "last_name": "Last"}
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.username, "new")
        self.assertEqual(self.user.first_name, "First")
        self.assertEqual(self.user.last_name, "Last")

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
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.username, "new")
        self.assertEqual(self.user.is_active, True)
        self.assertEqual(self.user.is_authenticated, True)
        self.assertEqual(self.user.is_staff, False)
        self.assertEqual(self.user.is_superuser, False)

    def test_patch_ok(self):
        response = self.client.patch(
            self.url, {"username": "new", "first_name": "First", "last_name": "Last"}
        )
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.username, "new")
        self.assertEqual(self.user.first_name, "First")
        self.assertEqual(self.user.last_name, "Last")

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
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, "new")
        self.assertEqual(self.user.is_active, True)
        self.assertEqual(self.user.is_authenticated, True)
        self.assertEqual(self.user.is_staff, False)
        self.assertEqual(self.user.is_superuser, False)

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
