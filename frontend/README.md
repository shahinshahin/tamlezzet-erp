# TamLezzet ERP — Frontend

React 18 SPA built with TypeScript, Vite, MUI v5, Redux Toolkit, and Axios.

---

## Requirements

- Node.js 18+
- npm 9+

---

## Running Locally

```cmd
npm install
npm run dev
```

App runs on: `http://localhost:3000`

All `/api` requests are proxied to `http://localhost:8080` via Vite's dev proxy.

---

## Build for Production

```cmd
npm run build
```

Output goes to `dist/`. Serve with any static file server or Nginx.

---

## Project Structure

```
src/
├── api/
│   ├── axiosClient.ts      # Axios instance with auth + logging interceptors
│   └── endpoints.ts        # All API call functions
├── components/
│   ├── common/             # Shared UI components
│   └── layout/             # MainLayout, Sidebar, Topbar
├── hooks/
│   ├── useAppDispatch.ts   # Typed Redux dispatch/selector hooks
│   └── usePageTitle.ts     # Sets document title per page
├── pages/
│   ├── auth/               # LoginPage
│   ├── dashboard/          # DashboardPage
│   ├── expenses/           # ExpensesPage
│   ├── sales/              # SalesPage
│   ├── farmers/            # FarmersPage
│   ├── manufacturers/      # ManufacturersPage
│   ├── inventory/          # InventoryPage
│   ├── customers/          # CustomersPage
│   ├── meetings/           # MeetingsPage
│   ├── tasks/              # TasksPage
│   ├── shipments/          # ShipmentsPage
│   ├── documents/          # DocumentsPage
│   ├── finance/            # FinancePage
│   ├── ai/                 # AiAssistantPage
│   └── profile/            # ProfilePage
├── store/
│   ├── slices/             # Redux slices (auth, etc.)
│   └── index.ts            # Redux store setup
├── utils/
│   └── logger.ts           # Frontend logger utility
├── App.tsx                 # Routes and protected route logic
├── main.tsx                # App entry point
└── theme.ts                # MUI theme customization
```

---

## State Management

Redux Toolkit is used for global state. Current slices:

| Slice  | State                                          |
|--------|------------------------------------------------|
| `auth` | `isAuthenticated`, `accessToken`, `refreshToken`, `user` |

---

## Authentication Flow

1. User submits email + password on `LoginPage`
2. `POST /api/auth/login` returns tokens and user info
3. Tokens stored in Redux (`authSlice`)
4. `axiosClient` attaches `Authorization: Bearer <token>` on every request
5. On 401, client attempts token refresh via `POST /api/auth/refresh`
6. If refresh fails, user is logged out and redirected to `/login`

---

## Logging

All HTTP activity is logged via `src/utils/logger.ts`:

- `DEBUG` — request sent, response received (dev only)
- `WARN` — non-2xx responses
- `ERROR` — token refresh failures

Usage anywhere in the app:

```ts
import { logger } from '../utils/logger';

logger.info('MyComponent', 'Loaded data', data);
logger.error('MyComponent', 'Failed to fetch', error);
```

Log levels: `debug` | `info` | `warn` | `error`
Debug logs are suppressed in production builds automatically.

---

## Environment Variables

Create a `.env.local` file in the `frontend/` directory to override defaults:

```env
VITE_API_BASE_URL=/api
```

---

## Dependencies

| Package              | Purpose                        |
|----------------------|--------------------------------|
| `@mui/material`      | UI component library           |
| `@mui/x-data-grid`   | Data tables                    |
| `@mui/x-date-pickers`| Date picker components         |
| `@reduxjs/toolkit`   | State management               |
| `react-redux`        | React bindings for Redux       |
| `axios`              | HTTP client                    |
| `react-hook-form`    | Form handling and validation   |
| `react-router-dom`   | Client-side routing            |
| `recharts`           | Charts and graphs              |
| `notistack`          | Toast notifications            |
| `dayjs`              | Date formatting                |
