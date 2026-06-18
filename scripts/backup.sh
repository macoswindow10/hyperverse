#!/usr/bin/env bash
set -euo pipefail

STAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p backups
source deploy/env/postgres.env
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" | gzip > "backups/hyperverse-${STAMP}.sql.gz"
echo "Created backups/hyperverse-${STAMP}.sql.gz"
