## Requirements

### Requirement: Member can view their own profile

The system SHALL provide a `GET /api/member/me` endpoint that returns the authenticated member's profile information.

#### Scenario: Authenticated member requests profile

- **WHEN** `GET /api/member/me` is called with a valid JWT
- **THEN** the system SHALL return HTTP 200 with `{ "memberId": "...", "email": "...", "name": "...", "createdAt": "..." }`

---
### Requirement: Member can view their registration history

The system SHALL provide a `GET /api/member/registrations` endpoint that returns all rows from the Google Sheets `registrations` worksheet where the `email` column matches the authenticated member's email.

#### Scenario: Member has past registrations

- **WHEN** `GET /api/member/registrations` is called with a valid JWT and the member's email exists in one or more rows of the `registrations` sheet
- **THEN** the system SHALL return HTTP 200 with a JSON array of registration objects, each containing `{ name, email, phone, company, lineId, submittedAt }`

#### Scenario: Member has no registrations

- **WHEN** `GET /api/member/registrations` is called with a valid JWT and no rows in the `registrations` sheet match the member's email
- **THEN** the system SHALL return HTTP 200 with an empty array `[]`

---
### Requirement: Member profile page displays profile and registrations

The frontend SHALL provide a `/member` route accessible only to authenticated users, displaying the member's name, email, registration history, and a member-only content section.

#### Scenario: Authenticated user navigates to /member

- **WHEN** a user with a valid token stored in localStorage navigates to `/member`
- **THEN** the frontend SHALL fetch `/api/member/me` and `/api/member/registrations`, then display the member's name, email, and a list of past registrations

#### Scenario: Unauthenticated user navigates to /member

- **WHEN** a user with no token in localStorage navigates to `/member`
- **THEN** the frontend SHALL redirect to `/login`

#### Scenario: Member-only content section

- **WHEN** an authenticated user is on the `/member` page
- **THEN** the page SHALL display a member-only content section (static content block, e.g., exclusive materials or announcements) that is not visible on the public event page
