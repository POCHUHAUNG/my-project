# Spec: Configurable Agenda Labels

## Requirements

### Requirement: Agenda section title is configurable via Sheets

The `getEventInfo()` function SHALL read columns A2:H2 from the `event-info` sheet. Columns G2 and H2 SHALL store `agendaTagEn` (English tag, e.g. "Schedule") and `agendaTagZh` (Chinese title, e.g. "活動議程") respectively. If the cells are empty, the system SHALL default to "Schedule" and "活動議程".

#### Scenario: Labels set in Sheets

- **WHEN** G2 contains "Workshop" and H2 contains "工作坊議程"
- **THEN** `getEventInfo()` SHALL return `{ agendaTagEn: "Workshop", agendaTagZh: "工作坊議程" }`

#### Scenario: Labels not set in Sheets

- **WHEN** G2 and H2 are empty
- **THEN** `getEventInfo()` SHALL return `{ agendaTagEn: "Schedule", agendaTagZh: "活動議程" }`


<!-- @trace
source: add-admin-panel-and-enhancements
updated: 2026-04-04
code:
  - 活動報名系統-功能模板.md
  - client/src/App.jsx
  - client/src/AdminContext.jsx
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LoginPage.jsx
  - client/vercel.json
-->

---
### Requirement: Agenda items are grouped by session column

The `getAgenda()` function SHALL read columns A2:E from the `agenda` sheet. Column E SHALL contain the session label (e.g. "上午場", "下午場"). The frontend SHALL group agenda items by their session value, preserving insertion order. If only one unique session label exists, the frontend SHALL render a single-column layout without a session header.

#### Scenario: Two session labels present

- **WHEN** agenda items have both "上午場" and "下午場" in column E
- **THEN** the frontend SHALL render two side-by-side columns with their respective labels

#### Scenario: Single session label present

- **WHEN** all agenda items share the same session label
- **THEN** the frontend SHALL render a single full-width column without displaying the session label header


<!-- @trace
source: add-admin-panel-and-enhancements
updated: 2026-04-04
code:
  - 活動報名系統-功能模板.md
  - client/src/App.jsx
  - client/src/AdminContext.jsx
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LoginPage.jsx
  - client/vercel.json
-->

---
### Requirement: Admin can update agenda labels via PATCH /api/event

The `PATCH /api/event` endpoint SHALL accept `agendaTagEn` and `agendaTagZh` fields in addition to `imageUrl` and `dmUrl`. Each provided field SHALL be written to its corresponding cell in the `event-info` sheet.

#### Scenario: Agenda labels updated via API

- **WHEN** PATCH /api/event is called with `{ agendaTagEn: "Sessions", agendaTagZh: "課程安排" }`
- **THEN** cell G2 SHALL be updated to "Sessions" and H2 to "課程安排"

<!-- @trace
source: add-admin-panel-and-enhancements
updated: 2026-04-04
code:
  - 活動報名系統-功能模板.md
  - client/src/App.jsx
  - client/src/AdminContext.jsx
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LoginPage.jsx
  - client/vercel.json
-->