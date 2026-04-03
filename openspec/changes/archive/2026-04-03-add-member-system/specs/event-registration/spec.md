## MODIFIED Requirements

### Requirement: Successful registration appends data to Google Sheets

The Node.js API SHALL append a new row to the `registrations` sheet containing: name, email, phone, company, lineId, a server-generated ISO 8601 timestamp in the `submittedAt` field, and the `memberId` of the member account created or matched during this registration.

#### Scenario: Valid registration payload received

- **WHEN** `POST /api/register` receives a request body with all five required fields as non-empty strings
- **THEN** the API SHALL append one row to the `registrations` sheet (including `memberId`) and return HTTP 201 with `{ "success": true, "memberId": "<uuid>" }`

#### Scenario: Missing required field in payload

- **WHEN** `POST /api/register` receives a request body with one or more required fields missing or empty
- **THEN** the API SHALL return HTTP 400 with a JSON error object listing the missing fields and SHALL NOT write to the sheet

#### Scenario: Google Sheets write fails

- **WHEN** the Sheets API call returns an error during row append
- **THEN** the API SHALL return HTTP 500 with `{ "error": "Failed to save registration" }` and SHALL NOT return a success response
