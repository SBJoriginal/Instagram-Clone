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

## 6. Deployment
- Same method as course