from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import CustomUser


class TestDeleteUser(APITestCase):
    fixtures = ["emailaddress.json", "customuser.json"]
    url: str
    user: CustomUser

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_delete")
        cls.user = CustomUser.objects.get(email="test@test.at")

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username=self.user.email, password="test")

    def test_ok(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        with self.assertRaisesMessage(
            CustomUser.DoesNotExist, "CustomUser matching query does not exist."
        ):
            CustomUser.objects.get(id=self.user.id)

    def test_not_logged_in(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Let's just try to get the user, which would fail if it is in fact
        #  deleted.
        CustomUser.objects.get(id=self.user.id)

    def test_get(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
