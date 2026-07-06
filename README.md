# TamLezzet ERP

Full-stack ERP system for **TamLezzet Export LLP** — a food export company managing farmers, manufacturers, inventory, sales, shipments, finance, CRM, and documents.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, MUI v5, Redux Toolkit, Axios |
| Backend   | Spring Boot 3.2, Java 21, Spring Security, JWT  |
| Database  | PostgreSQL 18                                   |
| Auth      | JWT (access + refresh tokens), TOTP MFA         |
| Storage   | AWS S3 (optional, falls back gracefully)        |
| Docs      | SpringDoc OpenAPI / Swagger UI                  |

---

## Project Structure

```
tamlezzet-erp/
├── backend/        # Spring Boot API
└── frontend/       # React SPA
```

---

## Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 18 running on `localhost:5432`

### 1. Database Setup

Create the database and user in pgAdmin or psql:

```sql
CREATE DATABASE tamlezzet_erp;
CREATE USER admin WITH PASSWORD 'admin1234';
GRANT ALL PRIVILEGES ON DATABASE tamlezzet_erp TO admin;
```

Then run the full schema SQL script manually in pgAdmin.

### 2. Start Backend

```cmd
cd backend
set "DB_USERNAME=admin" && set "DB_PASSWORD=admin1234" && mvn spring-boot:run
```

Backend runs on: `http://localhost:8080/api`

### 3. Start Frontend

```cmd
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## Default Login

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@tamlezzet.com`  |
| Password | `Admin@1234`           |

> To reset the password, generate a new bcrypt hash (strength 12) and update the `password_hash` column in the `users` table.

---

## Modules

| Module        | Description                              |
|---------------|------------------------------------------|
| Auth          | Login, JWT refresh, MFA (TOTP)           |
| Dashboard     | KPI summary cards and charts             |
| Finance       | P&L, cash flow, financial dashboard      |
| Expenses      | Expense tracking and categorization      |
| Sales         | Sales invoices and payment receipts      |
| Farmers       | Farmer profiles and purchase records     |
| Manufacturers | Manufacturer management                  |
| Inventory     | Stock items and movements                |
| Customers     | CRM — customers and sample requests      |
| Meetings      | Meeting scheduling and notes             |
| Tasks         | Task management with assignments         |
| Shipments     | Export shipment tracking                 |
| Documents     | File uploads (S3-backed)                 |
| AI Assistant  | OpenAI-powered assistant (disabled locally) |

---

## Environment Variables

### Backend

| Variable         | Default                        | Description              |
|------------------|--------------------------------|--------------------------|
| `DB_URL`         | `jdbc:postgresql://localhost:5432/tamlezzet_erp` | DB connection URL |
| `DB_USERNAME`    | `postgres`                     | DB username              |
| `DB_PASSWORD`    | `postgres`                     | DB password              |
| `JWT_SECRET`     | (built-in default)             | JWT signing secret       |
| `AWS_ACCESS_KEY` | _(blank)_                      | S3 access key (optional) |
| `AWS_SECRET_KEY` | _(blank)_                      | S3 secret key (optional) |
| `OPENAI_API_KEY` | `dummy-key-for-local`          | OpenAI key (optional)    |
| `PORT`           | `8080`                         | Server port              |

### Frontend

| Variable            | Default  | Description       |
|---------------------|----------|-------------------|
| `VITE_API_BASE_URL` | `/api`   | Backend base URL  |

---

## API Documentation

Swagger UI available at: `http://localhost:8080/api/swagger-ui.html`

---

## Logging

- **Backend**: Logs to console and `backend/logs/tamlezzet-erp.log`. Level `DEBUG` for app code, `INFO` for Spring/Security.
- **Frontend**: Color-coded console logs via `src/utils/logger.ts`. Debug logs suppressed in production builds.
