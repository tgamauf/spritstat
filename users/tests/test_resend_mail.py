from django.core import mail
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class TestResendMail(APITestCase):
    fixtures = ["emailaddress.json", "customuser.json"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_resend_email")

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

    def test_ok(self):
        response = self.client.post(self.url, {"email": "new@test.at"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(mail.outbox)

    def test_get(self):
        response = self.client.get(self.url, {"email": "new@test.at"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(self.url, {"email": "new@test.at"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url, {"email": "new@test.at"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
