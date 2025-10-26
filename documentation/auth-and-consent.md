# Authentication & Consent Flows

## Credentials-Based Auth
- **Provider:** NextAuth Credentials (`lib/auth.js`).
- **Identifiers:** Users can sign in with either email or Instagram handle (with or without `@`).
- **Passwords:** Bcrypt hashed with 12 salt rounds (`lib/password.js`).
- **Session strategy:** JWT; session object enriched with `id`, `role`, and `instagramHandle`.
- **Protected routes:** Server components fetch sessions via `getServerSession(authOptions)`; unauthenticated users are redirected (e.g., `/dashboard`, `/profile`, `/admin`).

### Registration Flow
1. **UI:** `components/AuthForm.js` collects email, Instagram handle, password, full name, optional preferred name/phone, and all consents.
2. **Validation:** Client uses Zod schema (`registerValidation`) mirroring `registerSchema`.
3. **API:** `POST /api/register` parses payload with `registerSchema` and creates user with consent metadata.
4. **Auto-login:** After successful creation, the form calls `signIn` silently and redirects to `/dashboard`.
5. **Data stored on User:** All boolean consents, `termsSignedAt`, and `consentUpdatedAt` set at registration time.

### Login Flow
1. **Form:** `LoginForm` accepts email/Instagram handle + password.
2. **Authentication:** NextAuth checks credentials and loads user via Prisma.
3. **Session:** Session data includes `user.id`, `role`, and `instagramHandle` for navigation.

## Consent Lifecycle

### Storage
- All consent booleans live on the `User` record.
- `termsAgreed` signals that all guideline flags are `true`.
- `termsSignedAt` captures the latest acknowledgement timestamp.
- `consentUpdatedAt` tracks the most recent profile update.

### Updating Consents
- **Profile Page:** `/profile` renders `ProfileForm`, prefilled from Prisma.
- **API:** `PATCH /api/profile` validates payload via `profileUpdateSchema` and updates the user row.
- **UI Feedback:** Form displays success/error messaging and shows last updated timestamp.
- **LLM note:** Whenever profile consent fields change, update `profileUpdateSchema`, `ProfileForm`, and relevant documentation.

### RSVP Requirements
- `POST /api/events/{eventId}/signup` checks:
  1. User is authenticated.
  2. `termsAgreed` is `true` (rejects with guidance to update profile if not).
  3. Signup deadline and capacity constraints.
  4. Whether an RSVP already exists.
- If valid, creates an `EventSignup` record, optionally storing `specialRequests`.
- `DELETE /api/events/{eventId}/signup` removes the RSVP, surfacing user-friendly messages when nothing is found.

### Special Requests
- Optional per-RSVP notes (e.g., dietary needs) can be supplied via the RSVP UI.
- Stored only on `EventSignup.specialRequests`.
- Members can add/remove notes each time they reserve a spot.

## Admin Access Control
- Admins identified by `user.role === 'ADMIN'`.
- Navbar shows an `Admin` link for admins only.
- `requireAuth('ADMIN')` helper (in `lib/auth.js`) is used by admin API routes to guard create/update/delete actions.

## Session Security Notes
- **`NEXTAUTH_SECRET`:** Must be set in all environments; used to sign JWTs.
- **Callback behaviour:** `session` callback injects `role`, `instagramHandle`, `id` into session for easy access.
- **Logout:** Uses `signOut({ callbackUrl: '/' })` returning user to home page.

## Password Resets (Future Work)
- Not implemented. Adding resets would require:
  - Password reset tokens table.
  - Email infrastructure or alternative verification method.
  - Update to registration/login docs.

## LLM Guidance
- When modifying authentication (e.g., adding OAuth providers), update:
  - `lib/auth.js`
  - `components/AuthForm.js` and `app/login/page.js`
  - This document (new flows, required fields)
  - `documentation/architecture.md` if stack changes.
- Any consent schema change must be reflected in:
  - Prisma schema & migrations.
  - `registerSchema` / `profileUpdateSchema`.
  - `AuthForm`, `ProfileForm`, `EventSignupButton` (if RSVP requirements change).
  - `documentation/data-model.md` and this file.***
