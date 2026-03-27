# Club Match Companion

A full-stack web app for football fans to log and manage personal match notes. Built as a portfolio project to demonstrate growth from pure QA automation engineer into an SDET.

---

## What it does

- Register and log in securely with JWT-based authentication
- Create, edit, and delete personal match notes (club, opponent, date, competition)
- Dashboard themed around your favourite club
- Protected routes — only logged-in users can access their notes

---

## Tech stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- React Router (page navigation)
- Axios (HTTP requests)

**Backend**
- Node.js + Express
- SQLite (via sql.js) — file-based database, no setup required
- bcrypt — password hashing
- JSON Web Tokens (JWT) — session authentication

**Testing**
- Playwright — end-to-end UI tests
- Supertest — API integration tests
- Jest — test runner

---

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

---

## Getting started

### Prerequisites

- Node.js v18+
- npm

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd club-match-companion
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
# Open .env and set a strong JWT_SECRET value
npm install
npm run dev
```

The API will start on `http://localhost:3001`

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will open on `http://localhost:5173`

---

## API endpoints

| Method | Endpoint       | Auth required | Description         |
|--------|----------------|---------------|---------------------|
| POST   | /auth/register | No            | Create an account   |
| POST   | /auth/login    | No            | Log in, receive JWT |
| GET    | /api/notes     | Yes           | Get all your notes  |
| POST   | /api/notes     | Yes           | Create a note       |
| PUT    | /api/notes/:id | Yes           | Update a note       |
| DELETE | /api/notes/:id | Yes           | Delete a note       |
| GET    | /health        | No            | API health check    |

---

## Environment variables

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```
PORT=3001
JWT_SECRET=your_super_secret_key_change_this_in_production
```

---

## Running the tests

**API tests (Supertest)**
```bash
cd backend
npm test
```

**E2E tests (Playwright)**
```bash
cd frontend
npx playwright test
```

All tests use `async/await` and explicit waits. No `Thread.sleep`.

---

## Career context

I have been writing test automation since 2014. My earlier work — like the [Hudl Login Test Suite](https://github.com/dj01305/Devin-James-Hudl-Repo) — was focused on Java + Selenium WebDriver automation. That repo reflects where I started, and I've written openly about what I'd do differently today.

Club Match Companion represents where I am now: building full-stack applications with quality baked in from the start. The shift isn't just in language or framework — it's in how I think about software. Tests are portable, CI-ready, and written with the same async patterns as the application code itself.

---

## Author

Devin James
