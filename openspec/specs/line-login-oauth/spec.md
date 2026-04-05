# line-login-oauth Specification

## Purpose

TBD - created by archiving change 'pre-event-notification-line-gmail'. Update Purpose after archive.

## Requirements

### Requirement: Registration form initiates LINE Login OAuth to obtain lineUserId

The registration form SHALL display a "以 LINE 登入" button instead of a lineId text input field. When clicked, the system SHALL redirect the user to the LINE OAuth authorization URL with `response_type=code`, `client_id=LINE_LOGIN_CLIENT_ID`, `redirect_uri=<CLIENT_ORIGIN>/line-callback`, `scope=profile`, and a random `state` value. LINE Login authorization SHALL be mandatory — the form submit button SHALL be disabled until LINE Login is completed.

#### Scenario: User clicks LINE Login button

- **WHEN** a user clicks "以 LINE 登入" on the registration form
- **THEN** the system SHALL redirect the browser to the LINE OAuth authorization URL with the correct parameters

#### Scenario: LINE Login not yet completed

- **WHEN** a user attempts to submit the registration form without completing LINE Login
- **THEN** the submit button SHALL remain disabled and the form SHALL display "請先完成 LINE 授權" prompt


<!-- @trace
source: pre-event-notification-line-gmail
updated: 2026-04-04
code:
  - client/.env.example
  - client/src/pages/LineCallbackPage.jsx
  - client/src/components/RegistrationForm.jsx
  - client/src/App.jsx
  - server/package.json
  - server/sheets.js
  - client/src/pages/LoginPage.jsx
  - server/.env.example
  - client/vercel.json
  - 活動報名系統-功能模板.md
  - client/src/AdminContext.jsx
  - client/src/pages/FacebookCallbackPage.jsx
  - server/index.js
  - server/line.js
  - server/mailer.js
  - client/src/pages/AdminPage.jsx
-->

---
### Requirement: Backend exchanges LINE authorization code for lineUserId

The `POST /api/auth/line/callback` endpoint SHALL accept `{ code: string, redirectUri: string }`. It SHALL send a POST request to `https://api.line.me/oauth2/v2.1/token` with `grant_type=authorization_code`, `code`, `redirect_uri`, `client_id=LINE_LOGIN_CLIENT_ID`, and `client_secret=LINE_LOGIN_CLIENT_SECRET` to obtain an `access_token`. It SHALL then GET `https://api.line.me/v2/profile` with the access token to retrieve `userId` and `displayName`. The endpoint SHALL return `{ lineUserId: string, displayName: string }`.

#### Scenario: Valid authorization code provided

- **WHEN** `POST /api/auth/line/callback` is called with a valid `code` and matching `redirectUri`
- **THEN** the system SHALL return `{ lineUserId: "Uxxxxxxxx...", displayName: "使用者名稱" }` with HTTP 200

#### Scenario: Invalid or expired authorization code

- **WHEN** `POST /api/auth/line/callback` is called with an invalid or expired `code`
- **THEN** the system SHALL return HTTP 400 with `{ error: "LINE authorization failed" }`


<!-- @trace
source: pre-event-notification-line-gmail
updated: 2026-04-04
code:
  - client/.env.example
  - client/src/pages/LineCallbackPage.jsx
  - client/src/components/RegistrationForm.jsx
  - client/src/App.jsx
  - server/package.json
  - server/sheets.js
  - client/src/pages/LoginPage.jsx
  - server/.env.example
  - client/vercel.json
  - 活動報名系統-功能模板.md
  - client/src/AdminContext.jsx
  - client/src/pages/FacebookCallbackPage.jsx
  - server/index.js
  - server/line.js
  - server/mailer.js
  - client/src/pages/AdminPage.jsx
-->

---
### Requirement: Authorized LINE identity is shown in registration form and submitted with registration

After successful LINE Login, the registration form SHALL display the LINE display name with a green checkmark (e.g., "✓ 已授權：{displayName}") and store `lineUserId` in component state. When the registration form is submitted, `lineUserId` SHALL be included in the POST body sent to `POST /api/register`. The `POST /api/register` endpoint SHALL accept `lineUserId` in place of `lineId` and pass it to `appendRegistration`.

#### Scenario: LINE Login completed before form submit

- **WHEN** a user completes LINE Login and then submits the registration form
- **THEN** the POST body SHALL contain `lineUserId` and the server SHALL write it to column J of the registrations sheet

#### Scenario: lineUserId missing from registration POST

- **WHEN** `POST /api/register` receives a body without `lineUserId`
- **THEN** the server SHALL return HTTP 400 with `{ error: "Missing lineUserId" }`


<!-- @trace
source: pre-event-notification-line-gmail
updated: 2026-04-04
code:
  - client/.env.example
  - client/src/pages/LineCallbackPage.jsx
  - client/src/components/RegistrationForm.jsx
  - client/src/App.jsx
  - server/package.json
  - server/sheets.js
  - client/src/pages/LoginPage.jsx
  - server/.env.example
  - client/vercel.json
  - 活動報名系統-功能模板.md
  - client/src/AdminContext.jsx
  - client/src/pages/FacebookCallbackPage.jsx
  - server/index.js
  - server/line.js
  - server/mailer.js
  - client/src/pages/AdminPage.jsx
-->

---
### Requirement: lineUserId is stored in registrations sheet column J

`appendRegistration` SHALL write `lineUserId` to column J of the registrations sheet row. `getAllRegistrations` SHALL read column J and include `lineUserId` in each returned registration object.

#### Scenario: Registration appended with lineUserId

- **WHEN** `appendRegistration` is called with a valid `lineUserId`
- **THEN** column J of the new row SHALL contain the `lineUserId` string

#### Scenario: getAllRegistrations returns lineUserId

- **WHEN** `getAllRegistrations` is called
- **THEN** each registration object SHALL include a `lineUserId` field read from column J (empty string if blank)

<!-- @trace
source: pre-event-notification-line-gmail
updated: 2026-04-04
code:
  - client/.env.example
  - client/src/pages/LineCallbackPage.jsx
  - client/src/components/RegistrationForm.jsx
  - client/src/App.jsx
  - server/package.json
  - server/sheets.js
  - client/src/pages/LoginPage.jsx
  - server/.env.example
  - client/vercel.json
  - 活動報名系統-功能模板.md
  - client/src/AdminContext.jsx
  - client/src/pages/FacebookCallbackPage.jsx
  - server/index.js
  - server/line.js
  - server/mailer.js
  - client/src/pages/AdminPage.jsx
-->