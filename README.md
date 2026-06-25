# UGram — Secure Social Media Platform

UGram is a full-stack, scalable photo-sharing application built with an engineering focus on **Application Security (AppSec)** and clean code principles. The platform implements robust defenses against critical vulnerabilities, adhering to the **OWASP Top 10** safety guidelines.

---

## 🛡️ Security-First Architecture

During development, the application underwent a rigorous security audit and penetration testing phase using **Burp Suite**. The following core security mitigations are baked into the current architecture:

### ⚙️ Implemented Mitigations (OWASP Top 10 Alignment)
*   **Broken Access Control & IDOR:** Enforced strict ownership verification and `[Authorize]` attributes across all sensitive mutation endpoints (`ImagesController`, `ProfileService`, and Account Deletion flows).
*   **Defensive Input & Upload Validation:** Implemented structural regex validation on the frontend and integrated **"Magic Bytes" file signature validation** on the backend to mitigate unrestricted or malicious file uploads.
*   **Cryptographic & Secrets Management:** Completely eliminated hardcoded database credentials and JWT keys. All sensitive credentials have been migrated to **GitHub Encrypted Secrets** and injected via environment variables.
*   **Identification & Authentication Failure:** Deployed a strict server-side **Brute Force Rate Limiter** limiting standard and external (Google OAuth) login workflows to 5 attempts per minute.
*   **Security Misconfiguration & Error Handling:** Designed and deployed a centralized **Global Exception Handler** to prevent stack-trace leaks, ensuring the application only exposes generic errors to end-users.

### 🔍 Vulnerability Management Status
The platform currently tracks and manages 20 structural and architectural security parameters:
*   **Remediated & Closed:** 16 Vulnerabilities
*   **Accepted Risk (Design Constraints):** 2 (Public image discovery by design; SPA JWT state persistence secured via custom Content Security Policies)
*   **Deferred to Production Roadmap:** 2 (CORS origin whitelisting and anti-forgery tokens for cookie-based fallback configurations)

---

## 🏗️ Technical Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 17+ & Angular Material, RxJS State Management |
| **Backend** | ASP.NET Core 8 (REST API, Clean Architecture) |
| **Security Testing** | Burp Suite Professional, OWASP Checklists |
| **ORM & Database** | Entity Framework Core & PostgreSQL 15 |
| **File Infrastructure**| Amazon S3 (Isolated Static Object Storage) |
| **CI/CD & DevOps** | GitHub Actions (Automated Linting, Test Suites, & Schema Migrations) |
| **Deployment** | AWS Elastic Beanstalk & AWS RDS |

---

## 🚀 Getting Started

### Prerequisites
- Docker Desktop
- .NET 8 SDK
- AWS CLI configured with a dev IAM user (`aws configure`)

### Quick Start

```bash
# 1. Copy environment template and fill in your secure keys
cp .env.example .env

# 2. Spin up the secure containerized stack
docker compose --profile full up --build
