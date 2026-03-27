# Implementation Plan: Club Match Companion

## Overview

Phases 1–3 (project scaffold, authentication, and match notes CRUD) are fully implemented.
This task list covers the remaining work:

- **Phase 4** — Frontend unit tests (Vitest + React Testing Library)
- **Phase 5** — Backend API tests (Supertest + Jest)
- **Phase 6** — Frontend E2E tests (Playwright)
- **Phase 7** — CI/CD pipeline (GitHub Actions) and project README

Tasks marked with `*` are optional property-based tests. They validate correctness rules from the design document and can be skipped for a faster run, but are strongly recommended.

---

## Tasks

- [x] 1. Phase 1 — Project scaffold
  - Monorepo structure, backend Express app, frontend Vite + React app, shared package.json
  - _Requirements: all_

- [x] 2. Phase 2 — Authentication
  - [x] 2.1 Implement POST /auth/register
    - Validates fields, hashes password with bcrypt, inserts user, returns 201
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.2 Implement POST /auth/login
    - Looks up user, runs bcrypt compare, signs and returns JWT + user fields
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 2.3 Implement JWT auth middleware
    - Reads Authorization header, verifies token, attaches req.user, returns 401 on failure
    - _Requirements: 3.1, 3.2_
  - [x] 2.4 Implement GET /api/dashboard
    - Returns authenticated user's name and favoriteClub
    - _Requirements: 3.3, 4.1, 4.2_
  - [x] 2.5 Implement frontend auth (Login, Register pages, AuthContext, ProtectedRoute)
    - Login/Register forms, token stored in localStorage, ProtectedRoute redirects unauthenticated users
    - _Requirements: 3.4, 4.1_

- [x] 3. Phase 3 — Match notes CRUD
  - [x] 3.1 Implement POST /api/notes
    - Validates required fields, inserts note scoped to req.user.id, returns 201 + note
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 3.2 Implement GET /api/notes
    - Returns all notes for the authenticated user, ordered by matchDate descending
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 3.3 Implement PUT /api/notes/:id
    - Validates ownership, applies partial update, returns 200 + updated note or 404
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 3.4 Implement DELETE /api/notes/:id
    - Validates ownership, deletes note, returns 200 or 404
    - _Requirements: 8.1, 8.2_
  - [x] 3.5 Implement frontend Dashboard, NoteForm, NoteCard, useNotes hook
    - Dashboard shows name + club, note list, add/edit/delete actions wired to the API
    - _Requirements: 4.1, 5.1, 6.1, 7.1, 8.1_

- [ ] 4. Phase 4 — Frontend unit tests (Vitest + React Testing Library)
  - [ ] 4.1 Set up Vitest and React Testing Library in the frontend
    - Install dependencies: `cd frontend && npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`
    - Vitest is the test runner — it works natively with Vite so no extra config is needed
    - React Testing Library lets you render components and interact with them like a real user would (clicking buttons, typing in fields, reading text on screen)
    - jsdom is a fake browser environment so tests can run without opening a real browser
    - Add a `test` script to `frontend/package.json`: `"test": "vitest --run"`
    - Update `frontend/vite.config.ts` to add `test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts' }`
    - Create `frontend/src/test/setup.ts` and import `@testing-library/jest-dom` inside it (this adds helpful matchers like `toBeInTheDocument()`)

  - [ ] 4.2 Write unit tests — NoteCard component
    - Create `frontend/src/components/__tests__/NoteCard.test.tsx`
    - NoteCard is the component that displays a single match note on the dashboard
    - Test: renders the note title, club, opponent, and date on screen
    - Test: clicking the Edit button calls the `onEdit` callback
    - Test: clicking the Delete button calls the `onDelete` callback

  - [ ] 4.3 Write unit tests — NoteForm component
    - Create `frontend/src/components/__tests__/NoteForm.test.tsx`
    - NoteForm is the form used to create or edit a match note
    - Test: all input fields are present and empty when the form first loads
    - Test: typing into each field updates its value
    - Test: submitting the form calls the `onSubmit` callback with the correct field values
    - Test: submitting with empty required fields does not call `onSubmit`

  - [ ] 4.4 Write unit tests — ProtectedRoute component
    - Create `frontend/src/components/__tests__/ProtectedRoute.test.tsx`
    - ProtectedRoute is the component that blocks unauthenticated users from accessing the dashboard
    - Test: when a token exists in localStorage, the protected content is rendered
    - Test: when no token exists, the user is redirected to `/login`

  - [ ] 4.5 Write unit tests — useNotes hook
    - Create `frontend/src/hooks/__tests__/useNotes.test.ts`
    - useNotes is a custom hook that handles fetching, creating, updating, and deleting notes by talking to the API
    - Use `vi.mock` to mock axios so tests don't make real network calls — this keeps tests fast and isolated
    - Test: on load, fetches notes from the API and returns them
    - Test: `createNote` calls the correct API endpoint and adds the new note to the list
    - Test: `deleteNote` calls the correct API endpoint and removes the note from the list

  - [ ] 4.6 Checkpoint — run all frontend unit tests
    - Run `cd frontend && npm test` and confirm all tests pass
    - Fix any failures before moving on

