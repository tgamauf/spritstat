from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from users.models import CustomUser, Locales


class TestSession(APITestCase):
    fixtures = ["user.json"]
    url: str
    user: CustomUser

    @classmethod
    def setUpTestData(cls):
        cls.url = reverse("locale")
        cls.user = CustomUser.objects.get(id=200)

    def setUp(self):
        if not self.id().endswith("_not_logged_in"):
            self.client.login(username=self.user.email, password="test")

    def test_set_locale_no_locale_not_logged_in(self):
        response = self.client.post(self.url, {"locale": Locales.EN.value})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        locale_cookie = response.cookies.get(settings.LANGUAGE_COOKIE_NAME)
        self.assertIsNotNone(locale_cookie)
        self.assertEqual(locale_cookie.value, Locales.EN.value)
        self.user.refresh_from_db()
        self.assertIsNone(self.user.locale)

    def test_set_locale_no_locale(self):
        response = self.client.post(self.url, {"locale": Locales.EN.value})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        locale_cookie = response.cookies.get(settings.LANGUAGE_COOKIE_NAME)
        self.assertIsNotNone(locale_cookie)
        self.assertEqual(locale_cookie.value, Locales.EN.value)
        self.user.refresh_from_db()
        self.assertEqual(self.user.locale, Locales.EN.value)

    def test_set_locale_same_locale(self):
        self.user.locale = Locales.EN
        self.user.save()

        # Do a login here as the test uses a deep copy of the user object instead of the
        #  real object itself
        self.client.login(username=self.user.email, password="test")

        response = self.client.post(self.url, {"locale": Locales.EN.value})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        locale_cookie = response.cookies.get(settings.LANGUAGE_COOKIE_NAME)
        self.assertIsNotNone(locale_cookie)
        self.assertEqual(locale_cookie.value, Locales.EN.value)
        self.user.refresh_from_db()
        self.assertEqual(self.user.locale, Locales.EN.value)

    def test_set_locale_different_locale(self):
        self.user.locale = Locales.EN
        self.user.save()

        # Do a login here as the test uses a deep copy of the user object instead of the
        #  real object itself
        self.client.login(username=self.user.email, password="test")

        response = self.client.post(self.url, {"locale": Locales.DE.value})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        locale_cookie = response.cookies.get(settings.LANGUAGE_COOKIE_NAME)
        self.assertIsNotNone(locale_cookie)
        self.assertEqual(locale_cookie.value, Locales.DE.value)
        self.user.refresh_from_db()
        self.assertEqual(self.user.locale, Locales.DE.value)

    def test_register_locale(self):
        self.client.cookies.load({settings.LANGUAGE_COOKIE_NAME: Locales.EN.value})
        response = self.client.post(
            reverse("account_register"),
            {
                "email": "new@test.at",
                "password1": "cdpyHEKZ0KiJmlR",
                "password2": "cdpyHEKZ0KiJmlR",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomUser.objects.last().locale, Locales.EN.value)

    def test_login_locale(self):
        self.client.cookies.load({settings.LANGUAGE_COOKIE_NAME: Locales.EN.value})
        response = self.client.post(
            reverse("account_login"), {"email": self.user.email, "password": "test"}
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CustomUser.objects.last().locale, Locales.EN.value)

    def test_get_not_logged_in(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["locale"])

    def test_get_no_locale(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["locale"])

    def test_get(self):
        self.user.locale = Locales.EN
        self.user.save()

        # Do a login here as the test uses a deep copy of the user object instead of the
        #  real object itself
        self.client.login(username=self.user.email, password="test")

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["locale"], Locales.EN.value)

    def test_put(self):
        response = self.client.put(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch(self):
        response = self.client.patch(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
