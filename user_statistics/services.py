from users.models import CustomUser

from .models import DailyUsers, MonthlyUsers, UserVisitQueryset


def calculate_daily_users() -> None:
    count_users = CustomUser.objects.count()
    count_users_day = UserVisitQueryset().day().distinct_users().count()
    DailyUsers.objects.create(
        count=count_users_day, fraction=float(count_users_day) / count_users
    )


def calculate_monthly_usage() -> None:
    count_users = CustomUser.objects.count()
    count_users_month = UserVisitQueryset().day().distinct_users().count()
    MonthlyUsers.objects.create(
        count=count_users_month, fraction=float(count_users_month) / count_users
    )
