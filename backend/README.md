# TamLezzet ERP — Backend

Spring Boot 3.2 REST API with JWT authentication, PostgreSQL, and modular architecture.

---

## Requirements

- Java 21
- Maven 3.9+
- PostgreSQL 18 on `localhost:5432`

---

## Running Locally

```cmd
set "DB_USERNAME=admin" && set "DB_PASSWORD=admin1234" && mvn spring-boot:run
```

Base URL: `http://localhost:8080/api`

For a clean rebuild:

```cmd
mvn clean spring-boot:run
```

---

## Configuration

All config lives in `src/main/resources/application.yml`.

Key sections:

| Section         | Purpose                                      |
|-----------------|----------------------------------------------|
| `spring.datasource` | PostgreSQL connection (overridden by env vars) |
| `spring.jpa`    | Hibernate settings (`ddl-auto: none`)        |
| `spring.flyway` | DB migration (baseline-on-migrate enabled)   |
| `server.servlet.context-path` | `/api` — all endpoints prefixed  |
| `app.jwt`       | JWT secret and expiry settings               |
| `app.aws`       | S3 bucket and credentials (optional)         |
| `app.mfa`       | TOTP issuer name                             |
| `app.cors`      | Allowed origins (default: `http://localhost:3000`) |
| `logging`       | Log levels and file output                   |

---

## Package Structure

```
com.tamlezzet.erp/
├── common/
│   ├── config/         # AwsConfig, OpenApiConfig, JpaAuditingConfig, RequestLoggingFilter
│   ├── dto/            # ApiResponse, PageResponseDTO
│   ├── entity/         # BaseEntity (id, createdAt, updatedAt)
│   ├── exception/      # GlobalExceptionHandler
│   └── service/        # S3Service
├── module/
│   ├── ai/             # AI assistant (stubbed locally)
│   ├── auth/           # Login, JWT, MFA, user management
│   ├── crm/            # Customers, sample requests
│   ├── dashboard/      # KPI aggregation
│   ├── document/       # File upload/download via S3
│   ├── expense/        # Expense records
│   ├── export/         # Shipments
│   ├── farmer/         # Farmer profiles and purchases
│   ├── finance/        # Financial dashboard
│   ├── income/         # Sales invoices and payment receipts
│   ├── inventory/      # Stock items and movements
│   ├── manufacturer/   # Manufacturer management
│   ├── meeting/        # Meeting records
│   └── task/           # Task management
└── security/
    ├── SecurityConfig.java
    ├── JwtAuthenticationFilter.java
    ├── JwtAuthenticationEntryPoint.java
    ├── JwtService.java
    └── UserDetailsServiceImpl.java
```

---

## Authentication Flow

1. `POST /api/auth/login` — returns `accessToken` + `refreshToken`
2. All protected requests require `Authorization: Bearer <accessToken>`
3. `POST /api/auth/refresh` — exchange refresh token for new access token
4. Access token expires in 24h, refresh token in 7 days

### MFA (TOTP)
- If `mfa_enabled = true` on the user, login returns `{ mfaRequired: true }`
- Client must re-submit with `totpCode` field
- Setup: `GET /api/auth/mfa/setup` → returns QR code as base64 PNG
- Confirm: `POST /api/auth/mfa/confirm` with `{ code }`

---

## User Roles

| Role          | Access Level          |
|---------------|-----------------------|
| `SUPER_ADMIN` | Full access           |
| `ADMIN`       | Full access           |
| `MANAGER`     | Most modules          |
| `ACCOUNTANT`  | Finance, expenses     |
| `STAFF`       | Operational modules   |
| `VIEWER`      | Read-only             |

---

## Logging

- HTTP requests logged by `RequestLoggingFilter`: method, URI, status, duration
- App logs at `DEBUG` level under `com.tamlezzet`
- Log file: `logs/tamlezzet-erp.log`
- SQL queries logged at `DEBUG` (disable in prod by setting `org.hibernate.SQL: WARN`)

---

## API Docs

Swagger UI: `http://localhost:8080/api/swagger-ui.html`
OpenAPI JSON: `http://localhost:8080/api/api-docs`

---

## Known Local Dev Notes

- `ddl-auto: none` — schema must be created manually (no auto-migration)
- AWS S3 falls back to `AnonymousCredentialsProvider` when keys are blank
- Spring AI / OpenAI dependency is commented out — `AiAssistantService` returns stub responses
- Flyway runs on startup but only baselines existing schema, no migration files needed
