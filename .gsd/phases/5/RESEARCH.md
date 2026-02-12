# Research: Phase 5 - Dev-Mode Test User Selector

## Context
The current login system requires an email and a hashed password. 
The database is seeded via `server/seed-db.js`.
The frontend `Login.tsx` has a hardcoded button for `test@test.com`.

## Findings
1. **Seeded Users**: The following users are currently in `seed-db.js`:
   - `champ@campus.edu` (No password)
   - `fitness@campus.edu` (No password)
   - `monitor@campus.edu` (No password)
   - `test@test.com` (Has password: `password123`)

2. **Login Controller**: `server/controllers/userController.js` uses `bcrypt.compare`. All users need a hashed password to log in via the standard flow.

3. **Frontend Implementation**: `src/app/pages/Login.tsx` uses a simple `handleSubmit` that posts to `/api/users/login`. The dev login button just sets the state.

## Proposed Strategy
- Standardize all test users to have the password `password123`.
- Update `seed-db.js` to hash and assign this password to all users.
- In `Login.tsx`, create a "Quick Login" section with buttons for:
  - Campus Champ (`champ@campus.edu`)
  - Fitness Freak (`fitness@campus.edu`)
  - Clean Monitor (`monitor@campus.edu`)
  - Dev User (`test@test.com`)
- This allows testing different roles/user states quickly.
