## Requirements

### Requirement: Registration automatically creates a member account

When a registration is submitted successfully, the system SHALL create a member account in `server/data/members.json` using the registrant's email as the unique identifier. If an account with that email already exists, the system SHALL skip account creation and use the existing memberId.

#### Scenario: New registrant submits registration

- **WHEN** `POST /api/register` succeeds and no member account exists for the submitted email
- **THEN** the system SHALL create a new member record with a UUID memberId, the registrant's name and email, `isActivated: false`, a UUID `setPasswordToken` valid for 24 hours, and `passwordHash: null`; and SHALL send a set-password email to the registrant's email address

#### Scenario: Existing member submits registration again

- **WHEN** `POST /api/register` succeeds and a member account already exists for the submitted email
- **THEN** the system SHALL NOT create a duplicate account and SHALL return the existing `memberId` in the response

#### Scenario: Registration fails

- **WHEN** `POST /api/register` returns HTTP 400 or HTTP 500
- **THEN** the system SHALL NOT create a member account

---
### Requirement: Member account activation via set-password email

The system SHALL send an email containing a set-password link to the member's email address after account creation. The link SHALL contain a one-time token and expire after 24 hours.

#### Scenario: Member clicks set-password link within 24 hours

- **WHEN** `POST /api/auth/set-password` receives a valid (non-expired) `setPasswordToken` and a `newPassword` of at least 8 characters
- **THEN** the system SHALL hash the password with bcrypt (cost factor 10), store it as `passwordHash`, set `isActivated: true`, clear `setPasswordToken` and `setPasswordTokenExpiry`, and return HTTP 200 `{ "success": true }`

#### Scenario: Member uses expired set-password token

- **WHEN** `POST /api/auth/set-password` receives a token where `setPasswordTokenExpiry` is in the past
- **THEN** the system SHALL return HTTP 400 `{ "error": "Token expired" }` and SHALL NOT update the password

#### Scenario: Member uses invalid set-password token

- **WHEN** `POST /api/auth/set-password` receives a token that does not match any member record
- **THEN** the system SHALL return HTTP 400 `{ "error": "Invalid token" }`

---
### Requirement: Member login with email and password

The system SHALL allow activated members to log in using their email and password, receiving a JWT valid for 7 days.

#### Scenario: Correct credentials submitted

- **WHEN** `POST /api/auth/login` receives an email and password matching an activated member account
- **THEN** the system SHALL return HTTP 200 with `{ "token": "<JWT>", "member": { "memberId", "email", "name" } }`

#### Scenario: Incorrect password submitted

- **WHEN** `POST /api/auth/login` receives an email that exists but the password does not match
- **THEN** the system SHALL return HTTP 401 `{ "error": "Invalid credentials" }`

#### Scenario: Account not yet activated

- **WHEN** `POST /api/auth/login` receives credentials for a member where `isActivated` is false
- **THEN** the system SHALL return HTTP 403 `{ "error": "Account not activated. Check your email to set a password." }`

#### Scenario: Email not found

- **WHEN** `POST /api/auth/login` receives an email that does not exist in members.json
- **THEN** the system SHALL return HTTP 401 `{ "error": "Invalid credentials" }` (same message as wrong password to prevent email enumeration)

---
### Requirement: JWT middleware protects member API routes

All routes under `/api/member/*` SHALL require a valid JWT in the `Authorization: Bearer <token>` header.

#### Scenario: Valid JWT provided

- **WHEN** a request to `/api/member/*` includes a valid, non-expired JWT in the Authorization header
- **THEN** the system SHALL attach `{ memberId, email }` to `req.member` and proceed to the route handler

#### Scenario: Missing or malformed Authorization header

- **WHEN** a request to `/api/member/*` has no Authorization header or the header does not start with `Bearer `
- **THEN** the system SHALL return HTTP 401 `{ "error": "Unauthorized" }` without calling the route handler

#### Scenario: Expired JWT provided

- **WHEN** a request to `/api/member/*` includes a JWT whose `exp` claim is in the past
- **THEN** the system SHALL return HTTP 401 `{ "error": "Token expired" }`
