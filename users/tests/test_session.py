from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import CustomUser


class TestSession(APITestCase):
    fixtures = ["emailaddress.json", "customuser.json"]
    url: str
    email: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_session")
        cls.email = "test@test.at"

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username=self.email, password="test")

    def test_ok(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(
            response.data,
            {"isAuthenticated": True, "hasBetaAccess": False, "email": self.email},
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
