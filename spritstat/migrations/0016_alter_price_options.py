# Generated by Django 3.2.12 on 2022-02-23 13:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("spritstat", "0015_fill_missing_data"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="price",
            options={"ordering": ["datetime"]},
        ),
    ]
