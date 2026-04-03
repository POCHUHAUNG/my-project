## ADDED Requirements

### Requirement: Registration form requires authentication

The registration form SHALL check for a valid JWT token in localStorage before allowing submission. Unauthenticated users SHALL be redirected to the login page, and their form data SHALL be preserved across the login flow.

#### Scenario: Authenticated user submits registration

- **WHEN** a user with a valid token in localStorage submits the registration form
- **THEN** the frontend SHALL include the `Authorization: Bearer <token>` header in the `POST /api/register` request and proceed normally

#### Scenario: Unauthenticated user attempts to submit registration

- **WHEN** a user with no token in localStorage clicks the registration submit button
- **THEN** the frontend SHALL save the current form field values to `sessionStorage` under the key `pendingRegistration`, then redirect to `/login`

#### Scenario: User returns to registration after login

- **WHEN** a user lands on the registration page after successfully logging in and `sessionStorage.pendingRegistration` exists
- **THEN** the frontend SHALL restore the saved form field values, clear `sessionStorage.pendingRegistration`, and focus the submit button

### Requirement: Login page supports post-login redirect

The login page SHALL accept a `redirect` query parameter. After successful login, the frontend SHALL navigate to the URL specified in the `redirect` parameter instead of the default destination.

#### Scenario: Login from registration page redirect

- **WHEN** the user is redirected to `/login?redirect=/` from the registration guard
- **THEN** after successful login the frontend SHALL navigate to `/` (the event page with the registration form)

#### Scenario: Login without redirect parameter

- **WHEN** the user navigates to `/login` without a `redirect` query parameter
- **THEN** after successful login the frontend SHALL navigate to `/member`
