# Requirements Document

## Introduction

Club Match Companion is a full-stack web application that lets football fans register an account, choose their favourite club, and keep personal match notes tied to that club. Users can create, view, edit, and delete notes for any match they have watched or want to remember.

The application is built as a monorepo with a React/TypeScript frontend (Vite, React Router) and a Node.js/Express backend (SQLite, JWT authentication, bcrypt password hashing). Phases 1–3 (project scaffold, authentication, dashboard and match notes CRUD) are complete. This document covers the full feature set and tracks the remaining work: backend API tests (Phase 4), frontend E2E tests (Phase 4), and CI/CD pipeline with README (Phase 5).

---

## Glossary

- **System**: The Club Match Companion application as a whole.
- **API**: The Express backend that handles HTTP requests from the frontend.
- **Auth_Service**: The part of the backend responsible for registration and login.
- **Notes_Service**: The part of the backend responsible for creating, reading, updating, and deleting match notes.
- **Dashboard**: The protected frontend page shown to a logged-in user.
- **JWT**: JSON Web Token — a short-lived credential the backend issues on login and the frontend sends with every protected request.
- **ProtectedRoute**: A frontend component that redirects unauthenticated users to the login page.
- **Supertest**: A Node.js library used to send HTTP requests to the API in automated tests without starting a real server.
- **Playwright**: A browser automation tool used to run end-to-end tests that simulate real user actions in a browser.
- **CI**: Continuous Integration — automated checks (tests, linting) that run on every push or pull request via GitHub Actions.
- **MatchNote**: A record storing a user's notes about a specific football match.
- **FavoriteClub**: The football club a user selects at registration, shown on their dashboard.

---

## Requirements

### Requirement 1: User Registration

**User Story:** As a new visitor, I want to create an account with my name, email, password, and favourite club, so that I can access my personal dashboard.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/auth/register` with valid `name`, `email`, `password`, and `favoriteClub` fields, THE Auth_Service SHALL create a new user record and return HTTP 201.
2. WHEN a POST request is sent to `/auth/register` with a missing required field, THE Auth_Service SHALL return HTTP 400 with a descriptive error message.
3. WHEN a POST request is sent to `/auth/register` with an email that already exists, THE Auth_Service SHALL return HTTP 409 with an error message.
4. THE Auth_Service SHALL store the user's password as a bcrypt hash and SHALL NOT store the plain-text password.

---

### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I receive a token that lets me access protected pages.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/auth/login` with a valid email and password, THE Auth_Service SHALL return HTTP 200 with a JWT and the user's `id`, `name`, `email`, and `favoriteClub`.
2. WHEN a POST request is sent to `/auth/login` with an incorrect password or unknown email, THE Auth_Service SHALL return HTTP 401 with a generic error message.
3. WHEN a POST request is sent to `/auth/login` with a missing `email` or `password` field, THE Auth_Service SHALL return HTTP 400 with a descriptive error message.
4. THE Auth_Service SHALL run bcrypt password comparison even when the email is not found, so that response time does not reveal whether an email is registered.

---

### Requirement 3: Protected Route Access

**User Story:** As a logged-in user, I want my JWT to be verified on every protected request, so that unauthenticated users cannot access my data.

#### Acceptance Criteria

1. WHEN a request is sent to any `/api/*` endpoint without an `Authorization` header, THE API SHALL return HTTP 401.
2. WHEN a request is sent to any `/api/*` endpoint with an expired or invalid JWT, THE API SHALL return HTTP 401.
3. WHEN a request is sent to `/api/dashboard` with a valid JWT, THE API SHALL return HTTP 200 with the authenticated user's `name` and `favoriteClub`.
4. WHILE a user is not authenticated, THE ProtectedRoute SHALL redirect the user to the login page.

---

### Requirement 4: Favourite Club Display

**User Story:** As a logged-in user, I want to see my favourite club on my dashboard, so that the app feels personalised to me.

#### Acceptance Criteria

1. WHEN a user logs in successfully, THE Dashboard SHALL display the user's `name` and `favoriteClub`.
2. THE System SHALL persist the `favoriteClub` value in the user record and return it in every login response.

---

### Requirement 5: Match Notes — Create

**User Story:** As a logged-in user, I want to add a match note with details about a game, so that I can keep a record of matches I care about.

#### Acceptance Criteria

1. WHEN a POST request is sent to `/api/notes` with valid `club`, `opponent`, `matchDate`, and `noteTitle` fields and a valid JWT, THE Notes_Service SHALL create a new MatchNote record and return HTTP 201 with the created note.
2. WHEN a POST request is sent to `/api/notes` with a missing required field (`club`, `opponent`, `matchDate`, or `noteTitle`), THE Notes_Service SHALL return HTTP 400 with a descriptive error message.
3. THE Notes_Service SHALL associate the new MatchNote with the authenticated user's `id`.

---

### Requirement 6: Match Notes — Read

**User Story:** As a logged-in user, I want to see all my match notes on the dashboard, so that I can review what I have written.

#### Acceptance Criteria

