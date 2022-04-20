from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from user_visit.models import UserVisit

from users.models import CustomUser

from .models import DailyActiveUsers, MonthlyActiveUsers


def calculate_daily_active_users() -> None:
    # Get the daily users for the previous day.

    now = timezone.now()
    target_date = now - relativedelta(days=1)
    count_users = CustomUser.objects.count()
    count_users_day = (
        UserVisit.objects.filter(
            timestamp__year=target_date.year,
            timestamp__month=target_date.month,
            timestamp__day=target_date.day,
        )
        .distinct("user")
        .count()
    )
    DailyActiveUsers.objects.create(
        date=target_date,
        count=count_users_day,
        fraction=float(count_users_day) / count_users,
    )


def calculate_monthly_active_users() -> None:
    # Get the daily users for the last month.
    # The date will be the last day of the month.

    now = timezone.now()
    target_date = date(year=now.year, month=now.month, day=1) - relativedelta(days=1)
    count_users = CustomUser.objects.count()
    count_users_month = (
        UserVisit.objects.filter(
            timestamp__year=target_date.year, timestamp__month=target_date.month
        )
        .distinct("user")
        .count()
    )
    MonthlyActiveUsers.objects.create(
        date=target_date,
        count=count_users_month,
        fraction=float(count_users_month) / count_users,
    )


def delete_past_user_visits() -> None:
    # Delete all user visits of previous months to comply with the principle of
    #  data economy.

    now = timezone.now()
    end_datetime = datetime(
        year=now.year, month=now.month, day=1, hour=0, minute=0, second=0
    )
    UserVisit.objects.filter(timestamp__lt=end_datetime).delete()
