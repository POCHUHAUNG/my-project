## ADDED Requirements

### Requirement: Admin page requires password authentication

The system SHALL protect the `/admin` route with a password. The password SHALL be stored in `process.env.ADMIN_PASSWORD`. Every admin API request SHALL include an `x-admin-password` header. The server SHALL return HTTP 401 if the header is missing or incorrect.

#### Scenario: Correct password entered

- **WHEN** a user submits the correct password on the `/admin` login form
- **THEN** the system SHALL fetch the member list and display the admin dashboard

#### Scenario: Incorrect password entered

- **WHEN** a user submits an incorrect password
- **THEN** the system SHALL display an error message "密碼錯誤" and remain on the login form

### Requirement: Admin can view all members with company name

The `GET /api/admin/members` endpoint SHALL return all members from `members.json`, excluding `passwordHash`, `setPasswordToken`, and `setPasswordTokenExpiry` fields. Each member record SHALL include a `company` field populated by cross-referencing the `registrations` Google Sheet (column D = email, column F = company).

#### Scenario: Member has a registration record

- **WHEN** a member's email exists in the registrations sheet
- **THEN** the system SHALL include the company from column F in the member record

#### Scenario: Member has no registration record

- **WHEN** a member's email does not exist in the registrations sheet
- **THEN** the system SHALL return `company: ""` for that member

### Requirement: Admin can delete individual members

The `DELETE /api/admin/members/:memberId` endpoint SHALL remove the member with the matching `memberId` from `members.json`. The system SHALL return HTTP 404 if the memberId does not exist.

#### Scenario: Valid memberId deleted

- **WHEN** DELETE is called with an existing memberId
- **THEN** the member SHALL be removed from members.json and the response SHALL be `{ success: true }`

### Requirement: Admin can clear all members

The `DELETE /api/admin/members` endpoint SHALL overwrite `members.json` with an empty array `[]`.

#### Scenario: Clear all triggered

- **WHEN** DELETE is called on `/api/admin/members` with valid admin password
- **THEN** members.json SHALL contain `[]` and the response SHALL be `{ success: true }`