- [ ] 5. Phase 5 — Backend API tests (Supertest + Jest)
  - [ ] 5.1 Set up the backend test environment
    - Create `backend/src/__tests__/` folder
    - Add a Jest config to `backend/package.json` (if not already present) that sets `NODE_ENV=test` so tests use an isolated in-memory database
    - Confirm `jest` and `supertest` are already listed in `devDependencies` (they are — no install needed)
    - _Requirements: 9.4_

  - [ ] 5.2 Write auth endpoint tests — register
    - Create `backend/src/__tests__/auth.test.js`
    - Import `createApp` from `src/app.js` and call it in `beforeAll` to get a fresh app instance
    - Test: valid payload → 201 response with a `userId`
    - Test: missing each required field one at a time → 400 with an error message
    - Test: duplicate email → 409 with an error message
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 5.3 Write property test — Property 1: registration always succeeds for valid data
    - Still inside `auth.test.js`
    - Generate 20 random valid payloads (random strings for name, unique email, password, favoriteClub)
    - For each, POST to `/auth/register` and assert HTTP 201
    - Add comment: `// Feature: club-match-companion, Property 1: registration always succeeds for valid data`
    - _Requirements: 1.1_

  - [ ]* 5.4 Write property test — Property 2: registration rejects any missing required field
    - Still inside `auth.test.js`
    - For every combination of one missing field (name, email, password, favoriteClub), POST to `/auth/register` and assert HTTP 400
    - Add comment: `// Feature: club-match-companion, Property 2: registration rejects any missing required field`
    - _Requirements: 1.2_

  - [ ]* 5.5 Write property test — Property 3: passwords are never stored as plain text
    - Still inside `auth.test.js`
    - Register a user, then query the database directly via `db.get()` and assert the stored `passwordHash` does not equal the plain-text password and starts with `$2b$`
    - Add comment: `// Feature: club-match-companion, Property 3: passwords are never stored as plain text`
    - _Requirements: 1.4_

  - [ ] 5.6 Write auth endpoint tests — login
    - Still inside `auth.test.js` (or a new `login.test.js` — your choice)
    - Test: valid credentials → 200 with a `token` and correct `user` fields (name, email, favoriteClub)
    - Test: wrong password → 401
    - Test: unknown email → 401
    - Test: missing email or password → 400
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 5.7 Write property test — Property 4: login round-trip returns correct user data
    - Register N=20 random users, then log each one in and assert the returned `user` fields match what was registered
    - Add comment: `// Feature: club-match-companion, Property 4: login round-trip returns correct user data`
    - _Requirements: 2.1, 4.2_

  - [ ]* 5.8 Write property test — Property 5: login with wrong credentials always returns 401
    - For N=20 registered users, POST to `/auth/login` with a deliberately wrong password and assert HTTP 401 every time
    - Add comment: `// Feature: club-match-companion, Property 5: login with wrong credentials always returns 401`
    - _Requirements: 2.2_

  - [ ] 5.9 Write dashboard endpoint tests
    - Create `backend/src/__tests__/dashboard.test.js`
    - Test: valid JWT → 200 with `name` and `favoriteClub`
    - Test: no Authorization header → 401
    - Test: invalid/expired token → 401
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.10 Write property test — Property 6: missing or invalid token on any protected endpoint returns 401
    - For each protected endpoint (GET /api/dashboard, GET /api/notes, POST /api/notes, PUT /api/notes/:id, DELETE /api/notes/:id), send a request with no token and with a bad token, assert HTTP 401 in all cases
    - Add comment: `// Feature: club-match-companion, Property 6: missing or invalid token on any protected endpoint returns 401`
    - _Requirements: 3.1, 3.2_

  - [ ] 5.11 Write notes endpoint tests — create and read
    - Create `backend/src/__tests__/notes.test.js`
    - Register and log in a user in `beforeAll` to get a valid token
    - Test: POST /api/notes with valid payload → 201 + note object with correct fields
    - Test: POST /api/notes with a missing required field → 400
    - Test: POST /api/notes with no token → 401
    - Test: GET /api/notes with valid token → 200 + array
    - Test: GET /api/notes with no token → 401
    - Test: GET /api/notes when user has no notes → 200 + empty array
    - _Requirements: 5.1, 5.2, 6.1, 6.3_

  - [ ]* 5.12 Write property test — Property 7: note creation round-trip
    - Create N=20 random notes, then GET /api/notes and assert each note appears in the list with matching field values
    - Add comment: `// Feature: club-match-companion, Property 7: note creation round-trip`
    - _Requirements: 5.1, 5.3, 9.6_

  - [ ]* 5.13 Write property test — Property 8: note creation rejects any missing required field
    - For every combination of one missing required field (club, opponent, matchDate, noteTitle), POST to `/api/notes` and assert HTTP 400
    - Add comment: `// Feature: club-match-companion, Property 8: note creation rejects any missing required field`
    - _Requirements: 5.2_

  - [ ]* 5.14 Write property test — Property 9: notes are isolated per user
    - Register two users, create notes for each, then GET /api/notes for each user and assert neither list contains the other user's notes
    - Add comment: `// Feature: club-match-companion, Property 9: notes are isolated per user`
    - _Requirements: 6.2_

  - [ ]* 5.15 Write property test — Property 10: notes are ordered by matchDate descending
    - Create N=10 notes with random matchDate values, GET /api/notes, and assert the returned array is sorted newest-first
    - Add comment: `// Feature: club-match-companion, Property 10: notes are ordered by matchDate descending`
    - _Requirements: 6.1_

  - [ ] 5.16 Write notes endpoint tests — update and delete
    - Still inside `notes.test.js`
    - Test: PUT /api/notes/:id with valid payload → 200 + updated note
    - Test: PUT /api/notes/:id with a note that belongs to a different user → 404
    - Test: PUT /api/notes/:id with a non-existent id → 404
    - Test: DELETE /api/notes/:id → 200 + confirmation message
    - Test: DELETE /api/notes/:id with a note that belongs to a different user → 404
    - Test: DELETE /api/notes/:id with a non-existent id → 404
    - _Requirements: 7.1, 7.2, 8.1, 8.2_

  - [ ]* 5.17 Write property test — Property 11: note update round-trip with partial fields
    - Create a note, then PUT with only a subset of fields, assert updated fields changed and untouched fields kept their original values
    - Add comment: `// Feature: club-match-companion, Property 11: note update round-trip with partial fields`
    - _Requirements: 7.1, 7.3_

  - [ ]* 5.18 Write property test — Property 12: note delete round-trip
    - Create N=10 notes, delete each one, then GET /api/notes and assert the deleted note is no longer in the list
    - Add comment: `// Feature: club-match-companion, Property 12: note delete round-trip`
    - _Requirements: 8.1_

  - [ ] 5.19 Checkpoint — run all backend tests
    - Run `cd backend && npm test` and confirm all tests pass with no errors
    - Fix any failures before moving on
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 6. Phase 6 — Frontend E2E tests (Playwright)
  - [ ] 6.1 Set up Playwright in the frontend
    - Run `cd frontend && npm init playwright@latest` to install Playwright and create `playwright.config.ts`
    - In `playwright.config.ts`, set `baseURL` to `http://localhost:5173` and `screenshot` to `'only-on-failure'`
    - Create a `frontend/e2e/` folder for test files
    - _Requirements: 10.8_

  - [ ] 6.2 Write E2E test — registration journey
    - Create `frontend/e2e/auth.spec.ts`
    - Visit `/register`, fill in name, email, password, and favourite club, submit the form
    - Assert the browser lands on `/dashboard` and the user's name and club are visible on the page
    - _Requirements: 10.1_

  - [ ] 6.3 Write E2E test — login journey
    - Still inside `auth.spec.ts`
    - Visit `/login`, enter the credentials created in the registration test (or a fresh user), submit
    - Assert the browser lands on `/dashboard`
    - _Requirements: 10.2_

  - [ ] 6.4 Write E2E test — unauthenticated redirect
    - Still inside `auth.spec.ts`
    - Open a fresh browser context (no stored token), navigate directly to `/dashboard`
    - Assert the browser is redirected to `/login`
    - _Requirements: 10.3_

  - [ ] 6.5 Write E2E test — logout journey
    - Still inside `auth.spec.ts`
    - Log in, then click the Logout button
    - Assert the browser is redirected to `/login`
    - _Requirements: 10.7_

  - [ ] 6.6 Write E2E test — create a match note
    - Create `frontend/e2e/notes.spec.ts`
    - Log in, click "+ Add Note" (or equivalent button), fill in the note form, submit
    - Assert the new note card appears in the list with the correct title or details
    - _Requirements: 10.4_

  - [ ] 6.7 Write E2E test — edit a match note
    - Still inside `notes.spec.ts`
    - Log in and create a note (or reuse one), click the Edit button on that note, change a field, save
    - Assert the updated value is visible in the note list
    - _Requirements: 10.5_

  - [ ] 6.8 Write E2E test — delete a match note
    - Still inside `notes.spec.ts`
    - Log in and create a note, click the Delete button on that note
    - Assert the note card is no longer visible in the list
    - _Requirements: 10.6_

  - [ ] 6.9 Checkpoint — run all E2E tests
    - Start the backend (`cd backend && npm run dev`) and frontend (`cd frontend && npm run dev`) in separate terminals
    - Run `cd frontend && npx playwright test` and confirm all 7 journeys pass
    - Fix any failures before moving on
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 7. Phase 7 — CI/CD pipeline and README
  - [ ] 7.1 Create the GitHub Actions workflow file
    - Create `.github/workflows/ci.yml`
    - The workflow should trigger on every push and pull request to the `main` branch
    - Steps in order: checkout code → set up Node.js → install backend deps (`cd backend && npm ci`) → run backend tests (`cd backend && npm test`) → install frontend deps (`cd frontend && npm ci`) → run frontend unit tests (`cd frontend && npm test`) → install Playwright browsers → start backend and frontend as background processes → run Playwright tests → upload screenshots as artifacts on failure
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 7.2 Update the project README
    - Update `README.md` at the monorepo root to include how to run frontend unit tests
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ] 7.3 Final checkpoint — verify everything works end to end
    - Confirm `cd backend && npm test` passes
    - Confirm `cd frontend && npm test` passes
    - Confirm `cd frontend && npx playwright test` passes (with servers running)
    - Confirm the GitHub Actions workflow file is valid YAML and all steps reference the correct commands
    - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 11.1, 11.2, 11.3, 11.4, 11.5_

---

## Notes

- Tasks marked with `*` are optional property-based tests — they validate the 12 correctness rules from the design doc and can be skipped for a faster MVP
- Phases 1–3 tasks are pre-checked because the code is already written and working
- Each task references the specific requirement(s) it satisfies so you can trace back to the "why"
- Checkpoints (4.6, 5.19, 6.9, 7.3) are good moments to pause and make sure nothing is broken before moving forward
- The backend test database is automatically isolated — `NODE_ENV=test` makes the app use a fresh in-memory database so your real data is never touched
