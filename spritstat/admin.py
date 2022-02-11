from django import forms
from django.contrib import admin

from . import models
from users.models import CustomUser


@admin.register(models.Location)
class UserLocationAdmin(admin.ModelAdmin):
    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.schedule.delete()

        super().delete_queryset(request, queryset)


class StationAdminForm(forms.ModelForm):
    users = forms.ModelMultipleChoiceField(
        queryset=CustomUser.objects.all(),
        required=False,
    )
    prices = forms.ModelMultipleChoiceField(
        queryset=models.Price.objects.all(),
        required=False,
    )

    class Meta:
        model = models.Station
        fields = (
            "users",
            "name",
            "address",
            "postal_code",
            "city",
            "latitude",
            "longitude",
            "prices",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance:
            self.fields["users"].initial = self.instance.users.all()
            self.fields["prices"].initial = self.instance.prices.all()

    def save(self, commit=True):
        station = super().save(commit=False)

        station.users.add(*self.cleaned_data["users"])
        station.prices.add(*self.cleaned_data["prices"])

        if commit:
            station.save()
            station.save_m2m()

        return station


@admin.register(models.Station)
class StationAdmin(admin.ModelAdmin):
    fields = (
        "users",
        "name",
        "address",
        "postal_code",
        "city",
        "latitude",
        "longitude",
        "prices",
    )
    form = StationAdminForm


@admin.register(models.Price)
class PriceAdmin(admin.ModelAdmin):
    readonly_fields = ("datetime",)
