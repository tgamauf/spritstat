from django.conf import settings
from django.core import mail
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


FROM_EMAIL = "no-reply@spritstat"


@override_settings(DEFAULT_FROM_EMAIL=FROM_EMAIL)
class TestPasswordReset(APITestCase):
    fixtures = ["user.json"]
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_password_reset")

    def test_ok(self):
        # Test if the password reset mail is sent for an existing user and if
        #  the mail contains an html alternative. Also check if the sender and
        #  receiver email addresses are set correctly and if the subject is as
        #  we have it defined.

        check_email_address = "test@test.at"
        response = self.client.post(self.url, {"email": check_email_address})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

        sent_mail = mail.outbox[0]
        self.assertEqual(len(sent_mail.alternatives), 1)
        self.assertEqual(sent_mail.from_email, FROM_EMAIL)
        self.assertEqual(sent_mail.to[0], check_email_address)
        self.assertEqual(
            sent_mail.subject,
            f"{settings.ACCOUNT_EMAIL_SUBJECT_PREFIX}Password-Reset E-mail",
        )

    def test_send_invalid_email(self):
        # Test if HTTP 200 is returned even for invalid email addresses to guard
        #  against anyone fishing for email addresses that are signed up. Also
        #  check that no email is sent to an email address that isn't signed up.

        check_email_address = "invalid@test.at"
        response = self.client.post(self.url, {"email": check_email_address})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(len(mail.outbox))

    def test_get(self):
        response = self.client.get(self.url, {"email": "test@thga.at"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(self.url, {"email": "test@thga.at"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url, {"email": "test@thga.at"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
