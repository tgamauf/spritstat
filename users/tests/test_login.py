from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from allauth.account.models import EmailAddress


class TestLogin(APITestCase):
    fixtures = ["emailaddress.json", "customuser.json"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_login")

    def test_ok(self):
        response = self.client.post(
            self.url, {"email": "test@test.at", "password": "test"}
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertIn("sessionid", response.cookies)
        self.assertTrue(response.cookies.get("sessionid").value)
        self.assertFalse(response.cookies["sessionid"]["max-age"])

    def test_ok_dont_remember_login(self):
        response = self.client.post(
            self.url, {"email": "test@test.at", "password": "test", "remember": False}
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertIn("sessionid", response.cookies)
        self.assertTrue(response.cookies.get("sessionid").value)
        self.assertFalse(response.cookies["sessionid"]["max-age"])

    def test_ok_rembember_login(self):
        response = self.client.post(
            self.url, {"email": "test@test.at", "password": "test", "remember": True}
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertIn("sessionid", response.cookies)
        self.assertTrue(response.cookies.get("sessionid").value)
        self.assertEqual(
            response.cookies["sessionid"]["max-age"], settings.SESSION_COOKIE_AGE
        )

    def test_email_not_verified(self):
        email = "test2@test.at"
        email_obj = EmailAddress.objects.get(email=email)
        email_obj.verified = False
        email_obj.save()
        response = self.client.post(self.url, {"email": email, "password": "test"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_email_doesnt_exist(self):
        response = self.client.post(
            self.url, {"email": "missing@test.at", "password": "test"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_field_missing(self):
        for data in [{"password": "test"}, {"email": "email@test.com"}]:
            with self.subTest(data=data):
                response = self.client.post(self.url, data)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get(self):
        response = self.client.get(
            self.url, {"email": "test@test.at", "password": "test"}
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(
            self.url, {"email": "test@test.at", "password": "test"}
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(
            self.url, {"email": "test@test.at", "password": "test"}
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
