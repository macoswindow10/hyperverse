#!/usr/bin/env bash
set -euo pipefail

DOMAIN=${1:-}
EMAIL=${2:-}
if [[ -z "${DOMAIN}" || -z "${EMAIL}" ]]; then
  echo "Usage: scripts/ssl-init.sh <domain> <email>" >&2
  exit 1
fi

export HYPERVERSE_DOMAIN=${DOMAIN}
mkdir -p nginx/conf.d

if [[ -f nginx/conf.d/hyperverse.conf ]]; then
  mv nginx/conf.d/hyperverse.conf nginx/conf.d/hyperverse.conf.template
fi
cat > nginx/conf.d/acme.conf <<ACME
server {
  listen 80;
  listen [::]:80;
  server_name ${DOMAIN};
  location /.well-known/acme-challenge/ { root /var/www/certbot; }
  location / { return 200 'HyperVerse ACME bootstrap'; add_header Content-Type text/plain; }
}
ACME

docker compose -f docker-compose.prod.yml up -d nginx

docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "${EMAIL}" \
  --agree-tos \
  --no-eff-email \
  -d "${DOMAIN}"

rm nginx/conf.d/acme.conf
if [[ -f nginx/conf.d/hyperverse.conf.template ]]; then
  envsubst '${HYPERVERSE_DOMAIN}' < nginx/conf.d/hyperverse.conf.template > nginx/conf.d/hyperverse.conf
  rm nginx/conf.d/hyperverse.conf.template
fi

docker compose -f docker-compose.prod.yml up -d nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
