from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ("email", "is_active", "is_staff", "is_superuser", "has_beta_access")

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        fieldsets[2][1]["fields"] = (
            "is_active",
            "is_staff",
            "is_superuser",
            "has_beta_access",
        )
        return fieldsets


admin.site.register(CustomUser, CustomUserAdmin)
