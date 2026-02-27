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