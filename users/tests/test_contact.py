from django.core import mail
from django.test import override_settings
from django.urls import reverse
import json
from rest_framework import status
from rest_framework.test import APITestCase
from typing import Dict, List
from unittest.mock import patch

from users.models import CustomUser


SERVER_EMAIL = "no-reply@site.com"


@override_settings(SERVER_EMAIL=SERVER_EMAIL)
class TestContact(APITestCase):
    fixtures = ["user.json"]
    url: str
    user_email: str
    receiver_email: List[str]
    default_message: Dict[str, str]

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_contact")
        cls.user_email = "test@test.at"
        cls.receiver_email = CustomUser.objects.get(id=100).email
        cls.default_message = {
            "contact_form_id": "1",
            "name": "My Name",
            "subject": "My subject",
            "message": "My message",
        }

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username=self.user_email, password="test")

    def test_ok(self):
        # Test sending with all fields valid and filled
        response = self.client.post(self.url, self.default_message)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(len(mail.outbox), 1)

        received_mail = mail.outbox.pop()
        self.assertEqual(received_mail.from_email, SERVER_EMAIL)
        self.assertEqual(received_mail.to[0], self.receiver_email)
        self.assertEqual(
            received_mail.subject,
            f"Contact form [{self.default_message['contact_form_id']}]",
        )
        self.assertDictEqual(
            json.loads(received_mail.body),
            {
                "name": self.default_message["name"],
                "email": self.user_email,
                "subject": self.default_message["subject"],
                "message": self.default_message["message"],
            },
        )

        # Test sending with field name is empty string
        message = self.default_message.copy()
        message["name"] = ""
        response = self.client.post(self.url, message)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(len(mail.outbox), 1)

        received_mail = mail.outbox.pop()
        self.assertEqual(received_mail.from_email, SERVER_EMAIL)
        self.assertEqual(received_mail.to[0], self.receiver_email)
        self.assertEqual(
            received_mail.subject, f"Contact form [{message['contact_form_id']}]"
        )
        self.assertDictEqual(
            json.loads(received_mail.body),
            {
                "name": message["name"],
                "email": self.user_email,
                "subject": message["subject"],
                "message": message["message"],
            },
        )

    def test_fields_invalid(self):
        # Test sending with invalid field values in the request
        message = self.default_message.copy()
        message["contact_form_id"] = None
        response = self.client.post(self.url, message)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        for field in ["subject", "message"]:
            with self.subTest(field=field):
                message = self.default_message.copy()
                message[field] = ""
                response = self.client.post(self.url, message)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_fields_missing(self):
        # Test sending with mandatory fields missing in the request
        for field in ["contact_form_id", "name", "subject", "message"]:
            with self.subTest(field=field):
                message = self.default_message.copy()
                del message[field]
                response = self.client.post(self.url, message)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_not_logged_in(self):
        response = self.client.post(self.url, self.default_message)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_no_staff_configured(self):
        # Test behavior if not staff and as such no recipient is configured
        CustomUser.objects.filter(is_staff=True).update(is_staff=False)
        response = self.client.post(self.url, self.default_message)
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    def test_send_mail_failed(self):
        # Test behavior if not staff and as such no recipient is configured
        with patch("users.views.send_mail", return_value=0):
            response = self.client.post(self.url, self.default_message)
            self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

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
