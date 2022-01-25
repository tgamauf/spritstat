from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class TestLogout(APITestCase):
    fixtures = ["emailaddress.json", "customuser.json"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_logout")

    def test_ok(self):
        self.client.login(username="test2@test.at", password="test")
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("sessionid", response.cookies)
        self.assertFalse(response.cookies.get("sessionid").value)

    def test_not_logged_in(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("sessionid", response.cookies)

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
