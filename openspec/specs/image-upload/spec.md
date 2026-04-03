## ADDED Requirements

### Requirement: Image upload with in-browser crop

The frontend SHALL provide an image upload button that opens a crop modal before uploading. The user SHALL be able to select an aspect ratio, adjust zoom, then confirm to upload the cropped image to the server.

#### Scenario: User selects an image file

- **WHEN** a user clicks an upload button and selects a local image file
- **THEN** the system SHALL open a crop modal displaying the selected image with the default aspect ratio (16:9)

#### Scenario: User selects an aspect ratio

- **WHEN** a user clicks an aspect ratio button in the crop modal (16:9, 4:3, 1:1, 3:1, A4直式 210/297, A4橫式 297/210)
- **THEN** the crop area SHALL update to reflect the selected ratio immediately

#### Scenario: User confirms crop and uploads

- **WHEN** a user clicks the confirm button in the crop modal
- **THEN** the system SHALL produce a cropped image Blob via canvas, POST it to `/api/upload` as `multipart/form-data` with field name `image`, and call `onUploaded(url)` with the returned URL on HTTP 200

#### Scenario: Upload API accepts image file

- **WHEN** `POST /api/upload` receives a multipart/form-data request with an `image` field containing a file with MIME type `image/*` and size ≤ 5 MB
- **THEN** the API SHALL store the file in `server/public/uploads/`, return HTTP 200 with `{ "url": "http://localhost:{PORT}/uploads/{filename}" }`

#### Scenario: Upload API rejects non-image file

- **WHEN** `POST /api/upload` receives a file whose MIME type does not start with `image/`
- **THEN** the API SHALL return HTTP 400 with an error message and SHALL NOT store the file

#### Scenario: Upload API rejects oversized file

- **WHEN** `POST /api/upload` receives a file larger than 5 MB
- **THEN** the API SHALL return HTTP 400 and SHALL NOT store the file

### Requirement: Uploaded image URL is reflected in the page immediately

After a successful upload, the returned URL SHALL be set as the image source for the corresponding section (hero image or course DM) without requiring a page reload.

#### Scenario: Hero image uploaded

- **WHEN** the hero image upload completes successfully
- **THEN** the `EventInfoSection` SHALL display the uploaded image immediately

#### Scenario: Course DM uploaded

- **WHEN** the course DM upload completes successfully
- **THEN** the DM section SHALL display the uploaded image immediately

## Requirements

### Requirement: Image upload with in-browser crop

The frontend SHALL provide an image upload button that opens a crop modal before uploading. The user SHALL be able to select an aspect ratio, adjust zoom, then confirm to upload the cropped image to the server.

#### Scenario: User selects an image file

- **WHEN** a user clicks an upload button and selects a local image file
- **THEN** the system SHALL open a crop modal displaying the selected image with the default aspect ratio (16:9)

#### Scenario: User selects an aspect ratio

- **WHEN** a user clicks an aspect ratio button in the crop modal (16:9, 4:3, 1:1, 3:1, A4直式 210/297, A4橫式 297/210)
- **THEN** the crop area SHALL update to reflect the selected ratio immediately

#### Scenario: User confirms crop and uploads

- **WHEN** a user clicks the confirm button in the crop modal
- **THEN** the system SHALL produce a cropped image Blob via canvas, POST it to `/api/upload` as `multipart/form-data` with field name `image`, and call `onUploaded(url)` with the returned URL on HTTP 200

#### Scenario: Upload API accepts image file

- **WHEN** `POST /api/upload` receives a multipart/form-data request with an `image` field containing a file with MIME type `image/*` and size ≤ 5 MB
- **THEN** the API SHALL store the file in `server/public/uploads/`, return HTTP 200 with `{ "url": "http://localhost:{PORT}/uploads/{filename}" }`

#### Scenario: Upload API rejects non-image file

- **WHEN** `POST /api/upload` receives a file whose MIME type does not start with `image/`
- **THEN** the API SHALL return HTTP 400 with an error message and SHALL NOT store the file

#### Scenario: Upload API rejects oversized file

- **WHEN** `POST /api/upload` receives a file larger than 5 MB
- **THEN** the API SHALL return HTTP 400 and SHALL NOT store the file

---
### Requirement: Uploaded image URL is reflected in the page immediately

After a successful upload, the returned URL SHALL be set as the image source for the corresponding section (hero image or course DM) without requiring a page reload.

#### Scenario: Hero image uploaded

- **WHEN** the hero image upload completes successfully
- **THEN** the `EventInfoSection` SHALL display the uploaded image immediately

#### Scenario: Course DM uploaded

- **WHEN** the course DM upload completes successfully
- **THEN** the DM section SHALL display the uploaded image immediately
