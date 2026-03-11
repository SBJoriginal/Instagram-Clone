# UGram

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Angular + Angular Material |
| Backend | ASP.NET Core 8, REST API, Clean Architecture |
| ORM | Entity Framework Core |
| Database | PostgreSQL 15 |
| File Storage | Amazon S3 |
| CI/CD | GitHub Actions |
| Deployment | AWS Elastic Beanstalk |
| Logging & Monitoring | Sentry |

---

## Getting Started

### Prerequisites

- Docker Desktop
- .NET 8 SDK (for local development without Docker)
- AWS CLI configured with a dev IAM user (`aws configure`)

### Quick start
```bash
# 1. Copy environment template and fill in values
cp .env.example .env

# 2. Start the full stack
docker compose --profile full up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8081 |
| Swagger UI | http://localhost:8081/swagger |

**→ See [`docker/README.md`](docker/README.md) for the full environment guide**, including:
- Local vs staging vs production setup
- EF Core migration workflow
- AWS credential strategy
- Troubleshooting

---

## Logging & Monitoring (Sentry)

Sentry is integrated on both the frontend and backend for error tracking, performance monitoring, and structured logging.

### What is captured

| Type | Frontend | Backend |
|---|---|---|
| Errors & exceptions | ✅ Full stack trace | ✅ Full stack trace |
| Warnings & info logs | ✅ Via `LogService` | ✅ Via Serilog integration |
| Breadcrumbs | ✅ User actions before error | ✅ Logs before crash |
| Performance / Tracing | ✅ API call durations | ✅ Request durations |

### Dashboard Preview

![Sentry Backend Logs](docs/images/sentry%20backend%20logs.png)
*Sentry dashboard showing backend logs and exceptions.*

![Sentry Frontend Logs](docs/images/sentry%20frontend%20logs.png)
*Sentry dashboard showing frontend errors and breadcrumbs.*

### Environment variables

Add the following to your `.env`:
```env
# Sentry
SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project-id>
```

### Testing the integration

To verify Sentry is working, trigger a test error manually:
```typescript
// Angular
Sentry.captureException(new Error("Test Sentry"));
```
```csharp
// .NET
throw new Exception("Test Sentry");
```

Then check the **Issues** tab in your Sentry dashboard — the error should appear within seconds.

---

## Environments

| Environment | Database | Migrations | Triggered by |
|---|---|---|---|
| `Development` | Local Postgres (Docker) | Auto on startup | `dotnet run` |
| `Docker` | Local Postgres (Docker) | Auto on startup | `docker compose up` |
| `Staging` | AWS RDS | CI only (before deploy) | Push to `main` |
| `Production` | AWS RDS | CI only (before deploy) | Release workflow |

---

## CI/CD

- **`ci.yml`** — runs on all branches: lint, format, build, test
- **`deploy-staging.yml`** — runs on push to `main`: migrate → deploy to Elastic Beanstalk