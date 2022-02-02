from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.formats import localize

from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ("email", "is_active", "is_staff", "is_superuser", "has_beta_access")
    readonly_fields = ("last_activity",)

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        fieldsets[2][1]["fields"] = (
            "is_active",
            "is_staff",
            "is_superuser",
            "has_beta_access",
        )
        fieldsets[3][1]["fields"] = ("last_activity", "last_login", "date_joined")
        return fieldsets


admin.site.register(CustomUser, CustomUserAdmin)
