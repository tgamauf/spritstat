#!/bin/sh

echo "Waiting for postgres..."
while ! nc -z "$DJANGO_POSTGRES_HOST" "$DJANGO_POSTGRES_PORT"; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "Migrating the database."
python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "$DJANGO_SUPERUSER_USERNAME" ]
then
    echo "Create superuser."
    python manage.py createsuperuser --noinput >/dev/null 2>&1
fi

exec "$@"
