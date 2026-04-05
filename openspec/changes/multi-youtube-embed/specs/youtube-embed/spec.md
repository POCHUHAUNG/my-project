## MODIFIED Requirements

### Requirement: Display YouTube video embed on event page

The system SHALL render one or more YouTube video embeds below the course DM section when `youtubeVideos` is a non-empty array. Each entry SHALL have a `url` (string) and `title` (string). The embeds SHALL be rendered vertically in array order, each preceded by its title.

#### Scenario: youtubeVideos has one or more entries

- **WHEN** the event data contains a `youtubeVideos` array with at least one entry whose `url` is a valid YouTube URL
- **THEN** the system SHALL render one `<iframe>` per valid entry below the DM section, each preceded by an `<h3>` with the entry's `title`

#### Scenario: youtubeVideos is empty or absent

- **WHEN** the event data has no `youtubeVideos` field or the array is empty
- **THEN** the system SHALL NOT render any video section

#### Scenario: Entry has invalid URL

- **WHEN** an entry's `url` cannot be parsed into a valid YouTube video ID
- **THEN** the system SHALL skip that entry and NOT render an iframe for it

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
- **THEN** the system SHALL return null and skip rendering

### Requirement: Admin can set YouTube URL via inline editor

The system SHALL display a YouTube video list editor to admin users. The editor SHALL allow adding entries (URL + title), deleting individual entries, and reordering entries (move up / move down). Saving SHALL persist via `PATCH /api/event` with `{ youtubeVideos }` array and immediately update the displayed embeds without a page reload. The maximum number of videos is 10; when the list reaches 10 entries the add button SHALL be disabled.

#### Scenario: Admin adds a video

- **WHEN** an admin enters a YouTube URL and title and clicks the add button
- **THEN** the system SHALL append `{ url, title }` to the local list and call `PATCH /api/event` with the updated `youtubeVideos` array

#### Scenario: Admin deletes a video

- **WHEN** an admin clicks the delete button on an entry
- **THEN** the system SHALL remove that entry from the local list and call `PATCH /api/event` with the updated `youtubeVideos` array

#### Scenario: Admin reorders videos

- **WHEN** an admin clicks move-up or move-down on an entry
- **THEN** the system SHALL swap the entry with its neighbour in the local list and call `PATCH /api/event` with the updated `youtubeVideos` array

#### Scenario: List reaches 10 videos

- **WHEN** the `youtubeVideos` array length equals 10
- **THEN** the system SHALL disable the add button and display a message indicating the maximum has been reached

#### Scenario: Non-admin visitor

- **WHEN** a non-admin user views the event page
- **THEN** the system SHALL NOT render the YouTube video list editor

## REMOVED Requirements

### Requirement: Admin can set YouTube URL via inline editor (single-URL version)

**Reason**: Replaced by multi-video list editor that supports multiple URLs with titles.
**Migration**: Use the new `youtubeVideos` array field via `PATCH /api/event`.

#### Scenario: Single URL field is removed

- **WHEN** admin saves video settings after this change
- **THEN** the system SHALL use `youtubeVideos` array instead of `youtubeUrl` string
