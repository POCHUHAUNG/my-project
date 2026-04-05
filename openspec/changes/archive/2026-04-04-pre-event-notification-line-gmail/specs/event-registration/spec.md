## MODIFIED Requirements

### Requirement: Registration form collects required fields

The registration form SHALL include the following fields, all of which are required: name (姓名), email (Email), phone (電話), company (公司). The lineId text input field SHALL be removed. In its place, the form SHALL include a LINE Login OAuth button (see `line-login-oauth` spec) that is mandatory — the form SHALL NOT submit until LINE Login is completed and a `lineUserId` is obtained.

#### Scenario: All fields filled and LINE Login completed

- **WHEN** a user fills name, email, phone, and company fields and completes LINE Login
- **THEN** the system SHALL enable the submit button and send a POST request to `/api/register` with `{ name, email, phone, company, lineUserId }` as JSON

#### Scenario: Required field is empty on submit

- **WHEN** a user clicks submit with one or more of the four text fields empty
- **THEN** the system SHALL display a validation error for each empty field and SHALL NOT send the request

#### Scenario: Email field has invalid format

- **WHEN** a user enters a value that does not match standard email format in the email field and clicks submit
- **THEN** the system SHALL display an email format error and SHALL NOT send the request

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
