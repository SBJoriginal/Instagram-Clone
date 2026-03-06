# Docker & Environment Setup Guide

All `docker compose` commands must be run from the **project root** (where `docker-compose.yml` lives).

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- AWS CLI configured locally (`aws configure`) with an IAM user that has access to the dev S3 bucket
- A `.env` file at the project root (see [Environment Variables](#environment-variables))

---

## Environment Variables

Copy the template and fill in your local values. **Never commit `.env`.**

```bash
cp .env.example .env
```

| Variable | Required for | Description |
|---|---|---|
| `DB_PASSWORD` | Local Docker | Postgres container password |
| `JWT_SECRET` | Local Docker | JWT signing key (min 32 chars) |
| `S3_BUCKET_NAME` | Local Docker | Your dev S3 bucket name |
| `AWS_REGION` | Local Docker | AWS region (default: `us-east-2`) |
| `STAGING_DB_CONNECTION` | Staging override | RDS connection string for staging |

AWS credentials for S3 come from your local `~/.aws/credentials` — set up via `aws configure`. They are **not** in `.env`.

---

## Local Development

### Option A — Full stack in Docker (recommended)

Runs Postgres + backend + frontend all in Docker. Migrations apply automatically on startup.

```bash
# First time (or after code changes)
docker compose --profile full up --build

# Subsequent runs
docker compose --profile full up
```

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8081 |
| Swagger UI | http://localhost:8081/swagger |
| Postgres | localhost:5432 |

### Option B — Database only (for Visual Studio debugging)

Runs only Postgres in Docker. Start the backend from Visual Studio with **F5**.

```bash
docker compose up -d db
```

The backend will connect to Postgres on `localhost:5432` automatically via `appsettings.Development.json`.

### Reset local database

```bash
# Destroy all data and start fresh
docker compose down -v
docker compose --profile full up --build
```

---

## Staging Environment

Points the backend at the staging RDS instance instead of local Postgres.

> [!CAUTION]
> Staging is a **shared** database. Migrations against staging only run via CI — not locally. Do not run `dotnet ef database update` against staging manually.

```bash
# Requires STAGING_DB_CONNECTION set in your .env
docker compose -f docker-compose.yml -f docker-compose.staging.yml up --build
```

Difference from local:
- No Postgres container — uses RDS
- `ASPNETCORE_ENVIRONMENT=Staging` → auto-migrate is disabled
- No `~/.aws` mount — uses IAM credentials

---

## EF Core Migrations

### Add a migration (always from the project root)

```bash
dotnet ef migrations add <MigrationName> \
  --project backend/backend/UGram.csproj
```

### Apply locally (manual, if needed)

Auto-migrate runs on startup in `Development` and `Docker` environments. To run manually:

```bash
dotnet ef database update \
  --project backend/backend/UGram.csproj
```

### Migration rules for the team

1. **One migration per PR** — never bundle schema changes with feature code
2. **Rebase before adding a migration** — keeps migration history linear and avoids snapshot conflicts
3. **Never manually edit** `AppDbContextModelSnapshot.cs` — regenerate via `dotnet ef migrations add`

#### Resolving a migration conflict

If two developers add a migration at the same time:

```bash
# Remove your migration
dotnet ef migrations remove --project backend/backend/UGram.csproj

# Rebase on main
git rebase main

# Re-add your migration (now timestamped after the other one)
dotnet ef migrations add <MigrationName> --project backend/backend/UGram.csproj
```

---

## Deployment (Staging & Production)

Migrations and deployment to Elastic Beanstalk are handled automatically by CI on push to `main`:

1. **Migrate** — runs `dotnet ef database update` against staging RDS
2. **Deploy** — runs `eb deploy ugram-backend-dev` only if migration succeeds

Production follows the same pattern on a separate workflow/branch.

Secrets required in GitHub Actions (`Settings → Secrets → Actions`):

| Secret | Used for |
|---|---|
| `STAGING_DB_CONNECTION` | RDS connection string |
| `JWT_SECRET` | JWT signing key |
| `AWS_ACCESS_KEY_ID` | EB deploy |
| `AWS_SECRET_ACCESS_KEY` | EB deploy |

---

## AWS Credentials — Local vs Production

| | Local Docker | Staging / Production |
|---|---|---|
| **Credentials source** | `~/.aws/credentials` (mounted read-only) | IAM role (EC2 instance profile / ECS task role) |
| **Region** | `AWS_REGION` in `.env` | Set in EB environment config |
| **Code** | `new AmazonS3Client()` | `new AmazonS3Client()` — same code, SDK resolves automatically |

---

## Common Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f db

# Rebuild a single service
docker compose --profile full up -d --build backend

# Stop everything
docker compose down

# Stop and wipe database
docker compose down -v

# Access Postgres shell
docker compose exec db psql -U postgres -d ugram_dev
```

---

## Troubleshooting

**Backend crashes immediately on startup**
→ Check `docker compose logs backend`. Most likely the DB is not ready yet or a required env var is missing.

**`JwtSettings:Secret` is missing / JWT errors**
→ Ensure `JWT_SECRET` is set in `.env`. The secret is never in `appsettings.json`.

**S3 upload fails with credentials error**
→ Run `aws sts get-caller-identity` locally to verify your AWS credentials are configured. Check that `~/.aws/credentials` exists.

**Migrations fail on startup**
→ Ensure Postgres is healthy first: `docker compose ps`. Check `docker compose logs db`.

**Port already in use**
→ Change the host-side port in `docker-compose.yml` (e.g. `"8082:8080"`).
