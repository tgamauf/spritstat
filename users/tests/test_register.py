from django.core import mail
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class TestRegister(APITestCase):
    fixtures = ["user.json"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_register")

    def test_ok(self):
        response = self.client.post(
            self.url,
            {
                "email": "new@test.at",
                "password1": "cdpyHEKZ0KiJmlR",
                "password2": "cdpyHEKZ0KiJmlR",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(mail.outbox)

    def test_user_exists(self):
        response = self.client.post(
            self.url, {"email": "test@test.at", "password": "cdpyHEKZ0KiJmlR"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bad_password(self):
        response = self.client.post(
            self.url, {"email": "new@test.at", "password": "test"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logged_in(self):
        self.client.login(username="test@test.at", password="test")
        response = self.client.post(
            self.url, {"email": "new@test.at", "password": "cdpyHEKZ0KiJmlR"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_field_missing(self):
        for data in [{"password": "cdpyHEKZ0KiJmlR"}, {"email": "new@test.com"}]:
            with self.subTest(data=data):
                response = self.client.post(self.url, data)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get(self):
        response = self.client.get(
            self.url, {"email": "test@test.at", "password": "cdpyHEKZ0KiJmlR"}
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(
            self.url, {"email": "test@test.at", "password": "cdpyHEKZ0KiJmlR"}
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(
            self.url, {"email": "test@test.at", "password": "cdpyHEKZ0KiJmlR"}
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
