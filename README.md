# Cirrus CRM Backend (Express + PostgreSQL)

Production-grade CRM API built with Node.js, Express, and PostgreSQL 15+. Implements strict role-based ownership scoping (`sales_rep`, `manager`, `admin`), audit logging, soft deletes, automated timestamp triggers, and scheduled task reminder notifications.

---

## Features

- **Strict Ownership Scoping**: `sales_rep` accounts can only access records they own; `manager` and `admin` roles access the full organization. Reps cannot assign records to others. Non-numeric IDs are strictly validated to prevent 500 errors.
- **Audit Trail**: Every `INSERT`, `UPDATE`, `DELETE`, and `SOFT_DELETE` on core CRM entities is automatically captured in `crm.audit_logs` with before-and-after JSONB snapshots.
- **Soft Deletes**: Active queries filter by `deleted_at IS NULL` backed by partial indexes.
- **Automated `updated_at` Triggers**: Database-level triggers ensure timestamp integrity.
- **Task Reminders & Notification System**: Built-in cron scheduler generates notifications for due and overdue tasks, with dedicated user notification endpoints.
- **Ready for Cloud Deployment**: Configuration included for Render and Vercel.

---

## 1. Local Development Setup

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (or access to a cloud PostgreSQL 15+ database such as Neon)

### Start PostgreSQL via Docker

```bash
docker compose up -d
```

This starts PostgreSQL 15 and executes `db-init/01_schema.sql` and `db-init/02_audit_soft_deletes_notifications.sql`.

To reset the database from scratch:
```bash
docker compose down -v
docker compose up -d
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set a secure `JWT_SECRET` and your `DATABASE_URL`.

### Install Dependencies & Run

```bash
npm install
npm run dev     # Starts server with file watching
# or
npm start       # Starts production server
```

The API starts on `http://localhost:4000`. Test the health endpoint:
```bash
curl http://localhost:4000/health
```

Run test suite:
```bash
npm test
```

---

## 2. API Endpoints Overview

All endpoints except `/api/auth/*` require `Authorization: Bearer <token>`.

| Domain | Method & Path | Description |
|---|---|---|
| **Auth** | `POST /api/auth/register` | Register new user account |
| | `POST /api/auth/login` | Login and obtain JWT token |
| **Accounts** | `GET /api/accounts` | List accounts (scoped by owner for reps) |
| | `GET /api/accounts/:id` | Get single account (scoped) |
| | `POST /api/accounts` | Create account (auto-assigns rep ID) |
| | `PATCH /api/accounts/:id` | Update account (scoped) |
| | `DELETE /api/accounts/:id` | Delete account (scoped) |
| **Contacts** | `GET /api/contacts?account_id=` | List contacts (scoped) |
| | `GET /api/contacts/:id` | Get contact (scoped) |
| | `POST /api/contacts` | Create contact |
| | `PATCH /api/contacts/:id` | Update contact |
| | `DELETE /api/contacts/:id` | Delete contact |
| **Leads** | `GET /api/leads` | List leads (scoped) |
| | `GET /api/leads/:id` | Get lead (scoped) |
| | `POST /api/leads` | Create lead |
| | `PATCH /api/leads/:id` | Update lead status/details |
| | `POST /api/leads/:id/convert` | Atomic transaction to convert lead into contact (+ optional account) |
| | `DELETE /api/leads/:id` | Delete lead |
| **Opportunities** | `GET /api/opportunities?stage=` | Pipeline deal listing (scoped) |
| | `GET /api/opportunities/:id` | Get opportunity details |
| | `POST /api/opportunities` | Create opportunity |
| | `PATCH /api/opportunities/:id` | Update opportunity fields |
| | `PATCH /api/opportunities/:id/stage` | Update pipeline stage |
| | `DELETE /api/opportunities/:id` | Delete opportunity |
| **Activities** | `GET /api/activities?contact_id=` | Timeline activities for record (scoped) |
| | `GET /api/activities/mine` | Open tasks for current user |
| | `POST /api/activities` | Create activity (validates single parent) |
| | `PATCH /api/activities/:id` | Update activity |
| | `DELETE /api/activities/:id` | Delete activity |
| **Notifications** | `GET /api/notifications?unread=true` | List user notifications |
| | `GET /api/notifications/unread-count` | Get unread count for badge |
| | `PATCH /api/notifications/:id/read` | Mark notification as read |
| | `PATCH /api/notifications/read-all` | Mark all user notifications as read |
| | `DELETE /api/notifications/:id` | Delete notification |
| | `POST /api/notifications/run-reminders` | Manual reminder runner (admin/manager) |
| **Dashboard** | `GET /api/dashboard/summary` | Aggregated metrics and pipeline stats |

---

## 3. Deployment Guides

### Option A: Deploy to Render (Recommended for Backend + Cron)

Render runs the Express app continuously, which allows the built-in `node-cron` reminder scheduler to fire automatically without external webhooks.

1. **Push your code to GitHub / GitLab**.
2. **Create a Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **New + -> Web Service**.
   - Connect your GitHub repository.
   - Or click **New + -> Blueprint** and point to `render.yaml`.
3. **Configure Settings** (if setting up manually):
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. **Set Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g. from Neon, Supabase, or Render PostgreSQL).
   - `JWT_SECRET`: A secure random 64-character secret.
   - `JWT_EXPIRES_IN`: `8h`
   - `NODE_ENV`: `production`
   - `REMINDER_CRON_SCHEDULE`: `0 * * * *` (hourly)
5. **Deploy**: Render will build, start your service, and provide your public URL (e.g., `https://cirrus-crm-api.onrender.com`).

---

### Option B: Deploy to Vercel

Vercel deploys the application as serverless functions using the included `vercel.json` and `api/index.js` bridge.

1. **Install Vercel CLI or import repository**:
   - Import the repository in [vercel.com/new](https://vercel.com/new).
2. **Configure Root Directory**:
   - Set Root Directory to `./` (or `crm-backend`).
3. **Set Environment Variables** in Vercel Project Settings:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `NODE_ENV`: `production`
   - `DISABLE_REMINDER_CRON`: `true` (Since serverless lambdas do not keep persistent timers in memory).
4. **Cron on Vercel**:
   - Because serverless functions sleep between requests, use a Vercel Cron Job (in `vercel.json`) or an external scheduler (such as cron-job.org or GitHub Actions) to hit `POST /api/notifications/run-reminders` with an Admin Bearer token.
5. **Deploy**: Click **Deploy**.

---

## 4. Database Migrations

To apply the latest schema updates (Audit Trail, Soft Deletes, Notifications, Triggers) against your live database:

```bash
psql "$DATABASE_URL" -f db-init/01_schema.sql
psql "$DATABASE_URL" -f db-init/02_audit_soft_deletes_notifications.sql
```
