# Generated by Django 3.2.11 on 2022-02-01 18:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="has_beta_access",
            field=models.BooleanField(default=False),
        ),
    ]
