## ADDED Requirements

### Requirement: Server generates personalized pre-fill links for each registrant

The `POST /api/admin/generate-form-links` endpoint SHALL be protected by admin password (`x-admin-password` header). It SHALL accept `{ eventId }` in the request body. It SHALL read the `forms` array from the event config and the registrations list for the event. For each registrant, it SHALL replace `{name}` with the registrant's name (URL-encoded) and `{email}` with the registrant's email (URL-encoded) in each form's `prefillTemplate`. It SHALL return a JSON array of objects: `[{ name, email, links: [{ formName, url }] }]`.

#### Scenario: Successful link generation

- **WHEN** POST /api/admin/generate-form-links is called with valid eventId and admin password, and the event has 2 forms and 3 registrants
- **THEN** the response SHALL be an array of 3 objects, each containing `name`, `email`, and `links` array with 2 entries, where each `url` has `{name}` and `{email}` replaced with the registrant's URL-encoded name and email

#### Scenario: No forms configured

- **WHEN** POST /api/admin/generate-form-links is called but the event has 0 forms
- **THEN** the response SHALL return HTTP 400 with `{ error: "No forms configured for this event" }`

#### Scenario: No registrants

- **WHEN** POST /api/admin/generate-form-links is called but the event has 0 registrations
- **THEN** the response SHALL return an empty array `[]`

#### Scenario: Unauthorized request

- **WHEN** POST /api/admin/generate-form-links is called without a valid admin password
- **THEN** the response SHALL return HTTP 401
