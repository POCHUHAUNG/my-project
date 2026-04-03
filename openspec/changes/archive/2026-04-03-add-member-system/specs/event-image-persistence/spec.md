## ADDED Requirements

### Requirement: Uploaded event images persist across page reloads

When an event image (main visual or course DM) is uploaded, its URL SHALL be written back to the Google Sheet so that subsequent page loads retrieve and display the image.

#### Scenario: Admin uploads main visual image

- **WHEN** the admin uploads an image via the "上傳主視覺圖片" control and the upload succeeds
- **THEN** the client SHALL call `PATCH /api/event` with `{ "imageUrl": "<url>" }`, the server SHALL write the URL to `event-info!E2`, and subsequent `GET /api/event` calls SHALL return the updated `imageUrl`

#### Scenario: Admin uploads course DM image

- **WHEN** the admin uploads an image via the "上傳課程 DM" control and the upload succeeds
- **THEN** the client SHALL call `PATCH /api/event` with `{ "dmUrl": "<url>" }`, the server SHALL write the URL to `event-info!F2`, and subsequent `GET /api/event` calls SHALL return the updated `dmUrl`

#### Scenario: Page is reloaded after upload

- **WHEN** the page is reloaded after a successful upload and `PATCH /api/event` was called
- **THEN** the image SHALL be visible on the page without re-uploading

### Requirement: Upload controls show existing image thumbnail and update label

When an event image URL already exists, the upload control SHALL display a thumbnail of the current image and use "更新" labeling instead of "上傳".

#### Scenario: Event already has a main visual image

- **WHEN** `GET /api/event` returns a non-empty `imageUrl`
- **THEN** the upload control SHALL render an 80×52px thumbnail of the current image above the button, and the button label SHALL be "更新主視覺圖片"

#### Scenario: Event has no main visual image yet

- **WHEN** `GET /api/event` returns an empty or absent `imageUrl`
- **THEN** the button label SHALL be "上傳主視覺圖片" with no thumbnail

### Requirement: PATCH /api/event updates event image fields

The server SHALL expose `PATCH /api/event` to update `imageUrl` and/or `dmUrl` in the Google Sheet.

#### Scenario: Valid PATCH request with imageUrl

- **WHEN** `PATCH /api/event` receives `{ "imageUrl": "<url>" }`
- **THEN** the server SHALL call `updateEventImages({ imageUrl })`, update `event-info!E2`, and return HTTP 200 `{ "success": true }`

#### Scenario: PATCH request with neither field

- **WHEN** `PATCH /api/event` receives a body without `imageUrl` or `dmUrl`
- **THEN** the server SHALL return HTTP 400 `{ "error": "Provide imageUrl or dmUrl" }`
