# Generated by Django 3.2.12 on 2022-02-22 20:59
from datetime import timedelta
from django.db import migrations


def fill_missing_data(apps, schema_editor):
    Location = apps.get_model("spritstat", "Location")
    Price = apps.get_model("spritstat", "Price")

    # Disable auto_now_add for the datetime field to allow us to set a manual
    #  timestamp.
    Price._meta.get_field("datetime").auto_now_add = False

    # Iterate over all prices of a location and store the prices that do not
    #  have a follow-up after roughly an hour.
    for loc in Location.objects.all():
        prices = Price.objects.filter(location=loc).order_by("datetime")
        for previous, current in zip(prices, prices[1:]):
            # We do modulo division to create the number of hours as this
            #  doesn't need to be exact.
            delta = current.datetime - previous.datetime
            if delta > timedelta(hours=1):
                hours = delta.seconds // 3600
                # Create the new price objects in bulk and then add the through
                #  models to the stations in bulk as well.
                prices_to_create = []
                for h in range(1, hours):
                    prices_to_create.append(
                        Price(
                            location=previous.location,
                            datetime=previous.datetime + timedelta(hours=h),
                            min_amount=previous.min_amount,
                            max_amount=previous.max_amount,
                            average_amount=previous.average_amount,
                            median_amount=previous.median_amount,
                        )
                    )
                new_through_objects = []
                for obj in Price.objects.bulk_create(prices_to_create):
                    new_through_objects.extend(
                        [
                            Price.stations.through(price_id=obj.id, station_id=s.id)
                            for s in previous.stations.all()
                        ]
                    )
                Price.stations.through.objects.bulk_create(new_through_objects)


class Migration(migrations.Migration):

    dependencies = [
        ("spritstat", "0014_remove_station_user"),
    ]

    operations = [
        migrations.RunPython(fill_missing_data),
    ]
