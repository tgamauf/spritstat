# Generated by Django 3.2.11 on 2022-02-11 11:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("spritstat", "0013_station_users"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="station",
            name="user",
        ),
    ]