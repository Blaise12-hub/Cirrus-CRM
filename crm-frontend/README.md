# Cirrus CRM — Frontend

Real Vite + React app, wired to the Express/Postgres backend — no mock data,
no hardcoded arrays. This has been build-tested and run end-to-end against
the live backend during development (login, pipeline drag-to-stage, lead
conversion, and activity logging were all verified working over real HTTP).

## 1. Make sure the backend is running first

See the backend project's README. You need:
- Postgres running with the schema + seed data loaded
- The Express API running on `http://localhost:4000`

## 2. Configure

```bash
cp .env.example .env
```

`VITE_API_URL` defaults to `http://localhost:4000/api` — change it if your
backend runs elsewhere.

## 3. Install & run

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. You'll land on `/login`.

## 4. Log in

The seed data includes a user (`eric.nshuti@example.com`), but seeded
passwords are placeholders, not real bcrypt hashes — you need a real user
to log in as. Easiest path, register one directly against the API:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Jane","last_name":"Doe","email":"jane@example.com","password":"password123","role":"sales_rep"}'
```

Then log in with that email/password on the `/login` screen.

Note: since ownership scoping is enforced (`sales_rep` sees only their own
records), a brand-new user will see an empty pipeline/accounts/contacts
list at first — that's correct behavior, not a bug. Log in as a
`manager`-role user to see everything, or create some records as your new
rep to populate their own view.

## What's real vs. what's a known gap

**Real and working:**
- Login persists a JWT in `localStorage`, attached to every request
- Pipeline drag-and-drop calls `PATCH /api/opportunities/:id/stage` live, with optimistic UI + rollback on failure
- Lead conversion calls `POST /api/leads/:id/convert` and navigates to the real new contact it created
- Activity logging calls `POST /api/activities` and the new entry appears immediately
- Ownership scoping is enforced server-side, not just hidden in the UI

**Known gaps to close next:**
- No owner name/avatar shown on records — the backend doesn't yet join
  user names into accounts/contacts/opportunities responses, so the UI
  shows `#<owner_id>` as a placeholder. Fix: add a lightweight `/api/users`
  lookup or join owner first/last name into the existing list endpoints.
- Opportunity list can't be filtered by `contact_id` server-side yet
  (`ContactDetail.jsx` fetches all opportunities and filters client-side).
  Fine at seed-data scale, won't scale — add `?contact_id=` support to the
  opportunities route.
- No "create account/contact/opportunity" forms yet in the frontend — only
  editing existing pipeline stage and logging activities. The backend
  routes already support creation; the UI just doesn't expose it yet.
- No registration page in the UI — new users are created via direct API call.

## Project structure

```
src/
  api/            fetch client + one module per resource (accounts, contacts, ...)
  context/        AuthContext (JWT + current user)
  components/      shared UI: Sidebar, DataTable, Activity timeline/form, badges
  pages/           one file per route
  App.jsx          routing + auth-gated layout
  index.css        the whole design system (IBM Plex Sans/Mono, enterprise blue)
```
