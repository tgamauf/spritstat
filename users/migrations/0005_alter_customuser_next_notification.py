# Generated by Django 3.2.12 on 2022-03-10 15:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("django_q", "0014_schedule_cluster"),
        ("users", "0004_customuser_next_notification"),
    ]

    operations = [
        migrations.AlterField(
            model_name="customuser",
            name="next_notification",
            field=models.OneToOneField(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="django_q.schedule",
            ),
        ),
    ]
