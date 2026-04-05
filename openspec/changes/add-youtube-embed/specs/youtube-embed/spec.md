## ADDED Requirements

### Requirement: Display YouTube video embed on event page

The system SHALL render a YouTube video embed below the course DM section when a `youtubeUrl` is stored for the event. The embed SHALL use an `<iframe>` with the YouTube embed URL derived from the stored value.

#### Scenario: youtubeUrl is set

- **WHEN** the event data contains a non-empty `youtubeUrl` field
- **THEN** the system SHALL render an `<iframe>` below the DM section with `src` set to the converted embed URL (`https://www.youtube.com/embed/<videoId>`)

#### Scenario: youtubeUrl is empty or absent

- **WHEN** the event data has no `youtubeUrl` field or the field is an empty string
- **THEN** the system SHALL NOT render any video section

### Requirement: Convert YouTube URL to embed format

The system SHALL accept standard YouTube URL formats and convert them to embed URLs.

#### Scenario: Standard watch URL

- **WHEN** the stored URL is `https://www.youtube.com/watch?v=<videoId>`
- **THEN** the system SHALL extract `<videoId>` and construct `https://www.youtube.com/embed/<videoId>`

#### Scenario: Short URL

- **WHEN** the stored URL is `https://youtu.be/<videoId>`
- **THEN** the system SHALL extract `<videoId>` and construct `https://www.youtube.com/embed/<videoId>`

#### Scenario: Invalid URL

- **WHEN** the stored URL cannot be parsed into a valid YouTube video ID
- **THEN** the system SHALL NOT render the iframe

### Requirement: Admin can set YouTube URL via inline editor

The system SHALL display a YouTube URL input field to admin users on the event page. Saving the URL SHALL persist it via `PATCH /api/event` with `{ youtubeUrl }` and immediately update the displayed embed without a page reload.

#### Scenario: Admin saves a valid YouTube URL

- **WHEN** an admin enters a valid YouTube URL and clicks save
- **THEN** the system SHALL call `PATCH /api/event` with `{ youtubeUrl }`, update local state, and render the embed below the DM section

#### Scenario: Admin clears the YouTube URL

- **WHEN** an admin clears the input field and clicks save
- **THEN** the system SHALL call `PATCH /api/event` with `{ youtubeUrl: "" }` and remove the embed from the page

#### Scenario: Non-admin visitor

- **WHEN** a non-admin user views the event page
- **THEN** the system SHALL NOT render the YouTube URL editor
