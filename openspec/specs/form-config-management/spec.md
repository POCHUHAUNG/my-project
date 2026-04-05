## Requirements

### Requirement: Admin can configure up to 4 Google Forms for an event

The admin panel SHALL provide a "表單管理" section where an authenticated admin can add, edit, and remove up to 4 Google Forms configurations. Each form configuration SHALL include: `name` (display name, required), `prefillTemplate` (Google Forms pre-fill URL with `{name}` and `{email}` placeholders, required), `responseSheetId` (Google Sheets ID of the form's response spreadsheet, required), and `responseEmailColumn` (0-based column index of the email field in the response sheet, required, default 1).

#### Scenario: Admin adds a new form configuration

- **WHEN** admin fills in name, prefillTemplate, responseSheetId, and responseEmailColumn, then clicks "新增表單"
- **THEN** the form entry SHALL appear in the list, and the "儲存表單設定" button SHALL become active

#### Scenario: Admin saves form configurations

- **WHEN** admin clicks "儲存表單設定"
- **THEN** the system SHALL send PATCH /api/event with `{ forms: [...] }` and display "✓ 已儲存" on success

#### Scenario: Admin removes a form configuration

- **WHEN** admin clicks the "刪除" button next to a form entry
- **THEN** that entry SHALL be removed from the list immediately (not yet saved until "儲存表單設定" is clicked)

#### Scenario: Admin attempts to add a 5th form

- **WHEN** 4 form configurations already exist and admin tries to add another
- **THEN** the "新增表單" button SHALL be disabled and a message SHALL display "最多 4 個表單"


<!-- @trace
source: form-tracking-prefill-links
updated: 2026-04-04
code:
  - server/sheets.js
  - client/vercel.json
  - client/src/AdminContext.jsx
  - client/src/pages/LoginPage.jsx
  - client/.env.example
  - 活動報名系統-功能模板.md
  - server/package.json
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LineCallbackPage.jsx
  - server/index.js
-->

---
### Requirement: Forms configuration is persisted in the event-info sheet column J

The server SHALL store the `forms` array as a JSON string in column J of the `event-info-{eventId}` sheet. The `GET /api/event` endpoint SHALL return the parsed `forms` array (empty array if column J is empty or invalid JSON). The `PATCH /api/event` endpoint SHALL accept `{ forms: [...] }` and write the JSON string to column J.

#### Scenario: GET /api/event returns forms array

- **WHEN** GET /api/event is called and column J contains valid JSON
- **THEN** the response SHALL include `{ ..., forms: [{ id, name, prefillTemplate, responseSheetId, responseEmailColumn }] }`

#### Scenario: GET /api/event with empty column J

- **WHEN** GET /api/event is called and column J is empty
- **THEN** the response SHALL include `{ ..., forms: [] }`

<!-- @trace
source: form-tracking-prefill-links
updated: 2026-04-04
code:
  - server/sheets.js
  - client/vercel.json
  - client/src/AdminContext.jsx
  - client/src/pages/LoginPage.jsx
  - client/.env.example
  - 活動報名系統-功能模板.md
  - server/package.json
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LineCallbackPage.jsx
  - server/index.js
-->