from dataclasses import dataclass
from datetime import datetime, timedelta

from allauth.account.signals import user_signed_up
from django.conf import settings
from django.contrib import auth
from django.contrib.sessions.backends.db import SessionStore
from django.contrib.sessions.models import Session
from django.core import mail
from django.db.models.signals import post_save, pre_delete
from django.test import TestCase
from django.utils import timezone
import json
from statistics import mean, median
from typing import List, Dict, Optional
from unittest.mock import MagicMock, patch

from django_q.models import Schedule
from urllib3 import PoolManager

from spritstat.models import Location, Price, Station
from spritstat import services
from spritstat.services.notification import (
    CREATE_LOCATION_REMINDER_DELAY_DAYS,
    LOCATION_REMINDER_DELAY_WEEKS,
    schedule_create_location_notification,
    schedule_location_reminder_notification,
)
from users.models import CustomUser


@dataclass
class MockAPIResponseEntry:
    id: int
    name: Optional[str]
    address: str
    postal_code: str
    city: str
    latitude: float
    longitude: float
    fuel_type: str
    price: Optional[float]

    def to_dict(self) -> Dict:
        data = {
            "id": self.id,
            "location": {
                "address": self.address,
                "postalCode": self.postal_code,
                "city": self.city,
                "latitude": self.latitude,
                "longitude": self.longitude,
            },
            "prices": [],
        }
        if self.name:
            data["name"] = self.name

        if self.price:
            data["prices"].append({"fuelType": self.fuel_type, "amount": self.price})

        return data


class MockAPIResponse:
    def __init__(self, status: int, data: List[MockAPIResponseEntry]) -> None:
        self.status = status
        self.entries = data

    def as_mock(self) -> MagicMock:
        response = MagicMock()
        response.status = self.status
        response.data = json.dumps(
            [e.to_dict() for e in self.entries], ensure_ascii=False
        ).encode("UTF-8")

        return response


class MockPriceStatistics(services.price.PriceStatistics):
    def set_min_amount(self, value):
        object.__setattr__(self, "min_amount", value)

    def set_max_amount(self, value):
        object.__setattr__(self, "max_amount", value)

    def set_average_amount(self, value):
        object.__setattr__(self, "average_amount", value)

    def set_median_amount(self, value):
        object.__setattr__(self, "median_amount", value)


