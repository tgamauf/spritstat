# Application maintenance

## Manually deploy to production

The application is deployed automatically on every push to the `main` branch. However, it is also possible to deploy it
manually. This has to be done with care, as no database snapshot is taken in this case and the current `latest` docker
image isn't tagged as `previous` either, both of which provide a safety net in case that the deployment fails. Also, it
requires the [Ansible Vault](https://docs.ansible.com/ansible/latest/user_guide/vault.html) password that is required
to decrypt the secrets stored in [deployment/spritstat/production.env](
https://github.com/tgamauf/spritstat/tree/main/deployment/spritstat/production.env).

1. Change to deployment directory: `cd deployment`
2. Execute deployment script: `./deploy.sh`

## Update backend dependencies

1. Update packages in [requirements/production.in](
https://github.com/tgamauf/spritstat/tree/main/requirements/production.in) to latest versions
2. Update production requirements file:
`pip-compile -U --generate-hashes --output-file=requirements.txt requirements/production.in`
3. Update development requirements file:
`pip-compile -U --output-file=requirements_dev.txt requirements/dev.in requirements/production.in`

## Update frontend dependencies

1. Install the [NPM update check tool](https://www.npmjs.com/package/npm-check-updates) globally: 
`sudo npm install -g npm-check-updates`
2. Change to frontend directory: `cd frontend`
3. Update packages: `ncu -u`

After update of the packages execute tests to ensure that everything is still working as intended.


## Cypress Dashboard

The frontend end-to-end tests in Cypress use [Cypress Dashboard](https://dashboard.cypress.io) to parallelize and record
the tests.