# Club Match Companion

A full-stack web app for football fans to log and manage personal match notes. Built as a portfolio project to demonstrate growth from QA automation engineer into an SDET — with shift-left principles applied throughout: testing is a first-class concern, not an afterthought.

This project was built in deliberate partnership with AI (Kiro). I designed the architecture, defined every feature, and owned all quality engineering decisions. The test strategy, CI pipeline, coverage gates, and security tradeoffs are mine. AI accelerated the implementation, letting me ship a production-quality full-stack app while staying focused on what I do best: architecture, test strategy, and quality engineering. I think knowing how to direct and validate AI output is itself a skill worth demonstrating, and one the industry increasingly expects.

## What it does

- Register and log in securely with JWT-based authentication
- Create, edit, and delete personal match notes (club, opponent, date, competition)
- Dashboard themed around your favourite club
- Protected routes — only logged-in users can access their notes

## Quality engineering approach

Quality is built in at every layer, not bolted on at the end. This project applies a layered test strategy:

| Layer | Tool | What it covers |
|-------|------|----------------|
| Backend unit | Jest | JWT middleware in isolation, DB helper functions |
| Backend integration | Jest + Supertest | Full request/response cycle through Express routes, middleware, and DB |
| Frontend unit/component | Vitest + React Testing Library | Component rendering, auth context, form behaviour, custom hooks |
| API | Playwright (API mode) | Live server contract testing — auth flows, notes CRUD, access control, data isolation |
| E2E | Playwright (browser) | Critical user journeys: register, login, create/edit/delete notes |

Each layer has a distinct purpose. Unit tests give fast, isolated feedback on individual functions. Integration tests verify that routes, middleware, and the database work correctly together. API tests hit a live server and validate the full HTTP contract. E2E tests confirm the entire stack works from a real user's perspective in a browser.

### CI/CD pipeline

Every pull request targeting `main` triggers a GitHub Actions pipeline. All checks must pass before a PR can be merged.  There is no manual override.

The pipeline runs four jobs in dependency order:

```
backend-unit ──► backend-api
frontend-unit ──► frontend-e2e (needs both unit jobs to pass first)
```

- Backend unit tests run first. If they fail, API tests are skipped.
- Frontend unit tests run in parallel with the backend jobs.
- E2E tests only run once both unit test jobs are green.
- Playwright reports are uploaded as artifacts on failure for debugging.

## Tech stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- React Router DOM (page navigation)
- Axios (HTTP requests)

### Backend
- Node.js + Express
- SQLite (via sql.js) — file-based, zero-config database. No Postgres or MySQL setup required. Clone and run.
- bcrypt — password hashing
- JSON Web Tokens (JWT) — session authentication

### Testing
- Playwright — end-to-end UI tests
- Jest — backend unit test runner
- Supertest — used within Jest tests to make HTTP requests against the Express app
- Vitest — frontend unit test runner
- React Testing Library — renders components for unit testing

## Project structure

```
club-match-companion/
├── frontend/        # React + TypeScript UI
│   └── src/
│       ├── pages/       # Login, Register, Dashboard
│       ├── components/  # Reusable UI pieces
│       ├── context/     # Auth state (AuthContext)
│       ├── hooks/       # useNotes custom hook
│       └── utils/       # Club theme config
└── backend/         # Node.js REST API
    └── src/
        ├── controllers/ # Business logic (auth, notes)
        ├── routes/      # API route definitions
        ├── middleware/  # JWT auth middleware
        └── db/          # Database setup
```

## Getting started

### Prerequisites
- Node.js v18+ and npm (for local dev)
- or [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Docker setup)

### 1. Clone the repo
```bash
git clone https://github.com/dj01305/club-match-companion.git
cd club-match-companion
```

### Option A — Docker (recommended, single command)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) to be installed and running.

```bash
cp backend/.env.example backend/.env  # Set a strong JWT_SECRET value
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

To stop: `Ctrl+C`. To start again later: `docker compose up`

---

### Option B — Local dev (two terminals)

#### 2. Set up the backend
```bash
cd backend
cp .env.example .env  # Open .env and set a strong JWT_SECRET value
npm install
npm run dev
```
The API will start on http://localhost:3000

#### 3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```
The app will open on http://localhost:5173

## API endpoints

| Method | Endpoint | Auth required | Description |
|--------|----------|---------------|-------------|
| POST | /auth/register | No | Create an account |
| POST | /auth/login | No | Log in, receive JWT |
| GET | /api/dashboard | Yes | Get your profile and club |
| GET | /api/notes | Yes | Get all your notes |
| POST | /api/notes | Yes | Create a note |
| PUT | /api/notes/:id | Yes | Update a note |
| DELETE | /api/notes/:id | Yes | Delete a note |
| DELETE | /auth/user | Yes | Delete your account |
| GET | /health | No | API health check |

## Environment variables

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```
PORT=3000
JWT_SECRET=your_super_secret_key_change_this_in_production
```

## Security considerations

**JWT storage in localStorage**
This app stores JWT tokens in `localStorage`, which is the standard approach for single-page applications. The tradeoff is that localStorage is accessible to JavaScript, meaning a successful XSS (cross-site scripting) attack on the page could read the token. For a portfolio project this is an acceptable choice. In a production app handling sensitive data, the more secure alternative is storing the token in an `httpOnly` cookie, which JavaScript cannot read at all.

**Auth rate limiting**
The `/auth/register` and `/auth/login` endpoints are rate-limited to 10 requests per 15 minutes per IP address. This prevents brute-force and credential-stuffing attacks. The limit is bypassed automatically during test runs.

**Password hashing**
Passwords are hashed with bcrypt (10 salt rounds) before storage. Plain-text passwords are never saved to the database.

## Quality gate

A coverage threshold is enforced automatically on every `git push` via a pre-push hook. The push will be rejected if any of the following drop below **80%**:

- Statement coverage
- Function coverage
- Line coverage
- Branch coverage

This applies to both the frontend and backend independently. All unit tests must also pass. If either check fails, the push is blocked until the issue is resolved.

To run the coverage check manually:

```bash
# Backend
cd backend && npm run test:coverage

# Frontend
cd frontend && npm run test:coverage
```

## Running the tests

### Backend unit tests (Jest)
```bash
cd backend
npm test
```

### Frontend unit tests (Vitest)
```bash
cd frontend
npm test
```

### Automated API tests (Playwright)
```bash
cd backend
npm run test:api
```

### E2E tests (Playwright)
```bash
cd frontend
npm run test:e2e
```

All tests use async/await and explicit waits

## Career context

I have been writing test automation since 2014. My earlier work like the [Hudl Login Test Suite](https://github.com/dj01305/Devin-James-Hudl-Repo) was focused on Java + Selenium WebDriver automation. That repo reflects where I started, and I've written openly about what I'd do differently today.

Club Match Companion represents where I am now: building full-stack applications with quality baked in from the start, with API and E2E tests written alongside the features they cover. Tests are portable, CI-ready, and written with the same async patterns as the application code itself.

## Author

Devin James
