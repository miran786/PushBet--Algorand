---
phase: 4
plan: 4.1
wave: 1
---

# Plan 4.1: Fix Dev Login & Server Error

## Objective
Enable the "DEV LOGIN" functionality by fixing the "Server error" (500) and seeding the missing test user (`test@test.com`).
The 500 error suggests a database connection issue or unhandled exception, while the 400 error (Invalid credentials) would be expected if the user simply didn't exist. We will address both.

## Context
- `src/pages/Login.tsx` (Frontend expects `test@test.com` / `password123`)
- `server/seed-db.js` (Currently missing this user)
- `server/controllers/userController.js` (Login logic)
- `server/server.js` (Express & DB connection)

## Tasks

<task type="auto">
  <name>Update Seed Script</name>
  <files>server/seed-db.js</files>
  <action>
    Update `server/seed-db.js` to include the Dev Test User:
    - Email: `test@test.com`
    - Password: `password123` (Must be hashed using `bcryptjs` before saving, or update the script to use `User.create`/`save` hooks if they handle hashing. `userController.js` uses `bcrypt.hash`, so seed script probably needs to too).
    - Username: `Dev_Test_User`
    - WalletAddress: `ALGO_DEV_TEST_ADDR`
    - Funds: 1000
    
    *Implementation Detail*: Import `bcryptjs` in seed script and hash the password.
  </action>
  <verify>Run `node server/seed-db.js` and check console for success.</verify>
  <done>Script runs without error and "Database seeded successfully" is printed.</done>
</task>

<task type="auto">
  <name>Update Seed Script</name>
  <files>server/seed-db.js</files>
  <action>
    Update `server/seed-db.js` to include the Dev Test User:
    - Email: `test@test.com`
    - Password: `password123` (Must be hashed using `bcryptjs` before saving).
    - Username: `Dev_Test_User`
    - WalletAddress: `ALGO_DEV_TEST_ADDR`
    - Funds: 1000
    
    *Implementation Detail*: Import `bcryptjs` in seed script and hash the password.
  </action>
  <verify>Run `node server/seed-db.js` and check console for success.</verify>
  <done>Script runs without error and "Database seeded successfully" is printed. (Completed)</done>
</task>

<task type="auto">
  <name>Verify Server & DB Connection</name>
  <files>server/server.js</files>
  <action>
    Create a diagnostic script `server/check_db.js` to explicitly test the MongoDB connection using the URI from `.env`.
    This will help confirm if the 500 error is due to connection failure.
  </action>
  <verify>node server/check_db.js</verify>
  <done>Connection successful message.</done>
</task>

<task type="auto">
  <name>Test Login Endpoint</name>
  <files>scripts/test_login.cjs</files>
  <action>
    Create a script `scripts/test_login.cjs` to POST to `http://localhost:8000/api/users/login` with the test credentials.
    This verifies the fix without needing the frontend.
  </action>
  <verify>node scripts/test_login.cjs</verify>
  <done>Response status is 200 and includes a token. (Completed)</done>
</task>

## Success Criteria
- [x] MongoDB connection verified.
- [x] Dev User seeded in database.
- [x] Login endpoint returns 200 for `test@test.com`.
