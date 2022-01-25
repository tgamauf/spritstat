from django.core.exceptions import ValidationError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import CustomUser
from users.password_validation import ZxcvbnValidator


class TestPasswordZxcvbnValidator(APITestCase):
    validator: ZxcvbnValidator

    @classmethod
    def setUpTestData(cls):
        cls.validator = ZxcvbnValidator()

    def test_custom_validate(self):
        # Test password only
        valid, score, suggestions = self.validator.custom_validate("L@huL,URDD*V7^jG")
        self.assertTrue(valid)
        self.assertEqual(score, 4)
        self.assertFalse(suggestions)

        # Test password and email
        valid, score, suggestions = self.validator.custom_validate(
            "L@huL,URDD*V7^jG", "test@test.at"
        )
        self.assertTrue(valid)
        self.assertEqual(score, 4)
        self.assertFalse(suggestions)

        # Test password and tokens
        valid, score, suggestions = self.validator.custom_validate(
            "L@huL,URDD*V7^jG", tokens=["sprit", "stat"]
        )
        self.assertTrue(valid)
        self.assertEqual(score, 4)
        self.assertFalse(suggestions)

        # Test password email and tokens
        valid, score, suggestions = self.validator.custom_validate(
            "L@huL,URDD*V7^jG", "test@test.at", tokens=["sprit", "stat"]
        )
        self.assertTrue(valid)
        self.assertEqual(score, 4)
        self.assertFalse(suggestions)

        # Test bad password
        valid, score, suggestions = self.validator.custom_validate("testThis")
        self.assertFalse(valid)
        self.assertEqual(score, 1)
        self.assertListEqual(
            suggestions, ["Add another word or two. Uncommon words are better."]
        )

    def test___tokenize_email(self):
        tokens = self.validator._ZxcvbnValidator__tokenize_email(
            "test.name@sprit.thga.at"
        )
        self.assertSetEqual(set(tokens), {"test", "name", "sprit", "thga"})

    def test_validate(self):
        # Test password only
        self.validator.validate("L@huL,URDD*V7^jG")

        # Test password and user with email
        user = CustomUser.objects.create_user("test", "test@thga.at")
        self.validator.validate("L@huL,URDD*V7^jG", user)

        # Test password and user with email, first name and last name
        user.first_name = "First"
        user.last_name = "Last"
        self.validator.validate("L@huL,URDD*V7^jG", user)

        # Test bad password
        with self.assertRaisesMessage(
            ValidationError,
            f"Your password score is only 1, but needs to be "
            f"{self.validator.minimum_score}. Add another word or two. "
            f"Uncommon words are better.",
        ):
            self.validator.validate("testThis")

    def test_split_name(self):
        # Test tokenizing of names
        tokens = self.validator.split_name("First-Second Third")
        self.assertListEqual(tokens, ["First", "Second", "Third"])


class TestPasswordValidation(APITestCase):
    url: str

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("account_password_validate")

    def test_good_password(self):
        # Test a good password with and without email. The password doesn't
        #  contain any part of the email address.

        response = self.client.post(self.url, {"password": "cdpyHEKZ0KiJmlR"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(
            response.data, {"valid": True, "score": 4, "suggestions": []}
        )

        response = self.client.post(
            self.url, {"password": "cdpyHEKZ0KiJmlR", "email": "test@test.at"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(
            response.data, {"valid": True, "score": 4, "suggestions": []}
        )

        # Test with user logged in
        user = CustomUser.objects.create_user(
            username="test", email="test@thga.at", password="test"
        )
        self.client.login(username="test", password="test")
        response = self.client.post(self.url, {"password": "cdpyHEKZ0KiJmlR"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Test with user logged in with first/last name
        user.first_name = "First"
        user.last_name = "Last"
        user.save()
        response = self.client.post(self.url, {"password": "cdpyHEKZ0KiJmlR"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_bad_password(self):
        response = self.client.post(self.url, {"password": "password"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(
            response.data,
            {
                "valid": False,
                "score": 0,
                "suggestions": ["Add another word or two. Uncommon words are better."],
            },
        )

        response = self.client.post(
            self.url, {"password": "test5678", "email": "test@test.at"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(
            response.data,
            {
                "valid": False,
                "score": 1,
                "suggestions": ["Add another word or two. Uncommon words are better."],
            },
        )

    def test_no_password(self):
        response = self.client.post(self.url, {"password": ""})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_field_missing(self):
        response = self.client.post(self.url, {"email": ""})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email(self):
        # Ensure that incomplete email addresses do not break functionality.
        response = self.client.post(
            self.url, {"password": "cdpyHEKZ0KiJmlR", "email": "test@"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get(self):
        response = self.client.get(self.url, {"password": "cdpyHEKZ0KiJmlR"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_put(self):
        response = self.client.put(self.url, {"password": "cdpyHEKZ0KiJmlR"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url, {"password": "cdpyHEKZ0KiJmlR"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
