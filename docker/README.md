# Docker Setup Guide

This document explains how to run the UGram backend with PostgreSQL using Docker.

## Prerequisites

- Docker installed
- Docker Compose installed

## Quick Start

**IMPORTANT**: All docker-compose commands must be run from the **project root directory** (where `docker-compose.yml` is located), not from the `docker/` folder.

### First Time Setup (Build and Run All Services)

```bash
# From project root directory
docker-compose --profile full up -d --build
```

This will:
1. Build the backend Docker image
2. Build the frontend Docker image
3. Start a PostgreSQL database container
4. Start the backend API container
5. Start the frontend container
6. Run database migrations automatically

The services will be available at:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8081
- **Swagger UI**: http://localhost:8081/swagger
- **Database**: localhost:5432

### Subsequent Runs (No Build)

```bash
# From project root directory
docker-compose --profile full up -d
```

This starts all services without rebuilding images.

### Visual Studio Debugging (Database Only Mode)

For local development with debugging in Visual Studio, run only the database in Docker:

```bash
# Start only the database
docker-compose --profile dev up -d
```

This starts just the PostgreSQL container. Then:

1. Open `backend/UGram.slnx` in Visual Studio
2. Press **F5** to start debugging
3. Set breakpoints and debug normally

The backend will connect to the Docker database on `localhost:5432` automatically.

**Why this is useful:**
- ✅ Full Visual Studio debugging (breakpoints, watch, step-through)
- ✅ Fast iteration (no container rebuilds)
- ✅ Database persistence via Docker
- ✅ Consistent database setup across team

### Launch Backend Only

If you want to run the backend and database without the frontend (e.g., for local frontend development):

```bash
docker-compose --profile full up -d db backend
```

This will:
1. Start only the PostgreSQL database container
2. Build and start only the backend API container
3. Skip the frontend container

The backend will be available at **http://localhost:8081** and Swagger UI at **http://localhost:8081/swagger**.

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

**Note**: All commands should be run from the **project root directory**.

**Docker Profiles**: This project uses Docker Compose profiles to control which services run:
- `--profile full` - Runs all services (db, backend, frontend)
- `--profile dev` - Runs only the database (for local development with Visual Studio)

### Start services
```bash
# Start all services (no rebuild)
docker-compose --profile full up -d

# Start all services and rebuild images
docker-compose --profile full up -d --build

# Start only database for local development
docker-compose --profile dev up -d

# Start specific services only (overrides profiles)
docker-compose up -d db backend
```

### Stop services
```bash
# Stop all running services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f db

# Frontend only
docker-compose logs -f frontend
```

### Rebuild after code changes
```bash
# Rebuild and restart all services
docker-compose --profile full up -d --build

# Rebuild only backend
docker-compose --profile full up -d --build backend

# Rebuild only frontend
docker-compose --profile full up -d --build frontend
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
