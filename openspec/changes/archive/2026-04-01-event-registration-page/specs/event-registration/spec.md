## ADDED Requirements

### Requirement: Registration form collects required fields

The registration form SHALL include the following fields, all of which are required: name (姓名), email (Email), phone (電話), company (公司), lineId (LINE ID).

#### Scenario: All fields filled and submitted

- **WHEN** a user fills all five fields and clicks the submit button
- **THEN** the system SHALL send a POST request to `/api/register` with the field values as JSON

#### Scenario: Required field is empty on submit

- **WHEN** a user clicks submit with one or more fields empty
- **THEN** the system SHALL display a validation error for each empty field and SHALL NOT send the request

#### Scenario: Email field has invalid format

- **WHEN** a user enters a value that does not match standard email format in the email field and clicks submit
- **THEN** the system SHALL display an email format error and SHALL NOT send the request

### Requirement: Successful registration appends data to Google Sheets

The Node.js API SHALL append a new row to the `registrations` sheet containing: name, email, phone, company, lineId, and a server-generated ISO 8601 timestamp in the `submittedAt` field.

#### Scenario: Valid registration payload received

- **WHEN** `POST /api/register` receives a request body with all five required fields as non-empty strings
- **THEN** the API SHALL append one row to the `registrations` sheet and return HTTP 201 with `{ "success": true }`

#### Scenario: Missing required field in payload

- **WHEN** `POST /api/register` receives a request body with one or more required fields missing or empty
- **THEN** the API SHALL return HTTP 400 with a JSON error object listing the missing fields and SHALL NOT write to the sheet

#### Scenario: Google Sheets write fails

- **WHEN** the Sheets API call returns an error during row append
- **THEN** the API SHALL return HTTP 500 with `{ "error": "Failed to save registration" }` and SHALL NOT return a success response

### Requirement: Frontend shows result feedback after submission

After form submission, the system SHALL display feedback to the user based on the API response.

#### Scenario: Registration succeeds

- **WHEN** `POST /api/register` returns HTTP 201
- **THEN** the system SHALL display a success message and disable further submission of the same form

#### Scenario: Registration fails due to server error

- **WHEN** `POST /api/register` returns HTTP 500
- **THEN** the system SHALL display an error message and re-enable the submit button so the user can retry
