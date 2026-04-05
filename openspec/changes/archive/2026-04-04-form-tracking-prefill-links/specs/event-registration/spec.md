## MODIFIED Requirements

### Requirement: Registration form collects required fields

The registration form SHALL include the following fields, all of which are required: name (姓名), email (Email), phone (電話), company (公司). The form SHALL support LINE Login OAuth, Google Sign-In, and Facebook Login as authentication options — the form SHALL NOT submit until one of the three auth providers is completed and an auth ID (`lineUserId`, `googleId`, or `facebookId`) is obtained. The event-info sheet column I stores `fieldConfig` (JSON) for field hints and custom fields. Column J stores `forms` (JSON array) for Google Forms configurations. The `GET /api/event` response SHALL include both `fieldConfig` and `forms` fields.

#### Scenario: All fields filled and auth completed

- **WHEN** a user fills name, email, phone, and company fields and completes any one of LINE Login, Google Sign-In, or Facebook Login
- **THEN** the system SHALL enable the submit button and send a POST request to `/api/register` with `{ name, email, phone, company, lineUserId|googleId|facebookId, extraFields }` as JSON

#### Scenario: GET /api/event returns forms configuration

- **WHEN** GET /api/event is called
- **THEN** the response SHALL include `{ title, date, location, description, imageUrl, dmUrl, agendaTagEn, agendaTagZh, fieldConfig, forms }` where `forms` is an array (empty if unconfigured)
