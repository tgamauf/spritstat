# Generated by Django 3.2.12 on 2022-02-27 17:20

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def create_settings(apps, schema_editor):
    User = apps.get_model("users", "customuser")
    IntroSettings = apps.get_model("spritstat", "introsettings")
    Settings = apps.get_model("spritstat", "settings")

    for user in User.objects.all():
        Settings.objects.create(user=user, intro=IntroSettings.objects.create())


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("spritstat", "0016_alter_price_options"),
    ]

    operations = [
        migrations.CreateModel(
            name="IntroSettings",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("no_location_active", models.BooleanField(default=True)),
                ("location_list_active", models.BooleanField(default=True)),
                ("add_location_active", models.BooleanField(default=True)),
                ("location_details_active", models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name="Settings",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "intro",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="spritstat.introsettings",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.RunPython(create_settings),
    ]
