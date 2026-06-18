# HyperVerse Production Deployment

This deployment stack runs HyperVerse behind NGINX with Let's Encrypt TLS, PostgreSQL, Redis, the backend API, the Next.js frontend, and an optional host agent profile.

## Prerequisites

- Ubuntu 22.04/24.04 server with root access.
- A DNS `A`/`AAAA` record pointing your domain to the server.
- Open inbound ports `80` and `443`.

## 1. Install Docker

```bash
sudo scripts/install.sh
```

## 2. Create production environment files

Copy and edit every template in `deploy/env`:

```bash
cp deploy/env/postgres.env.example deploy/env/postgres.env
cp deploy/env/redis.env.example deploy/env/redis.env
cp deploy/env/backend.env.example deploy/env/backend.env
cp deploy/env/frontend.env.example deploy/env/frontend.env
cp deploy/env/agent.env.example deploy/env/agent.env
```

Set strong values for `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `JWT_SECRET`, and `AGENT_TOKEN`. Update all `example.com` URLs to your production domain.

## 3. Issue SSL certificates

```bash
sudo scripts/ssl-init.sh example.com admin@example.com
```

The script starts a temporary HTTP-only NGINX challenge server, requests a Let's Encrypt certificate, renders the TLS reverse-proxy config, and reloads NGINX.

## 4. Renew SSL certificates

Run this from cron or a systemd timer:

```bash
sudo scripts/ssl-renew.sh
```

## 5. Deploy

```bash
sudo scripts/deploy.sh
```

To include the QEMU/KVM host agent on a virtualization node:

```bash
sudo docker compose -f docker-compose.prod.yml --profile agent up -d --build
```

## 6. Back up PostgreSQL

```bash
sudo scripts/backup.sh
```

Backups are written to `backups/` as gzip-compressed SQL dumps.

## Services

- NGINX terminates TLS and proxies `/` to the frontend, `/api` and `/socket.io` to the backend, and `/agent` to the optional host agent.
- PostgreSQL stores HyperVerse application data.
- Redis provides backend cache/session infrastructure.
- Certbot stores certificates in the named `letsencrypt` volume.
