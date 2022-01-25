from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class TestConfirmEmail(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_confirm_email", kwargs={"key": "key"})

    def test_get_redirect(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

    def test_post(self):
        response = self.client.post(self.url)
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