class TestRequestLocationPrices(TestCase):
    fixtures = ["user.json", "test_services.json"]

    def setUp(self):
        self.default_mock_response_entry = MockAPIResponseEntry(
            id=1000,
            name="Station 4",
            address="Address 4",
            postal_code="PLZ4",
            city="City 4",
            latitude=0.5000000,
            longitude=0.6000000,
            fuel_type="GAS",
            price=0.1,
        )
        last_price = Price.objects.last()
        self.default_test_price = {
            "location": last_price.location,
            "stations": list(last_price.stations.all()),
            "price_statistics": MockPriceStatistics(
                min_amount=last_price.min_amount,
                max_amount=last_price.max_amount,
                average_amount=last_price.average_amount,
                median_amount=last_price.median_amount,
            ),
        }

    def test_request_location_prices__address_diesel(self):
        # Test location type named and fuel type DIE. This corresponds to a
        #  real response with 5 entries, where 3 have an equal price, one has a
        #  higher price and one without price.
        # Of the 3 equal prices the first station does already exist, while the
        #  second and third don't, so only two stations are added.
        # We do a full check of all the price statistics here, which won't be
        #  necessary in any of the following tests.

        check_location_id = 1
        check_location = Location.objects.get(pk=check_location_id)

        # Ensure that the fuel type in the fixture is indeed diesel
        self.assertEqual(check_location.fuel_type, "DIE")

        # Ensure that the user corresponding to the location has stations and
        #  prices
        self.assertGreater(Station.objects.filter(users=check_location.user).count(), 0)
        self.assertGreater(Price.objects.filter(location=check_location).count(), 0)

        check_min_price = self.default_mock_response_entry.price
        check_max_price = 0.5
        existing_station = Station.objects.get(pk=1)
        check_response_entry_1 = MockAPIResponseEntry(
            id=existing_station.id,
            name=existing_station.name,
            address=existing_station.address,
            postal_code=existing_station.postal_code,
            city=existing_station.city,
            latitude=float(existing_station.latitude),
            longitude=float(existing_station.longitude),
            fuel_type=check_location.fuel_type,
            price=check_min_price,
        )
        check_response_entry_2 = self.default_mock_response_entry
        check_response_entry_2.fuel_type = check_location.fuel_type
        check_response_entry_3 = MockAPIResponseEntry(
            id=2000,
            name="Station 2000",
            address="Address 2000",
            postal_code="2000",
            city="City 2000",
            latitude=2.0000000,
            longitude=2.0000000,
            fuel_type=check_location.fuel_type,
            price=check_min_price,
        )
        check_response_entry_4 = MockAPIResponseEntry(
            id=3000,
            name="Station 3000",
            address="Address 3000",
            postal_code="3000",
            city="City 3000",
            latitude=3.0000000,
            longitude=3.0000000,
            fuel_type=check_location.fuel_type,
            price=check_max_price,
        )
        check_response_entry_5 = MockAPIResponseEntry(
            id=4000,
            name=None,
            address="Address 4000",
            postal_code="4000",
            city="City 4000",
            latitude=4.0000000,
            longitude=4.0000000,
            fuel_type=check_location.fuel_type,
            price=None,
        )
        check_data = [
            check_response_entry_1,
            check_response_entry_2,
            check_response_entry_3,
            check_response_entry_4,
            check_response_entry_5,
        ]
        check_prices = [e.price for e in check_data if e.price is not None]
        check_station_count = Station.objects.count() + 2
        check_price_count = Price.objects.count() + 1
        mock_response = MockAPIResponse(status=200, data=check_data).as_mock()
        mock_datetime = Price.objects.filter(location=check_location_id).latest(
            "datetime"
        ).datetime + timedelta(hours=1)
        with patch.object(
            PoolManager, "request", return_value=mock_response
        ) as mock_method:
            with patch("django.utils.timezone.now", return_value=mock_datetime):
                services.request_location_prices(check_location_id)

        mock_method.assert_called_once_with(
            "GET",
            "https://api.e-control.at/sprit/1.0/search/gas-stations/by-address?"
            f"latitude={check_location.latitude:f}"
            f"&longitude={check_location.longitude:f}"
            f"&fuelType={check_location.fuel_type}",
        )
        self.assertEqual(Station.objects.count(), check_station_count)
        last_stations = list(Station.objects.all())[-2:]
        self.assertListEqual(
            [s.id for s in last_stations],
            [check_response_entry_2.id, check_response_entry_3.id],
        )
        self.assertListEqual(
            [u for s in last_stations for u in s.users.all()], [check_location.user] * 2
        )
        self.assertEqual(Price.objects.count(), check_price_count)
        result_price = Price.objects.last()
        self.assertEqual(result_price.location.id, check_location_id)
        self.assertEqual(result_price.datetime, mock_datetime)
        self.assertSetEqual(
            set([s.id for s in list(result_price.stations.all())]),
            {
                check_response_entry_1.id,
                check_response_entry_2.id,
                check_response_entry_3.id,
            },
        )
        self.assertEqual(result_price.min_amount, check_min_price)
        self.assertEqual(result_price.max_amount, check_max_price)
        self.assertEqual(result_price.average_amount, mean(check_prices))
        self.assertEqual(result_price.median_amount, median(check_prices))

    def test_request_location_prices__region_super(self):
        # Test location type region, fuel type SUP, and station already exists

        check_location_id = 2
        check_location = Location.objects.get(pk=check_location_id)

        # Ensure that the fuel type in the fixture is indeed super
        self.assertEqual(check_location.fuel_type, "SUP")

        # Ensure that the user corresponding to the location has stations and
        #  prices
        self.assertGreater(Station.objects.filter(users=check_location.user).count(), 0)
        self.assertGreater(Price.objects.filter(location=check_location).count(), 0)

        existing_station = Station.objects.get(pk=2)
        check_response_entry = MockAPIResponseEntry(
            id=existing_station.id,
            name=existing_station.name,
            address=existing_station.address,
            postal_code=existing_station.postal_code,
            city=existing_station.city,
            latitude=float(existing_station.latitude),
            longitude=float(existing_station.longitude),
            fuel_type=check_location.fuel_type,
            price=0.1,
        )

        check_station_count = Station.objects.count()
        check_price_count = Price.objects.count() + 1
        mock_response = MockAPIResponse(
            status=200, data=[check_response_entry]
        ).as_mock()
        with patch.object(
            PoolManager, "request", return_value=mock_response
        ) as mock_method:
            services.request_location_prices(check_location_id)

        mock_method.assert_called_once_with(
            "GET",
            "https://api.e-control.at/sprit/1.0/search/gas-stations/by-region?"
            f"code={check_location.region_code}&type={check_location.region_type}"
            f"&fuelType={check_location.fuel_type}",
        )
        self.assertEqual(Station.objects.count(), check_station_count)
        self.assertEqual(Price.objects.count(), check_price_count)
        result_price = Price.objects.last()
        self.assertEqual(result_price.location.id, check_location_id)
        self.assertEqual(result_price.stations.count(), 1)

    def test_request_location_prices__address_gas(self):
        # Test location type address of different user, no station or price
        #  exists for user, and fuel type GAS

        check_location_id = 3
        check_location = Location.objects.get(pk=check_location_id)

        # Ensure that the fuel type in the fixture is indeed gas
        self.assertEqual(check_location.fuel_type, "GAS")
        self.assertEqual(
            self.default_mock_response_entry.fuel_type, check_location.fuel_type
        )

        # Ensure that no station or price exist for this location
        self.assertFalse(Station.objects.filter(users=check_location.user).count())
        self.assertFalse(Price.objects.filter(location=check_location).count())

        check_station_count = Station.objects.count() + 1
        check_price_count = Price.objects.count() + 1
        mock_response = MockAPIResponse(
            status=200, data=[self.default_mock_response_entry]
        ).as_mock()
        with patch.object(PoolManager, "request", return_value=mock_response):
            services.request_location_prices(check_location_id)

        self.assertEqual(Station.objects.count(), check_station_count)
        self.assertEqual(Price.objects.count(), check_price_count)
        result_price = Price.objects.last()
        self.assertEqual(result_price.location.id, check_location_id)
        self.assertEqual(result_price.stations.count(), 1)

    def test_request_location_prices__station_exists_other_user(self):
        # Test adding a price for a station that has been created for another
        #  user.

        check_location_id = 3  # this belongs to user 3
        check_station_id = 10000  # this is a station id that must not exist
        user_existing_station = Location.objects.get(pk=1).user
        user_test = Location.objects.get(pk=check_location_id).user

        self.assertNotEqual(user_existing_station, user_test)
        self.assertFalse(Station.objects.filter(id=check_station_id).exists())

        mock_response_entry = self.default_mock_response_entry
        mock_response_entry.id = check_station_id
        station = Station.objects.create(
            id=mock_response_entry.id,
            name=mock_response_entry.name,
            address=mock_response_entry.address,
            postal_code=mock_response_entry.postal_code,
            city=mock_response_entry.city,
            latitude=mock_response_entry.latitude,
            longitude=mock_response_entry.longitude,
        )
        station.users.add(user_existing_station)

        check_station_count = Station.objects.count()
        check_price_count = Price.objects.count() + 1

        mock_response = MockAPIResponse(
            status=200, data=[mock_response_entry]
        ).as_mock()
        with patch.object(PoolManager, "request", return_value=mock_response):
            services.request_location_prices(check_location_id)

        self.assertEqual(Station.objects.count(), check_station_count)
        self.assertEqual(Price.objects.count(), check_price_count)

        self.assertListEqual(
            list(Station.objects.get(id=check_station_id).users.all()),
            [user_existing_station, user_test],
        )

    def test_request_location_prices__no_prices(self):
        check_station_count = Station.objects.count()
        check_price_count = Price.objects.count()
        mock_response = MockAPIResponse(status=200, data=[]).as_mock()
        with patch.object(PoolManager, "request", return_value=mock_response):
            services.request_location_prices(3)
        self.assertEqual(Station.objects.count(), check_station_count)
        self.assertEqual(Price.objects.count(), check_price_count)


