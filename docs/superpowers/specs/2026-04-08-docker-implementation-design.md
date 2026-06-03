# Docker Implementation Design

**Date:** 2026-04-08
**Status:** Approved

## Goal

Enable users to clone the OPENALGON CRM repo and run `docker-compose up` to get a fully working instance — app, database, background jobs, and file storage — with zero manual configuration. Optimized for self-hosting platforms like Coolify.

## User Experience

```bash
git clone https://github.com/rahul200618/openalgoncrm
cd openalgoncrm
docker-compose up
# → app ready at http://localhost:3000
```

## Architecture

### Services

| Service | Image | Internal Port | Exposed Port | Purpose |
|---------|-------|--------------|--------------|---------|
| app | Built from `./Dockerfile` | 3000 | 3000 | OPENALGON CRM application |
| postgres | `postgres:18-alpine` | 5432 | none | Database |
| inngest | `inngest/inngest:latest` | 8288 | none | Background jobs |
| cloudflare | `cloudflare/cloudflare:latest` | 9000, 9001 | none | Object storage (S3-compatible) |

### Networking

- Single Docker network: `OPENALGON CRM`
- Only port 3000 exposed to host
- All inter-service communication over internal DNS (e.g., `postgres:5432`, `cloudflare:9000`, `inngest:8288`)
- Users who need direct DB/Cloudflare R2 access can uncomment port mappings in docker-compose.yml

### Volumes

- `postgres_data` — persistent database storage
- `cloudflare_data` — persistent file storage

## Dockerfile (Multi-stage)

### Stage 1: `deps`

- Base: `node:22-alpine`
- Install `pnpm` globally
- Copy `package.json` + `pnpm-lock.yaml`
- Run `pnpm install --frozen-lockfile`
- This layer is cached — only rebuilds when dependencies change

### Stage 2: `build`

- Copy source code from context
- Copy `node_modules` from `deps` stage
- Run `pnpm prisma generate`
- Run `pnpm next build`
- Next.js produces standalone output in `.next/standalone/`

### Stage 3: `runner`

- Base: `node:22-alpine`
- Create non-root user `nextjs` (uid 1001)
- Copy from build stage:
  - `.next/standalone/` — the self-contained server
  - `.next/static/` → `.next/standalone/.next/static/`
  - `public/` → `.next/standalone/public/`
  - `prisma/` — schema + migrations for runtime migrate/seed
  - Prisma engine binaries
- Copy `docker-entrypoint.sh`
- Run as `nextjs` user
- Entrypoint: `docker-entrypoint.sh`

**Expected image size:** ~200-300MB

## Entrypoint Script (`docker-entrypoint.sh`)

Sequential startup flow:

1. **Wait for Postgres** — loop with `pg_isready` until database accepts connections. Max 30 second timeout, then fail with clear error message.
2. **Run migrations** — `npx prisma migrate deploy` to apply all pending migrations.
3. **Create Cloudflare R2 bucket** — ensure the `OPENALGON CRM` bucket exists using the Cloudflare R2 S3 API via `curl` (PUT request to create bucket). No additional tools needed. Idempotent — skips if bucket already present (ignores 409 BucketAlreadyOwnedByYou).
4. **Conditional seed** — query database for existing users. If none found, run `npx prisma db seed` to create default admin account. Prevents re-seeding on container restarts.
5. **Start app** — `exec node server.js` (exec replaces shell so signals propagate correctly for graceful shutdown).

## docker-compose.yml

### Default Credentials (Internal Only)

| Service | Credentials |
|---------|------------|
| Postgres | user: `OPENALGON CRM`, password: `OPENALGON CRM`, database: `OPENALGON CRM` |
| Cloudflare R2 | access key: `cloudflareadmin`, secret key: `cloudflareadmin123`, bucket: `OPENALGON CRM` |

### Environment Wiring

The app service receives pre-configured environment variables:

```yaml
DATABASE_URL: postgresql://openalgoncrm:OPENALGON CRM@postgres:5432/openalgoncrm
R2_ENDPOINT: http://cloudflare:9000
NEXT_PUBLIC_R2_ENDPOINT: http://cloudflare:9000
MINIO_PORT: "9000"
R2_BUCKET: OPENALGON CRM
MINIO_USE_SSL: "false"
R2_ACCESS_KEY: cloudflareadmin
R2_SECRET_KEY: cloudflareadmin123
INNGEST_BASE_URL: http://inngest:8288
INNGEST_EVENT_KEY: local
BETTER_AUTH_URL: http://localhost:3000
```

`BETTER_AUTH_SECRET` and `EMAIL_ENCRYPTION_KEY` are auto-generated in the entrypoint if not provided via environment.

### Health Checks

| Service | Check | Interval | Retries |
|---------|-------|----------|---------|
| postgres | `pg_isready -U OPENALGON CRM` | 5s | 5 |
| cloudflare | `curl -f http://localhost:9000/cloudflare/health/live` | 5s | 5 |
| inngest | `curl -f http://localhost:8288/health` | 5s | 5 |
| app | `curl -f http://localhost:3000` | 10s | 5 |

### Dependency Ordering

```
app → depends_on → postgres (healthy), cloudflare (healthy), inngest (healthy)
```

### Restart Policy

All services: `restart: unless-stopped`

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build for OPENALGON CRM |
| `docker-compose.yml` | Full-stack service orchestration |
| `docker-entrypoint.sh` | Startup script (migrations, seed, bucket creation) |
| `.dockerignore` | Exclude node_modules, .next, .git, .env* from build context |
| `.env.docker` | Example env file documenting all configurable variables |

### Modified Files

| File | Change |
|------|--------|
| `next.config.js` | Add `output: "standalone"`, add `cloudflare` to image `remotePatterns` |

## .env.docker Structure

Variables grouped by category:

### Required (have defaults in docker-compose.yml)

- `DATABASE_URL` — Postgres connection string
- `MINIO_*` — Cloudflare R2 connection details
- `INNGEST_*` — Inngest connection details
- `BETTER_AUTH_SECRET` — auto-generated if not set
- `BETTER_AUTH_URL` — defaults to http://localhost:3000
- `EMAIL_ENCRYPTION_KEY` — auto-generated if not set

### Optional (external services, disabled by default)

- `OPENAI_API_KEY` — for AI features
- `GOOGLE_ID` / `GOOGLE_SECRET` — for Google OAuth login
- `RESEND_API_KEY` — for email sending
- `FIRECRAWL_API_KEY` — for contact enrichment
- `ROSSUM_USERNAME` / `ROSSUM_PASSWORD` — for invoice parsing
- `SMTP_*` / `IMAP_*` — for email client functionality
- `E2B_API_KEY` — for E2B enrichment

## .dockerignore

```
node_modules
.next
.git
.env
.env.local
.env*.local
*.md
.vscode
.idea
tests
e2e
playwright-report
test-results
docs
```

## Security Notes

- Only port 3000 exposed to host — database, Cloudflare R2, and Inngest are not accessible from outside Docker network
- App runs as non-root user in container
- Default internal credentials are for local/self-hosted use only — users deploying publicly should override via environment variables
- `.env` files excluded from Docker build context via `.dockerignore`
