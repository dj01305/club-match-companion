# Design Document: Club Match Companion

## Overview

Club Match Companion is a full-stack web application that lets football fans keep personal notes about matches. A user registers with their name, email, password, and favourite club. After logging in they land on a dashboard where they can create, view, edit, and delete match notes.

The project is a **monorepo** — one repository that holds two separate applications:

- `frontend/` — the React app the user sees in their browser
- `backend/` — the Node.js API the frontend talks to

Phases 1–3 (project scaffold, authentication, dashboard and notes CRUD) are fully implemented. This design covers the complete system and guides the remaining work: backend API tests (Phase 4), Playwright end-to-end tests (Phase 4), GitHub Actions CI, and README (Phase 5).

---

## Architecture

The system follows a classic **client–server** pattern.

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  React App (Vite, TypeScript, React Router)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Login /     │  │  Dashboard   │  │  AuthContext  │  │
│  │  Register    │  │  + NoteForm  │  │  (token,user) │  │
│  │  pages       │  │  + NoteCard  │  │               │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│           │                │                            │
│           └────────────────┘                            │
│                    │  HTTP (fetch)                       │
└────────────────────┼────────────────────────────────────┘
                     │
          Bearer JWT in every /api/* request
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Express API (port 3001)                 │
│                                                         │
│  /auth/register   POST  ─► auth.controller              │
│  /auth/login      POST  ─► auth.controller              │
│  /api/dashboard   GET   ─► authenticateToken ─► handler │
│  /api/notes       GET   ─► authenticateToken ─► notes   │
│  /api/notes       POST  ─► authenticateToken ─► notes   │
│  /api/notes/:id   PUT   ─► authenticateToken ─► notes   │
│  /api/notes/:id   DELETE─► authenticateToken ─► notes   │
│                                                         │
│  sql.js (in-memory SQLite, persisted to data/*.db)      │
└─────────────────────────────────────────────────────────┘
```

**Key design decisions:**

- **sql.js** is used instead of a native SQLite binding. It is a pure JavaScript port of SQLite, so it works without compiling native code. The database lives in memory and is written to a `.db` file on disk after every write. In test mode (`NODE_ENV=test`) disk writes are skipped entirely, giving each test run a clean, isolated database.
- **JWT** tokens are signed with a secret from `.env`, expire after 7 days, and are stored in `localStorage` on the frontend. Every request to `/api/*` must include the token as a `Bearer` header.
- **bcrypt** is used to hash passwords before storing them. The login handler always runs `bcrypt.compare` even when the email is not found, so an attacker cannot tell from response timing whether an email is registered.

---

## Components and Interfaces

### Backend

| File | What it does |
|---|---|
| `server.js` | Entry point. Calls `createApp()` then starts listening on port 3001. |
| `src/app.js` | Creates the Express app, registers middleware (JSON body parser, CORS), mounts routes, and exports `createApp()` which awaits `initDb()` before returning. Tests import `createApp()` directly — no real server needed. |
| `src/db/db.js` | Initialises sql.js, creates tables if they don't exist, and exposes three helpers: `run()` (INSERT/UPDATE/DELETE), `get()` (single row), `all()` (multiple rows). Calls `saveDb()` after every write to persist to disk. |
| `src/middleware/auth.middleware.js` | `authenticateToken` — reads the `Authorization` header, verifies the JWT, attaches `req.user = { id, email }`, and calls `next()`. Returns 401 if the token is missing or invalid. |
| `src/routes/auth.routes.js` | Maps `POST /auth/register` and `POST /auth/login` to the auth controller. No JWT required. |
| `src/routes/notes.routes.js` | Applies `authenticateToken` to all routes, then maps GET/POST/PUT/DELETE to the notes controller. |
| `src/routes/dashboard.routes.js` | Single `GET /api/dashboard` route — applies `authenticateToken` then returns the user record from the database. |
| `src/controllers/auth.controller.js` | `register`: validates fields, checks for duplicate email, hashes password, inserts user. `login`: looks up user, runs bcrypt compare, signs and returns JWT. |
| `src/controllers/notes.controller.js` | `getNotes`, `createNote`, `updateNote`, `deleteNote` — all scoped to `req.user.id` so users can only touch their own notes. |

### Frontend

| File | What it does |
|---|---|
| `src/main.tsx` | React entry point. Wraps the app in `BrowserRouter` and `AuthProvider`. |
| `src/App.tsx` | Defines the three routes: `/login`, `/register`, `/dashboard`. The dashboard route is wrapped in `ProtectedRoute`. |
| `src/context/AuthContext.tsx` | Holds `token` and `user` in React state, initialised from `localStorage`. Exposes `login()` (saves to state + localStorage) and `logout()` (clears both). Any component can call `useAuth()` to read or update auth state. |
| `src/components/ProtectedRoute.tsx` | Reads `token` from `AuthContext`. If present, renders the child component. If not, redirects to `/login`. |
| `src/hooks/useNotes.ts` | Custom hook that owns all notes state (`notes`, `loading`, `error`). Fetches notes on mount and exposes `createNote`, `updateNote`, `deleteNote`. All calls include the JWT from `AuthContext`. |
| `src/pages/Login.tsx` | Login form. On success calls `AuthContext.login()` then navigates to `/dashboard`. |
| `src/pages/Register.tsx` | Registration form. On success navigates to `/login`. |
| `src/pages/Dashboard.tsx` | Shows the user's name and favourite club, renders the note list using `useNotes`, and manages the add/edit form state. |
| `src/components/NoteForm.tsx` | Controlled form for creating or editing a note. Receives an optional `initial` note for edit mode. |
| `src/components/NoteCard.tsx` | Displays a single note with Edit and Delete buttons. |

### API Contract Summary

All `/api/*` endpoints require `Authorization: Bearer <token>`.

| Method | Path | Auth | Success | Error cases |
|---|---|---|---|---|
| POST | `/auth/register` | None | 201 | 400 missing fields, 409 duplicate email |
| POST | `/auth/login` | None | 200 + JWT | 400 missing fields, 401 bad credentials |
| GET | `/api/dashboard` | JWT | 200 + user | 401 no/bad token |
| GET | `/api/notes` | JWT | 200 + array | 401 no/bad token |
| POST | `/api/notes` | JWT | 201 + note | 400 missing fields, 401 |
| PUT | `/api/notes/:id` | JWT | 200 + note | 401, 404 not found/wrong user |
| DELETE | `/api/notes/:id` | JWT | 200 + message | 401, 404 not found/wrong user |

---

## Data Models

### Database: sql.js (SQLite)

The database file lives at `backend/data/club_match.db`. It is created automatically on first run.

#### `users` table

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-incremented |
| `name` | TEXT | Required |
| `email` | TEXT UNIQUE | Required, used for login |
| `passwordHash` | TEXT | bcrypt hash, never plain text |
| `favoriteClub` | TEXT | Required, shown on dashboard |
| `createdAt` | TEXT | Set by SQLite `datetime('now')` |

#### `match_notes` table

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-incremented |
| `userId` | INTEGER FK | References `users.id` |
| `club` | TEXT | Required |
| `opponent` | TEXT | Required |
| `matchDate` | TEXT | Required (ISO date string) |
| `competition` | TEXT | Optional |
| `noteTitle` | TEXT | Required |
| `noteBody` | TEXT | Optional |
| `watched` | INTEGER | 1 = watched, 0 = not watched, default 1 |
| `createdAt` | TEXT | Set by SQLite `datetime('now')` |

### Frontend types (TypeScript)

```typescript
// AuthContext
interface User {
  id: number;
  name: string;
  email: string;
  favoriteClub: string;
}

// useNotes hook
interface Note {
  id: number;
  club: string;
  opponent: string;
  matchDate: string;
  competition: string | null;
  noteTitle: string;
  noteBody: string | null;
  watched: number;
}

type NotePayload = Omit<Note, 'id'>; // used for create and update requests
```


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Registration always succeeds for valid data

*For any* valid registration payload (non-empty name, unique email, non-empty password, non-empty favoriteClub), a POST to `/auth/register` should return HTTP 201 and a `userId`.

**Validates: Requirements 1.1**

---

### Property 2: Registration rejects any missing required field

*For any* registration payload that is missing at least one of `name`, `email`, `password`, or `favoriteClub`, a POST to `/auth/register` should return HTTP 400.

**Validates: Requirements 1.2**

---

### Property 3: Passwords are never stored as plain text

*For any* user registered with a known password, the value stored in the `passwordHash` column should not equal the plain-text password and should begin with the bcrypt prefix `$2b$`.

**Validates: Requirements 1.4**

---

### Property 4: Login round-trip returns correct user data

*For any* registered user, a POST to `/auth/login` with the correct credentials should return HTTP 200 containing a JWT token and a `user` object whose `name`, `email`, and `favoriteClub` match the values provided at registration.

**Validates: Requirements 2.1, 4.2**

---

### Property 5: Login with wrong credentials always returns 401

*For any* registered user, a POST to `/auth/login` with an incorrect password (or an email that does not exist) should return HTTP 401.

**Validates: Requirements 2.2**

---

### Property 6: Missing or invalid token on any protected endpoint returns 401

*For any* request to a `/api/*` endpoint, if the `Authorization` header is absent or contains an invalid/expired JWT, the response should be HTTP 401.

**Validates: Requirements 3.1, 3.2**

---

### Property 7: Note creation round-trip

*For any* valid note payload submitted by an authenticated user, the note returned in the POST `/api/notes` response should contain the same field values that were submitted, and a subsequent GET `/api/notes` should include that note in the list.

**Validates: Requirements 5.1, 5.3, 9.6**

---

### Property 8: Note creation rejects any missing required field

*For any* note creation payload that is missing at least one of `club`, `opponent`, `matchDate`, or `noteTitle`, a POST to `/api/notes` should return HTTP 400.

**Validates: Requirements 5.2**

---

### Property 9: Notes are isolated per user

*For any* two distinct authenticated users, the notes returned by GET `/api/notes` for user A should contain no notes belonging to user B, and vice versa.

**Validates: Requirements 6.2**

---

### Property 10: Notes are ordered by matchDate descending

*For any* authenticated user with two or more notes, the array returned by GET `/api/notes` should be sorted so that the note with the most recent `matchDate` appears first.

**Validates: Requirements 6.1**

---

### Property 11: Note update round-trip with partial fields

*For any* existing note and any subset of updatable fields, a PUT to `/api/notes/:id` should return HTTP 200, and the returned note should reflect the new values for updated fields while preserving the original values for all fields not included in the request body.

**Validates: Requirements 7.1, 7.3**

---

### Property 12: Note delete round-trip

*For any* note belonging to the authenticated user, after a DELETE to `/api/notes/:id` returns HTTP 200, a subsequent GET `/api/notes` should not include that note.

**Validates: Requirements 8.1**

---

## Error Handling

### Backend

| Scenario | HTTP status | Response body |
|---|---|---|
| Missing required field on register | 400 | `{ "error": "All fields are required." }` |
| Duplicate email on register | 409 | `{ "error": "Email already registered." }` |
| Missing email or password on login | 400 | `{ "error": "Email and password are required." }` |
| Wrong credentials on login | 401 | `{ "error": "Invalid email or password." }` |
| No Authorization header on /api/* | 401 | `{ "error": "Access denied. No token provided." }` |
| Invalid or expired JWT on /api/* | 401 | `{ "error": "Invalid or expired token." }` |
| Missing required field on POST /api/notes | 400 | `{ "error": "club, opponent, matchDate, and noteTitle are required." }` |
| Note not found or wrong user on PUT/DELETE | 404 | `{ "error": "Note not found." }` |

**Important:** The login endpoint always runs `bcrypt.compare` even when the email is not found. This prevents an attacker from detecting whether an email is registered by measuring how long the response takes.

### Frontend

- `useNotes` catches fetch errors and stores the message in the `error` state, which the Dashboard renders in red.
- `ProtectedRoute` redirects to `/login` if `token` is null — this covers both "never logged in" and "logged out" states.
- Auth state is initialised from `localStorage` on page load, so a page refresh does not log the user out.

---

## Testing Strategy

The project uses a **dual testing approach**: API tests for the backend and browser-based end-to-end tests for the frontend. Both are required — they catch different kinds of problems.

### Backend API Tests (Supertest + Jest)

**What they are:** Supertest lets you send real HTTP requests to the Express app without starting an actual server. Jest is the test runner that organises and reports results.

**Why they're needed:** They verify that every endpoint returns the right status codes, response shapes, and error messages. They run fast (no browser needed) and are the first line of defence against regressions.

**Setup:**
- Tests import `createApp()` from `src/app.js` and `await` it before running.
- `NODE_ENV=test` is set so `initDb()` creates a fresh in-memory database — no leftover data between runs, no touching the development `.db` file.
- Run with: `cd backend && npm test`

**Coverage required:**

| Endpoint | Scenarios to cover |
|---|---|
| POST /auth/register | Valid payload → 201; missing each required field → 400; duplicate email → 409; password stored as hash |
| POST /auth/login | Valid credentials → 200 + JWT + user fields; wrong password → 401; unknown email → 401; missing fields → 400 |
| GET /api/dashboard | Valid JWT → 200 + user; no token → 401; bad token → 401 |
| GET /api/notes | Valid JWT → 200 + array; no token → 401; empty list → empty array; user isolation |
| POST /api/notes | Valid payload → 201 + note; missing required field → 400; no token → 401 |
| PUT /api/notes/:id | Valid update → 200 + updated note; partial update preserves other fields; wrong user → 404; bad id → 404 |
| DELETE /api/notes/:id | Valid delete → 200; note gone from list; wrong user → 404; bad id → 404 |

**Property-based test configuration:**
- Library: `jest` with manual generators (or `fast-check` if added as a dev dependency)
- Minimum 100 iterations per property test
- Each property test must include a comment referencing the design property it validates
- Tag format: `// Feature: club-match-companion, Property N: <property text>`

**Each correctness property maps to exactly one property-based test:**

| Design Property | Test description |
|---|---|
| Property 1 | For N random valid payloads, register always returns 201 |
| Property 2 | For all combinations of missing fields, register returns 400 |
| Property 3 | For N random passwords, stored hash never equals plain text |
| Property 4 | For N random users, login returns JWT + matching user fields |
| Property 5 | For N random wrong passwords, login returns 401 |
| Property 6 | For all protected endpoints, missing/bad token returns 401 |
| Property 7 | For N random notes, create then fetch returns same field values |
| Property 8 | For all combinations of missing note fields, create returns 400 |
| Property 9 | For N random user pairs, each user only sees their own notes |
| Property 10 | For N random note sets, GET returns notes sorted by matchDate desc |
| Property 11 | For N random partial updates, untouched fields are preserved |
| Property 12 | For N random notes, delete then fetch does not include the note |

### Frontend End-to-End Tests (Playwright)

**What they are:** Playwright controls a real browser and simulates what a real user does — clicking buttons, filling forms, reading text on screen.

**Why they're needed:** They verify the full stack works together. An API test can pass while the frontend is broken; E2E tests catch that.

**Setup:**
- Both the backend (`npm run dev` in `backend/`) and frontend (`npm run dev` in `frontend/`) must be running before Playwright tests execute.
- Playwright config should point to `http://localhost:5173` (Vite default).
- Screenshots on failure: configure `screenshot: 'only-on-failure'` in `playwright.config.ts`.
- Run with: `npx playwright test`

**User journeys to cover:**

| Journey | Steps | Assert |
|---|---|---|
| Registration | Visit /register, fill form, submit | Lands on /dashboard, sees name and club |
| Login | Visit /login, enter credentials, submit | Lands on /dashboard |
| Unauthenticated redirect | Navigate directly to /dashboard without logging in | Redirected to /login |
| Create note | Click "+ Add Note", fill form, submit | New note card appears in list |
| Edit note | Click Edit on a note, change a field, save | Updated value visible in list |
| Delete note | Click Delete on a note, confirm | Note card removed from list |
| Logout | Click Logout | Redirected to /login |

### CI/CD (GitHub Actions)

A single workflow file at `.github/workflows/ci.yml` triggers on every push and pull request to `main`. It runs in sequence:

1. Check out code
2. Set up Node.js
3. Install backend dependencies (`cd backend && npm ci`)
4. Run backend API tests (`cd backend && npm test`)
5. Install frontend dependencies (`cd frontend && npm ci`)
6. Install Playwright browsers
7. Start backend and frontend servers (background processes)
8. Run Playwright E2E tests
9. Upload screenshots on failure as workflow artifacts

If any step fails, the workflow is marked failed and the pull request is blocked.
