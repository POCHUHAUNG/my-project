## ADDED Requirements

### Requirement: Display event information from Google Sheets

The system SHALL fetch event information from the Node.js API and render it in the event info section of the page. The event info section SHALL display: title, date, location, description text, and main visual image.

#### Scenario: Successful data load

- **WHEN** the page loads
- **THEN** the system SHALL call `GET /api/event` and render the title, date, location, description, and image

#### Scenario: Image URL is present

- **WHEN** the `imageUrl` field in Google Sheets is a non-empty string
- **THEN** the system SHALL render an `<img>` element with that URL as the `src`

#### Scenario: Image URL is empty

- **WHEN** the `imageUrl` field in Google Sheets is empty
- **THEN** the system SHALL render the event info section without an image element

#### Scenario: API returns error

- **WHEN** `GET /api/event` returns a non-2xx response
- **THEN** the system SHALL display an error message in place of the event info section

### Requirement: API returns event info from Google Sheets

The Node.js API SHALL read the first data row of the `event-info` sheet and return a JSON object with fields: `title`, `date`, `location`, `description`, `imageUrl`.

#### Scenario: Sheet has data

- **WHEN** `GET /api/event` is called and the `event-info` sheet has at least one data row
- **THEN** the API SHALL return HTTP 200 with a JSON object containing all five fields

#### Scenario: Sheet is empty

- **WHEN** `GET /api/event` is called and the `event-info` sheet has no data rows
- **THEN** the API SHALL return HTTP 404 with an error message

## Requirements

### Requirement: Display event information from Google Sheets

The system SHALL fetch event information from the Node.js API and render it in the event info section of the page. The event info section SHALL display: title, date, location, description text, and main visual image.

#### Scenario: Successful data load

- **WHEN** the page loads
- **THEN** the system SHALL call `GET /api/event` and render the title, date, location, description, and image

#### Scenario: Image URL is present

- **WHEN** the `imageUrl` field in Google Sheets is a non-empty string
- **THEN** the system SHALL render an `<img>` element with that URL as the `src`

#### Scenario: Image URL is empty

- **WHEN** the `imageUrl` field in Google Sheets is empty
- **THEN** the system SHALL render the event info section without an image element

#### Scenario: API returns error

- **WHEN** `GET /api/event` returns a non-2xx response
- **THEN** the system SHALL display an error message in place of the event info section

---
### Requirement: API returns event info from Google Sheets

The Node.js API SHALL read the first data row of the `event-info` sheet and return a JSON object with fields: `title`, `date`, `location`, `description`, `imageUrl`.

#### Scenario: Sheet has data

- **WHEN** `GET /api/event` is called and the `event-info` sheet has at least one data row
- **THEN** the API SHALL return HTTP 200 with a JSON object containing all five fields

#### Scenario: Sheet is empty

- **WHEN** `GET /api/event` is called and the `event-info` sheet has no data rows
- **THEN** the API SHALL return HTTP 404 with an error message
