#!/bin/bash

# Exit if any command fails
set -e

script_path=$(dirname "$(readlink -f "$0")")

# Build the docker container
cd ..
docker build -t ghcr.io/tgamauf/spritstat:latest -f docker/Dockerfile .

# Start app
cd "$script_path"
docker-compose up --force-recreate
