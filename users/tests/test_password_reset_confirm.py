from datetime import datetime
from allauth.account.forms import default_token_generator
from allauth.account.utils import user_pk_to_url_str
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import MagicMock, patch

from users.models import CustomUser


class TestPasswordResetConfirm(APITestCase):
    fixtures = ["user.json"]
    url: str
    user: CustomUser
    uid: str
    token: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_password_reset_confirm")
        cls.user = CustomUser.objects.get(id=300)  # test@test.at
        cls.uid = user_pk_to_url_str(cls.user)
        cls.token = default_token_generator.make_token(cls.user)

    def test_ok(self):
        response = self.client.post(
            self.url,
            {
                "uid": self.uid,
                "token": self.token,
                "new_password1": "GoodNewPassword",
                "new_password2": "GoodNewPassword",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_token(self):
        response = self.client.post(
            self.url,
            {
                "uid": self.uid,
                "token": "az3wwi-invalid",
                "new_password1": "GoodNewPassword",
                "new_password2": "GoodNewPassword",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_user(self):
        response = self.client.post(
            self.url,
            {
                "uid": 99,  # This user doesn't exist
                "token": self.token,
                "new_password1": "GoodNewPassword",
                "new_password2": "GoodNewPassword",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_expired_token(self):
        # Generate a reset token that has expired more than 3 days ago
        mock_datetime = MagicMock()
        mock_datetime.return_value = datetime(2001, 1, 1)
        mock_datetime.combine = datetime.combine
        mock_datetime.now.return_value = datetime.strptime("2021-12-01", "%Y-%m-%d")
        with patch("django.contrib.auth.tokens.datetime", mock_datetime):
            token = default_token_generator.make_token(self.user)
        response = self.client.post(
            self.url,
            {
                "uid": self.uid,
                "token": token,
                "new_password1": "GoodNewPassword",
                "new_password2": "GoodNewPassword",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bad_password(self):
        response = self.client.post(
            self.url,
            {
                "uid": self.uid,
                "token": self.token,
                "new_password1": "test",
                "new_password2": "test",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_redirect(self):
        response = self.client.get(
            reverse("password_reset_confirm", args=[self.uid, self.token])
        )
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

    def test_put(self):
        response = self.client.put(self.url, {"email": "test@thga.at"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url, {"email": "test@thga.at"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
