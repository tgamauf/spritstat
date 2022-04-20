from django.db.utils import IntegrityError
from django.test import TestCase
from django.utils import timezone
import pytz
from unittest.mock import patch

from user_visit.models import UserVisit

from user_statistics.models import DailyActiveUsers, MonthlyActiveUsers
from user_statistics.services import (
    calculate_daily_active_users,
    calculate_monthly_active_users,
    delete_past_user_visits,
)


class TestDailyActiveUsers(TestCase):
    fixtures = ["user.json"]

    def test_multiple_visits_of_same_user(self):
        now = timezone.datetime(2022, 4, 19, 10, 0)
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 15),
            session_key="session_1",
            hash="hash_1",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 18, 10, 0),
            session_key="session_2",
            hash="hash_2",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 18, 23, 59, 59),
            session_key="session_3",
            hash="hash_3",
        )

        with patch("django.utils.timezone.now", return_value=now):
            calculate_daily_active_users()

        self.assertEqual(DailyActiveUsers.objects.count(), 1)

        entry = DailyActiveUsers.objects.last()
        self.assertEqual(entry.date, timezone.datetime(2022, 4, 18).date())
        self.assertEqual(entry.count, 1)
        self.assertEqual(entry.fraction, 0.25)

    def test_multiple_visits_of_different_users(self):
        now = timezone.datetime(2022, 4, 19, 10, 0)
        UserVisit.objects.create(
            user_id=100,
            timestamp=timezone.datetime(2022, 4, 10),
            session_key="session_1",
            hash="hash_1",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 18, 10, 0),
            session_key="session_2",
            hash="hash_2",
        )
        UserVisit.objects.create(
            user_id=300,
            timestamp=timezone.datetime(2022, 4, 18, 12, 10),
            session_key="session_3",
            hash="hash_3",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 18, 15, 10),
            session_key="session_4",
            hash="hash_4",
        )
        with patch("django.utils.timezone.now", return_value=now):
            calculate_daily_active_users()

        self.assertEqual(DailyActiveUsers.objects.count(), 1)

        entry = DailyActiveUsers.objects.last()
        self.assertEqual(entry.date, timezone.datetime(2022, 4, 18).date())
        self.assertEqual(entry.count, 2)
        self.assertEqual(entry.fraction, 0.5)

    def test_duplicate_calculation(self):
        now = timezone.datetime(2022, 4, 19, 10, 0)
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 15),
            session_key="session_1",
            hash="hash_1",
        )

        with patch("django.utils.timezone.now", return_value=now):
            calculate_daily_active_users()

            with self.assertRaises(IntegrityError):
                calculate_daily_active_users()


class TestMonthlyActiveUsers(TestCase):
    fixtures = ["user.json"]

    def test_multiple_visits_of_same_user(self):
        now = timezone.datetime(2022, 5, 3, 22, 0)
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 3, 18),
            session_key="session_1",
            hash="hash_1",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 1),
            session_key="session_2",
            hash="hash_2",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 10, 12),
            session_key="session_3",
            hash="hash_3",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 10, 15),
            session_key="session_4",
            hash="hash_4",
        )

        with patch("django.utils.timezone.now", return_value=now):
            calculate_monthly_active_users()

        self.assertEqual(MonthlyActiveUsers.objects.count(), 1)

        entry = MonthlyActiveUsers.objects.last()
        self.assertEqual(entry.date, timezone.datetime(2022, 4, 30).date())
        self.assertEqual(entry.count, 1)
        self.assertEqual(entry.fraction, 0.25)

    def test_multiple_visits_of_different_users(self):
        now = timezone.datetime(2022, 5, 3, 22, 0)
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 3, 18),
            session_key="session_1",
            hash="hash_1",
        )
        UserVisit.objects.create(
            user_id=300,
            timestamp=timezone.datetime(2022, 3, 22),
            session_key="session_2",
            hash="hash_2",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 1),
            session_key="session_3",
            hash="hash_3",
        )
        UserVisit.objects.create(
            user_id=300,
            timestamp=timezone.datetime(2022, 4, 2),
            session_key="session_4",
            hash="hash_4",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 10, 10),
            session_key="session_5",
            hash="hash_5",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 10, 23),
            session_key="session_6",
            hash="hash_6",
        )

        with patch("django.utils.timezone.now", return_value=now):
            calculate_monthly_active_users()

        self.assertEqual(MonthlyActiveUsers.objects.count(), 1)

        entry = MonthlyActiveUsers.objects.last()
        self.assertEqual(entry.date, timezone.datetime(2022, 4, 30).date())
        self.assertEqual(entry.count, 2)
        self.assertEqual(entry.fraction, 0.5)

    def test_duplicate_calculation(self):
        now = timezone.datetime(2022, 4, 19, 10, 0)
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 15),
            session_key="session_1",
            hash="hash_1",
        )

        with patch("django.utils.timezone.now", return_value=now):
            calculate_monthly_active_users()

            with self.assertRaises(IntegrityError):
                calculate_monthly_active_users()


class TestDeletePastUserVisits(TestCase):
    fixtures = ["user.json"]

    def test_multiple_visits_of_same_user(self):
        now = timezone.datetime(2022, 5, 1, 3)
        check_timestamp = timezone.datetime(2022, 5, 1, tzinfo=pytz.utc)
        UserVisit.objects.create(
            user_id=100,
            timestamp=timezone.datetime(2022, 3, 18),
            session_key="session_1",
            hash="hash_1",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=timezone.datetime(2022, 4, 1),
            session_key="session_2",
            hash="hash_2",
        )
        UserVisit.objects.create(
            user_id=300,
            timestamp=timezone.datetime(2022, 4, 10),
            session_key="session_3",
            hash="hash_3",
        )
        UserVisit.objects.create(
            user_id=200,
            timestamp=check_timestamp,
            session_key="session_4",
            hash="hash_4",
        )

        with patch("django.utils.timezone.now", return_value=now):
            delete_past_user_visits()

        self.assertEqual(UserVisit.objects.count(), 1)
        self.assertEqual(UserVisit.objects.last().timestamp, check_timestamp)
