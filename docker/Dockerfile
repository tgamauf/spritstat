FROM node:17 AS builder

WORKDIR build

COPY frontend/ .

RUN npm install
RUN npm run build

FROM python:3.9

# These two environment variables prevent __pycache__/ files.
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

ENV APP_USER=spritstat
ENV APP_HOME=/home/app/web

EXPOSE 8000

RUN useradd --user-group \
    --create-home \
    --home-dir ${APP_HOME} \
    --no-log-init \
    --shell \
    /bin/bash $APP_USER

RUN apt-get update \
  && apt-get install -y \
    # Required by entrypoint.sh in order to wait for the DB
    netcat-traditional \
    # Required by Django i18n
    gettext \
  && rm -rf /var/lib/apt/lists/*

WORKDIR $APP_HOME

RUN mkdir /var/log/supervisord /var/run/supervisord
RUN chown -R ${APP_USER}:${APP_USER} /var/log/supervisord /var/run/supervisord
COPY docker/supervisord.conf /etc/supervisord.conf

COPY docker/entrypoint.sh /bin/entrypoint.sh
RUN chmod 755 /bin/entrypoint.sh

RUN mkdir -p $APP_HOME/staticfiles

RUN pip install --upgrade --no-warn-script-location pip supervisor gunicorn

# We need to install the app dependencies for the user to allow for migrations
#  of dependencies
COPY requirements.txt ${APP_HOME}/
USER ${APP_USER}:${APP_USER}
RUN pip install --user --no-warn-script-location -r requirements.txt
USER root:root

# Copy application files
COPY manage.py ${APP_HOME}/
COPY spritstat/ ${APP_HOME}/spritstat/
COPY templates/ ${APP_HOME}/templates/
COPY users/ ${APP_HOME}/users/
COPY user_statistics/ ${APP_HOME}/user_statistics/
RUN chown -R ${APP_USER}:${APP_USER} $APP_HOME

# Copy frontend build artifacts
RUN mkdir -p frontend/public/
COPY --from=builder /build/public/ frontend/public/

USER ${APP_USER}:${APP_USER}

# Compile translations
RUN export DJANGO_SECRET=notsecret; python manage.py compilemessages

ENTRYPOINT ["/bin/entrypoint.sh"]
CMD ["/usr/local/bin/supervisord", "-c", "/etc/supervisord.conf"]
