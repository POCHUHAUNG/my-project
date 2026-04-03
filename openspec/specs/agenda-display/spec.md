## ADDED Requirements

### Requirement: Display agenda from Google Sheets

The system SHALL fetch the agenda from the Node.js API and render each agenda item as a row in the agenda section. Each row SHALL display: time, topic, speaker, and description.

#### Scenario: Successful data load

- **WHEN** the page loads
- **THEN** the system SHALL call `GET /api/agenda` and render all returned agenda items in order

#### Scenario: Empty agenda

- **WHEN** `GET /api/agenda` returns an empty array
- **THEN** the system SHALL display a placeholder message indicating no agenda items are available

#### Scenario: API returns error

- **WHEN** `GET /api/agenda` returns a non-2xx response
- **THEN** the system SHALL display an error message in place of the agenda section

### Requirement: API returns agenda list from Google Sheets

The Node.js API SHALL read all data rows from the `agenda` sheet and return a JSON array. Each element SHALL contain: `time`, `topic`, `speaker`, `description`.

#### Scenario: Sheet has agenda rows

- **WHEN** `GET /api/agenda` is called and the `agenda` sheet has one or more data rows
- **THEN** the API SHALL return HTTP 200 with a JSON array of agenda objects in row order

#### Scenario: Sheet is empty

- **WHEN** `GET /api/agenda` is called and the `agenda` sheet has no data rows
- **THEN** the API SHALL return HTTP 200 with an empty JSON array `[]`

#### Scenario: Description field is blank

- **WHEN** a row in the `agenda` sheet has an empty description cell
- **THEN** the API SHALL return an empty string `""` for that item's `description` field

## Requirements

### Requirement: Display agenda from Google Sheets

The system SHALL fetch the agenda from the Node.js API and render each agenda item as a row in the agenda section. Each row SHALL display: time, topic, speaker, and description.

#### Scenario: Successful data load

- **WHEN** the page loads
- **THEN** the system SHALL call `GET /api/agenda` and render all returned agenda items in order

#### Scenario: Empty agenda

- **WHEN** `GET /api/agenda` returns an empty array
- **THEN** the system SHALL display a placeholder message indicating no agenda items are available

#### Scenario: API returns error

- **WHEN** `GET /api/agenda` returns a non-2xx response
- **THEN** the system SHALL display an error message in place of the agenda section

---
### Requirement: API returns agenda list from Google Sheets

The Node.js API SHALL read all data rows from the `agenda` sheet and return a JSON array. Each element SHALL contain: `time`, `topic`, `speaker`, `description`.

#### Scenario: Sheet has agenda rows

- **WHEN** `GET /api/agenda` is called and the `agenda` sheet has one or more data rows
- **THEN** the API SHALL return HTTP 200 with a JSON array of agenda objects in row order

#### Scenario: Sheet is empty

- **WHEN** `GET /api/agenda` is called and the `agenda` sheet has no data rows
- **THEN** the API SHALL return HTTP 200 with an empty JSON array `[]`

#### Scenario: Description field is blank

- **WHEN** a row in the `agenda` sheet has an empty description cell
- **THEN** the API SHALL return an empty string `""` for that item's `description` field
