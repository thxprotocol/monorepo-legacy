#!/bin/bash

set -e

echo "==> $(date +%H:%M:%S) ==> Starting up environment containers..."
docker compose -f docker-compose.safe.yml up --force-recreate -d
sleep 60
echo "==> $(date +%H:%M:%S) ==> Starting up environment containers..."
docker compose exec txs-web python manage.py migrate