#!/bin/bash

# exit when any command fails
set -e

docker build -t ghcr.io/tgamauf/spritstat:latest -f docker/Dockerfile .
docker push ghcr.io/tgamauf/spritstat:latest
ansible-playbook --ask-vault-pass -i inventory -u ubuntu playbook.yml
