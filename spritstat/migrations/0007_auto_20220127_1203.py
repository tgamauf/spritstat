# Generated by Django 3.2.11 on 2022-01-27 12:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("spritstat", "0006_auto_20220109_0932"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="location",
            name="spritstat_location_value_matches_type",
        ),
        migrations.AddField(
            model_name="location",
            name="name",
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name="location",
            name="type",
            field=models.IntegerField(choices=[(1, "Named"), (2, "Region")]),
        ),
        migrations.AddConstraint(
            model_name="location",
            constraint=models.CheckConstraint(
                check=models.Q(
                    models.Q(
                        ("latitude__isnull", False),
                        ("longitude__isnull", False),
                        ("region_code__isnull", True),
                        ("region_type__exact", ""),
                        ("type", 1),
                    ),
                    models.Q(
                        ("latitude__isnull", True),
                        ("longitude__isnull", True),
                        ("region_code__isnull", False),
                        ("region_type__length__gt", 0),
                        ("type", 2),
                    ),
                    _connector="OR",
                ),
                name="spritstat_location_value_matches_type",
            ),
        ),
    ]
