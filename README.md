# Project Architecture

## 1. Frontend
- **Framework:** Angular
- **UI Component Library:** Angular Material
- **State Management:** Services + RxJS (no global store yet).
- **Routing:** Angular Router with guards for future auth.

## 2. Backend
- **Language:** C#
- **Framework:** ASP.NET Core
- **API:** RESTful endpoints using Controllers
- **ORM:** Entity Framework Core
- **Logging:** Built-in ASP.NET Core logging

## 3. Database
- **Primary DB:** PostgreSQL

## 4. Image Storage
- **Storage:** Amazon S3

## 5. CI/CD
- **CI Tool:** GitHub Actions
- **Enforced Checks:**
  - Linting (ESLint for frontend)
  - Formatting (Prettier / dotnet format)
  - Build & test verification
  - Branch naming & PR checks (feature → develop → release)
- **Pipeline Purpose:** Ensure code quality and reproducibility

## 6. Local Development

### Running Only the Database (for Visual Studio Debugging)

To debug the backend in Visual Studio while using Docker for the database:

```powershell
# Start only the database
docker-compose --profile dev up -d

# Or explicitly run just the database service
docker-compose up -d db
```

Then open the solution in Visual Studio and press **F5** to start debugging. The backend will connect to the Docker database on `localhost:5432`.

### Running the Full Stack

```powershell
# Run all services (database + backend + frontend)
docker-compose --profile full up -d

# Or use the default (same as above)
docker-compose up -d
```

**Access points:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:8081
- Swagger UI: http://localhost:8081/swagger
- Database: localhost:5432

## 7. Deployment
- Same method as course