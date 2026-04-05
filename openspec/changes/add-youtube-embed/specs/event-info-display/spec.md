## MODIFIED Requirements

### Requirement: API returns event info from Google Sheets

The Node.js API SHALL read the first data row of the `event-info` sheet and return a JSON object with fields: `title`, `date`, `location`, `description`, `imageUrl`, `dmUrl`, `youtubeUrl`.

#### Scenario: Successful data load

- **WHEN** the page loads
- **THEN** the system SHALL call `GET /api/event` and render the title, date, location, description, image, and YouTube embed if present

#### Scenario: Image URL is present

- **WHEN** the `imageUrl` field is a non-empty string
- **THEN** the system SHALL render an `<img>` element with that URL as the `src`

#### Scenario: Image URL is empty

- **WHEN** the `imageUrl` field is empty
- **THEN** the system SHALL render the event info section without an image element

#### Scenario: API returns error

- **WHEN** `GET /api/event` returns a non-2xx response
- **THEN** the system SHALL display an error message in place of the event info section

#### Scenario: youtubeUrl is present in API response

- **WHEN** the `youtubeUrl` field is a non-empty string
- **THEN** the system SHALL pass it to the YouTube embed component for display below the DM section
