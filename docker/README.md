# Docker Setup Guide

This document explains how to run the UGram backend with PostgreSQL using Docker.

## Prerequisites

- Docker installed
- Docker Compose installed

## Quick Start

From the project root directory, run:

```bash
docker-compose up -d
```

This will:
1. Start a PostgreSQL database container
2. Build and start the backend API container
3. Run database migrations automatically

## Services

### Database (PostgreSQL)
- **Container**: `ugram_db`
- **Port**: 5432
- **Database**: `ugram_dev`
- **Username**: `postgres`
- **Password**: `equipe22`

### Backend API
- **Container**: `ugram_backend`
- **Port**: 8080
- **Environment**: Docker
- **Swagger UI**: http://localhost:8080/swagger

## Useful Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f db
```

### Rebuild backend after code changes
```bash
docker-compose up -d --build backend
```

### Remove all data (including database volume)
```bash
docker-compose down -v
```

### Access database shell
```bash
docker-compose exec db psql -U postgres -d ugram_dev
```

## File Structure

```
.
├── docker/
│   └── backend.Dockerfile      # Multi-stage Dockerfile for backend
├── docker-compose.yml          # Orchestrates all services
├── backend/
│   ├── .dockerignore          # Excludes unnecessary files from build
│   └── backend/
│       └── appsettings.Docker.json  # Docker environment config
```

## Troubleshooting

### Backend can't connect to database
- Ensure the database container is healthy: `docker-compose ps`
- Check logs: `docker-compose logs db`
- Verify the database password matches in both docker-compose.yml and appsettings

### Database migrations fail
- Ensure PostgreSQL container is fully started
- Check connection string in appsettings.Docker.json
- View migration logs: `docker-compose logs backend`

### Port already in use
If ports 5432 or 8080 are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Change 5432 to another port for database
  - "8081:8080"  # Change 8080 to another port for backend
```