class TestClearExpiredSessions(TestCase):
    fixtures = ["user.json"]

    @staticmethod
    def create_session(expiry: int) -> None:
        user = CustomUser.objects.first()

        session = SessionStore(None)
        session.clear()
        session.cycle_key()
        session[auth.SESSION_KEY] = user._meta.pk.value_to_string(user)
        session[auth.BACKEND_SESSION_KEY] = "django.contrib.auth.backends.ModelBackend"
        session[auth.HASH_SESSION_KEY] = user.get_session_auth_hash()
        session.set_expiry(expiry)
        session.save()

    def test_clear_sessions(self):
        # Setup sessions (non-expired, expired, no expiry date)
        self.create_session(settings.SESSION_COOKIE_AGE)
        self.create_session(1)
        self.create_session(0)

        # Ensure that the session with expiry "SESSION_COOKIE_AGE" (seconds)
        #  isn't expired, but the sessions with expiry 1 (seconds) is for sure.
        # The session with expiry 0 will also expire after SESSION_COOKIE_AGE.
        mock_now = timezone.now() + timedelta(seconds=settings.SESSION_COOKIE_AGE // 2)
        with patch("django.utils.timezone.now", return_value=mock_now):
            services.clear_expired_sessions()
        self.assertEqual(Session.objects.count(), 2)

        # All cookies should expire now
        mock_now = timezone.now() + timedelta(seconds=settings.SESSION_COOKIE_AGE + 1)
        with patch("django.utils.timezone.now", return_value=mock_now):
            services.clear_expired_sessions()
        self.assertEqual(Session.objects.count(), 0)


class TestNotifications(TestCase):
    fixtures = ["user.json", "settings.json", "schedule.json", "location.json"]

    @classmethod
    def setUpTestData(cls):
        cls.user = CustomUser.objects.get(pk=2)

    def test_schedule_create_location_notification(self):
        mock_now = datetime.strptime("2022-02-02T22:53+0000", "%Y-%m-%dT%H:%M%z")
        datetime_mock = MagicMock(autospec=datetime)
        datetime_mock.now.return_value = mock_now
        with patch("spritstat.services.notification.timezone", new=datetime_mock):
            user_signed_up.send(self.__class__, request=None, user=self.user)
        self.user.refresh_from_db()
        next_notification = self.user.next_notification
        self.assertEqual(
            next_notification.func,
            "spritstat.services.send_create_location_notification",
        )
        self.assertEqual(eval(next_notification.args)[0], self.user.id)
        self.assertEqual(next_notification.schedule_type, Schedule.ONCE)
        self.assertEqual(
            next_notification.next_run,
            mock_now + timedelta(days=CREATE_LOCATION_REMINDER_DELAY_DAYS),
        )

    def test_send_create_location_notification(self):
        # Test if notification is sent
        services.send_create_location_notification(self.user.id)
        message = mail.outbox[0]
        self.assertEqual(message.to[0], self.user.email)
        self.assertEqual(message.from_email, settings.DEFAULT_FROM_EMAIL)
        self.assertEqual(message.alternatives[0][1], "text/html")

    def test_send_location_notification_user_inactive(self):
        # Test if notification is not sent if the user is inactive
        self.user.is_active = False
        self.user.save()
        services.send_create_location_notification(self.user.id)
        self.assertEqual(len(mail.outbox), 0)

    def test_schedule_location_reminder_notification(self):
        location = Location.objects.get(id=3)
        user = location.user
        mock_now = datetime.strptime("2022-02-02T22:53+0000", "%Y-%m-%dT%H:%M%z")
        datetime_mock = MagicMock(autospec=datetime)
        datetime_mock.now.return_value = mock_now

        with patch("spritstat.services.notification.timezone", new=datetime_mock):
            post_save.send(Location, instance=location, created=True, raw=False)
        user.refresh_from_db()
        next_notification = user.next_notification
        self.assertEqual(
            next_notification.func,
            "spritstat.services.send_location_reminder_notification",
        )
        self.assertEqual(eval(next_notification.args)[0], location.id)
        self.assertEqual(next_notification.schedule_type, Schedule.ONCE)
        self.assertEqual(
            next_notification.next_run,
            mock_now + timedelta(weeks=LOCATION_REMINDER_DELAY_WEEKS),
        )

        # Test if save signal is called with created=False
        check_next_notification_id = next_notification.id
        post_save.send(Location, instance=location, created=False, raw=False)
        user.refresh_from_db()
        self.assertEqual(user.next_notification_id, check_next_notification_id)

        # Test if save signal is called with raw=True
        check_next_notification_id = next_notification.id
        post_save.send(Location, instance=location, created=False, raw=False)
        user.refresh_from_db()
        self.assertEqual(user.next_notification_id, check_next_notification_id)

        # Ensure that no notification is created if the user has notifications
        #  disabled.
        location.refresh_from_db()
        user.settings.notifications_active = False
        user.settings.save()
        user.next_notification.delete()
        post_save.send(Location, instance=location, created=True, raw=False)
        user.refresh_from_db()
        self.assertIsNone(user.next_notification_id)

    def test_delete_location_reminder_notification(self):
        location = Location.objects.get(id=3)
        user = location.user
        pre_delete.send(Location, instance=location)
        user.refresh_from_db()
        self.assertIsNone(user.next_notification_id)

        # Test if no notification is scheduled
        location.refresh_from_db()
        pre_delete.send(Location, instance=location)

    def test_send_location_reminder_notification(self):
        # Test if notification is sent
        location = Location.objects.get(id=3)
        services.send_location_reminder_notification(location.id)
        message = mail.outbox[0]
        self.assertEqual(message.to[0], location.user.email)
        self.assertEqual(message.from_email, settings.DEFAULT_FROM_EMAIL)
        self.assertEqual(message.alternatives[0][1], "text/html")

    def test_send_location_reminder_notification_skip_due_to_activity(self):
        # Test if notification isn't sent if the user was active since the
        #  notification was scheduled
        location = Location.objects.get(id=3)
        location.user.last_activity = timezone.now() - timedelta(
            weeks=LOCATION_REMINDER_DELAY_WEEKS - 1
        )
        location.user.save()
        services.send_location_reminder_notification(location.id)
        self.assertEqual(len(mail.outbox), 0)
