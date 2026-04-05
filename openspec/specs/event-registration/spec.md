## Requirements

### Requirement: Registration form collects required fields

The registration form SHALL include the following fields, all of which are required: name (姓名), email (Email), phone (電話), company (公司). The form SHALL support LINE Login OAuth, Google Sign-In, and Facebook Login as authentication options — the form SHALL NOT submit until one of the three auth providers is completed and an auth ID (`lineUserId`, `googleId`, or `facebookId`) is obtained. The event-info sheet column I stores `fieldConfig` (JSON) for field hints and custom fields. Column J stores `forms` (JSON array) for Google Forms configurations. The `GET /api/event` response SHALL include both `fieldConfig` and `forms` fields.

#### Scenario: All fields filled and auth completed

- **WHEN** a user fills name, email, phone, and company fields and completes any one of LINE Login, Google Sign-In, or Facebook Login
- **THEN** the system SHALL enable the submit button and send a POST request to `/api/register` with `{ name, email, phone, company, lineUserId|googleId|facebookId, extraFields }` as JSON

#### Scenario: GET /api/event returns forms configuration

- **WHEN** GET /api/event is called
- **THEN** the response SHALL include `{ title, date, location, description, imageUrl, dmUrl, agendaTagEn, agendaTagZh, fieldConfig, forms }` where `forms` is an array (empty if unconfigured)


<!-- @trace
source: form-tracking-prefill-links
updated: 2026-04-04
code:
  - server/sheets.js
  - client/vercel.json
  - client/src/AdminContext.jsx
  - client/src/pages/LoginPage.jsx
  - client/.env.example
  - 活動報名系統-功能模板.md
  - server/package.json
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LineCallbackPage.jsx
  - server/index.js
-->

---
### Requirement: Successful registration appends data to Google Sheets

The Node.js API SHALL append a new row to the `registrations` sheet containing: name, email, phone, company, `lineUserId` (column G), a server-generated ISO 8601 timestamp in the `submittedAt` field (column H), the `memberId` of the member account created or matched during this registration (column B), checkinToken (column I), and `lineUserId` again in column J. The `POST /api/register` endpoint SHALL require `lineUserId` in the request body; if absent, it SHALL return HTTP 400 with `{ error: "Missing lineUserId" }`.

#### Scenario: Valid registration payload received

- **WHEN** `POST /api/register` receives a request body with name, email, phone, company, and lineUserId as non-empty strings
- **THEN** the API SHALL append one row to the registrations sheet (including lineUserId in column J) and return HTTP 201 with `{ "success": true, "memberId": "<uuid>" }`

#### Scenario: Missing required field in payload

- **WHEN** `POST /api/register` receives a request body with one or more required fields missing or empty
- **THEN** the API SHALL return HTTP 400 with a JSON error object listing the missing fields and SHALL NOT write to the sheet

#### Scenario: Google Sheets write fails

- **WHEN** the Sheets API call returns an error during row append
- **THEN** the API SHALL return HTTP 500 with `{ "error": "Failed to save registration" }` and SHALL NOT return a success response


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
### Requirement: Frontend shows result feedback after submission

After form submission, the system SHALL display feedback to the user based on the API response.

#### Scenario: Registration succeeds

- **WHEN** `POST /api/register` returns HTTP 201
- **THEN** the system SHALL display a success message and disable further submission of the same form

#### Scenario: Registration fails due to server error

- **WHEN** `POST /api/register` returns HTTP 500
- **THEN** the system SHALL display an error message and re-enable the submit button so the user can retry

---
### Requirement: Registration form validates all required fields before submission

The registration form SHALL validate all five fields (name, email, phone, company, lineId) on submit. If any field is empty, the system SHALL: (1) display a red error summary box at the top of the form listing all missing fields, (2) display an inline error message below each missing field, (3) highlight the missing field's input with a red border, (4) scroll to the first invalid field, and (5) prevent the POST request from being sent. Each field label SHALL display a red asterisk (`*`) to indicate it is required.

#### Scenario: All fields empty on submit

- **WHEN** a user clicks submit without filling any field
- **THEN** the system SHALL display a red summary box listing all 5 missing fields, highlight all inputs with red borders, and scroll to the name field

#### Scenario: Single field missing

- **WHEN** a user fills 4 out of 5 fields and clicks submit
- **THEN** the system SHALL show the error summary listing only the missing field and scroll to it

#### Scenario: Error clears on input

- **WHEN** a user types into a field that previously showed an error
- **THEN** the inline error message and red border for that field SHALL be removed immediately

<!-- @trace
source: add-admin-panel-and-enhancements
updated: 2026-04-04
code:
  - 活動報名系統-功能模板.md
  - client/src/App.jsx
  - client/src/AdminContext.jsx
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LoginPage.jsx
  - client/vercel.json
-->