1. WHEN a GET request is sent to `/api/notes` with a valid JWT, THE Notes_Service SHALL return HTTP 200 with an array of MatchNote records belonging to the authenticated user, ordered by `matchDate` descending.
2. THE Notes_Service SHALL return only notes that belong to the authenticated user and SHALL NOT return notes belonging to other users.
3. WHEN a user has no notes, THE Notes_Service SHALL return HTTP 200 with an empty array.

---

### Requirement 7: Match Notes — Update

**User Story:** As a logged-in user, I want to edit an existing match note, so that I can correct or add to what I wrote.

#### Acceptance Criteria

1. WHEN a PUT request is sent to `/api/notes/:id` with a valid JWT and the note belongs to the authenticated user, THE Notes_Service SHALL update the note and return HTTP 200 with the updated MatchNote.
2. WHEN a PUT request is sent to `/api/notes/:id` where the note does not exist or belongs to a different user, THE Notes_Service SHALL return HTTP 404.
3. THE Notes_Service SHALL apply partial updates, preserving existing field values for any fields not included in the request body.

---

### Requirement 8: Match Notes — Delete

**User Story:** As a logged-in user, I want to delete a match note I no longer need, so that my list stays relevant.

#### Acceptance Criteria

1. WHEN a DELETE request is sent to `/api/notes/:id` with a valid JWT and the note belongs to the authenticated user, THE Notes_Service SHALL delete the note and return HTTP 200 with a confirmation message.
2. WHEN a DELETE request is sent to `/api/notes/:id` where the note does not exist or belongs to a different user, THE Notes_Service SHALL return HTTP 404.

---

### Requirement 9: Backend API Tests

**User Story:** As a developer, I want automated API tests for every endpoint, so that I can catch regressions quickly and demonstrate backend quality.

#### Acceptance Criteria

1. THE System SHALL include Supertest-based API tests covering all auth endpoints (`POST /auth/register`, `POST /auth/login`).
2. THE System SHALL include Supertest-based API tests covering all notes endpoints (`GET /api/notes`, `POST /api/notes`, `PUT /api/notes/:id`, `DELETE /api/notes/:id`).
3. THE System SHALL include Supertest-based API tests covering the dashboard endpoint (`GET /api/dashboard`).
4. WHEN the API tests are run, THE System SHALL use an isolated in-memory or temporary test database so that test data does not affect the development database.
5. WHEN an API test sends a request with invalid or missing data, THE System SHALL assert that the response status and error message match the expected values defined in Requirements 1–8.
6. FOR ALL MatchNote records created and then retrieved in the same test session, THE Notes_Service SHALL return the same field values that were submitted (round-trip property).

---

### Requirement 10: Frontend End-to-End Tests

**User Story:** As a developer, I want automated browser tests that simulate real user journeys, so that I can verify the full stack works together correctly.

#### Acceptance Criteria

1. THE System SHALL include a Playwright E2E test that covers the full registration flow: visiting the register page, filling in the form, submitting, and landing on the dashboard.
2. THE System SHALL include a Playwright E2E test that covers the full login flow: visiting the login page, entering valid credentials, and landing on the dashboard.
3. THE System SHALL include a Playwright E2E test that verifies an unauthenticated user is redirected to the login page when attempting to access the dashboard directly.
4. THE System SHALL include a Playwright E2E test that covers creating a match note: clicking "Add Note", filling in the form, submitting, and seeing the new note appear in the list.
5. THE System SHALL include a Playwright E2E test that covers editing a match note: clicking edit on an existing note, changing a field, saving, and seeing the updated value in the list.
6. THE System SHALL include a Playwright E2E test that covers deleting a match note: clicking delete on an existing note and confirming the note is removed from the list.
7. THE System SHALL include a Playwright E2E test that covers the logout flow: clicking logout and being redirected to the login page.
8. IF a Playwright test fails, THE System SHALL capture a screenshot and attach it to the test report.

---

### Requirement 11: CI/CD Pipeline

**User Story:** As a developer, I want automated checks to run on every push and pull request, so that broken code is caught before it reaches the main branch.

#### Acceptance Criteria

1. THE System SHALL include a GitHub Actions workflow file that triggers on every push and pull request to the `main` branch.
2. WHEN the CI workflow runs, THE System SHALL install dependencies for both the backend and frontend.
3. WHEN the CI workflow runs, THE System SHALL execute the backend API tests and report pass or fail.
4. WHEN the CI workflow runs, THE System SHALL execute the frontend E2E tests and report pass or fail.
5. IF any test step fails, THE System SHALL mark the workflow run as failed so the failure is visible in the pull request.

---

### Requirement 12: Project README

**User Story:** As a visitor to the repository, I want a clear README, so that I can understand what the project does and how to run it locally.

#### Acceptance Criteria

1. THE System SHALL include a `README.md` at the monorepo root that describes the purpose of the application.
2. THE README SHALL include step-by-step instructions for installing dependencies and running the backend and frontend locally.
3. THE README SHALL include instructions for running the backend API tests and the frontend E2E tests.
4. THE README SHALL list the main technologies used (React, TypeScript, Vite, Node.js, Express, SQLite, JWT, Playwright, Supertest, GitHub Actions).
