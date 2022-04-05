[![Test](https://github.com/tgamauf/spritstat/actions/workflows/test.yml/badge.svg)](
https://github.com/tgamauf/spritstat/actions/workflows/test.yml
)
# SPRITSTAT

[SPRITSTAT](https://sprit.thga.at) is a service that collects fuel price statistics for user-specified locations in 
Austria.

It uses the [Spritpreisrechner API](
https://api.e-control.at/sprit/1.0/doc/index.html?url=https://api.e-control.at/sprit/1.0/api-docs%3Fgroup%3Dpublic-api)
provided by the government regulator E-Control to collect the lowest prices for a location. This API returns all petrol 
stations that provide one of the lowest five prices for any given location at the current time.
As only the lowest five price points are provided, it isn't possible to collect full price statistics (like maximum, 
median, or average prices).

Two different location types are supported by the Spritpreisrechner API:
- coordinates
- regions, which can be either states or districts.

The service provides both region types to the user, but the coordinates type is wrapped by address lookup functionality,
that takes an address and uses the [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview)
to get the coordinates for any given address in Austria.
For each location a user creates, the five lowest prices are collected hourly and the minimum, maximum, average and 
median is calculated. If any of the minimum, maximum, average or median value has changed the price point is stored in 
the database. Of these values currently only the minimum value is exposed to the user as the other values aren't 
actually the absolute maximum, average or median price values. Usually there would be other petrol stations that offer
higher prices as the ones provided by the Spritpreisrechner API. As this is confusing to the user these values are
currently only stored, but might be made available as an "advanced" feature at a later point.


## Technology

### Frontend
The frontend is a single page application implemented in [Typescript](https://www.typescriptlang.org/) /
[React](https://reactjs.org/) and uses [Bulma](https://bulma.io/) as CSS framework. [Babel](https://babeljs.io/) /
[Webpack](https://webpack.js.org/) is used to build the frontend code. Testing is currently done in an end-to-end 
fashion using [Cypress](https://www.cypress.io/). You can find the frontend implementation in the [frontend/](
https://github.com/tgamauf/spritstat/tree/main/frontend) directory.

### Backend
The backend is implemented as a session-authenticated API using [Django](https://www.djangoproject.com/) and [Django
Rest Framework](https://www.django-rest-framework.org/). As database [PostgreSQL](https://www.postgresql.org/) is used.
You can find the backend implementation in the [project root](https://github.com/tgamauf/spritstat/) directory. Notably,
the user management API is found in the [users/](https://github.com/tgamauf/spritstat/tree/main/users/) and the 
implementation of the payload API in the [spritstat/](https://github.com/tgamauf/spritstat/tree/main/spritstat/) 
directory.

### Deployment
The application is automatically tested and deployed to [Amazon Web Services](https://aws.amazon.com/) using [GitHub 
Actions](https://docs.github.com/en/actions). To archive this, the application is first packaged using [Docker](
https://www.docker.com/) and stored in the [GitHub Container Registry](
https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry). 
Deployment of the packaged application to the [Amazon EC2](https://aws.amazon.com/ec2/) virtual machine is then done 
with [Ansible](https://www.ansible.com/). As database a hosted version of PostgreSQL in [Amazon RDS](
https://aws.amazon.com/rds/) is used.

The GitHub Actions workflows used to deploy the application can be found in the [.github/workflows/](
https://github.com/tgamauf/spritstat/tree/main/.github/workflows/) directory. The dockerfile and complementary files 
that are requierd to build the Docker image can be found at [docker/](
https://github.com/tgamauf/spritstat/tree/main/docker/) and the Ansible playbook and other files used to deploy the 
application can be found in directory [/deployment](https://github.com/tgamauf/spritstat/tree/main/deployment/).


## Development, Test and Deployment

### Setup environment

While there is no reason that the application shouldn't run on any other operating system, it has only been tested with
Linux. So, the following instructions assume that the operating system is Linux.

#### Backend
The application backend requires Python 3 to run. While most likely any maintained Python 3 version will work, I
recommend installing Python 3.9 as it has only been tested with this version. If your system Python version is
different, Python 3.9 can be easily installed using [Conda](https://conda.io). If Conda isn't used, I recommend using
a virtual environment instead (`python -m venv venv && . venv/bin/activate`).

Install dependencies: `pip install -r requirements_dev.txt`

The easiest way do setup required services like the PostgreSQL database locally is to use Docker. You can find 
installation instructions [here](https://docs.docker.com/engine/install/). Make sure that the user is part of the 
`docker` group, otherwise all `docker` commands need to be executed with `sudo`.

A number of environment variables are required to execute the tests. The easiest way to do this is to create an
environment file `.env` in the project directory that contains at least these environment variables (`MACHINE IP` has
to be replaced by the IP :
```
POSTGRES_PASSWORD=postgres

DJANGO_POSTGRES_USER=postgres
DJANGO_POSTGRES_PASSWORD=postgres
DJANGO_POSTGRES_DATABASE=postgres

DJANGO_SECRET=notsecret
DJANGO_DEBUG=1

DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@email.com
DJANGO_SUPERUSER_PASSWORD=admin
```

#### Frontend

The frontend requires the [npm](https://docs.npmjs.com/) package manager to run (it has only been tested with version 
8). [Yarn](https://yarnpkg.com/) package manager will work just as well, but you have to adapt the commands below.

Install frontend requirements:
1. Change to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`

### Create translations

Translation is done by [Django](https://docs.djangoproject.com/en/4.0/topics/i18n/translation/) for the email templates 
and by [react-intl](https://formatjs.io/docs/react-intl/) in the frontend.

### Backend/Email

In the project directory:
1. Execute `django-admin makemessages -a -i frontend -i venv -e html,txt` to create the source language file
    for English at `locale/en/LC_MESSAGES/django.po`
2. Translate the content of the source language file
3. Execute `django-admin compilemessages` to compile the messages

### Frontend

In the `frontend` directory:
1. Execute `npm run trans` to create the source language file for English at `frontend/translation/locales/en.json`. 
    The command will print added/deleted/changed text ids. Also, if a changed text has been found the previous 
    translation is stored as "obsoleteMessage" in the source language file
2. Translate the content of the source language file
3. Check if everything is translated by executing `npm run trans:manage --check`
4. Execute `npm run trans:compile` to compile the messages

### Execute tests

In the project directory:
1. Start local PostgreSQL server:  `docker run --env-file .env -d -p 127.0.0.1:5432:5432 postgres:12`
2. Execute backend tests: `python manage.py test`
3. Change to frontend directory: `cd frontend`
4. Build frontend: `npm run build:dev`
5. Execute tests: `npm run test`

### Deploy application locally

For local testing [Docker Compose](https://docs.docker.com/compose/) is helpful, as it allows for easy deployment of a 
local test version with one command. The `deploy.sh` script depends on Docker Compose, so make sure you have installed
it.

1. Change to development directory: `cd dev`
2. Build and deploy the application: `./deploy.sh`

The application is then available at https://localhost.
