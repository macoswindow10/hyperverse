#!/usr/bin/env bash
set -euo pipefail

for file in deploy/env/postgres.env deploy/env/redis.env deploy/env/backend.env deploy/env/frontend.env; do
  if [[ ! -f "${file}" ]]; then
    echo "Missing ${file}. Copy ${file}.example and edit secrets before deploying." >&2
    exit 1
  fi
done

docker compose -f docker-compose.prod.yml pull postgres redis nginx certbot || true
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d --remove-orphans
