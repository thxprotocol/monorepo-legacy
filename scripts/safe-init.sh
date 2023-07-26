#!/bin/bash

set -e

echo "==> $(date +%H:%M:%S) ==> Starting up environment containers..."
docker compose -f docker-compose.safe.yml up -d \
  && echo "==> $(date +%H:%M:%S) ==> Waiting for migrations... (may take a while)" \
  && sleep 60 \
  && echo "==> $(date +%H:%M:%S) ==> Creating super-user for Safe Config Service... (may take a while)" \
  && expect -c 'spawn docker compose exec cfg-web python src/manage.py createsuperuser; expect "Username:"; send "root\n"; expect "Email address:"; send "\n"; expect "Password:"; send "root\n"; expect "Password (again):"; send "root\n"; expect "Bypass password validation and create user anyway? [y/N]:"; send "yes\n"; interact' \
  && echo "==> $(date +%H:%M:%S) ==> Creating super-user for Safe Transaction Service... (may take a while)" \
  && expect -c 'spawn docker compose exec txs-web python manage.py createsuperuser; expect "Username:"; send "root\n"; expect "Email address:"; send "\n"; expect "Password:"; send "root\n"; expect "Password (again):"; send "root\n"; expect "Bypass password validation and create user anyway? [y/N]:"; send "yes\n"; interact' || exit

echo "==> $(date +%H:%M:%S) ==> All set! You may want to add a ChainInfo into the Config service. Please use the link below to fill its data: http://localhost:8000/cfg/admin/chains/chain/add/"