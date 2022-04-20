from django.contrib import admin

from . import models


@admin.register(models.DailyActiveUsers)
class DailyActiveUsersAdmin(admin.ModelAdmin):
    fields = ("date", "count", "fraction")


@admin.register(models.MonthlyActiveUsers)
class MonthlyActiveUsersAdmin(admin.ModelAdmin):
    fields = ("date", "count", "fraction")
