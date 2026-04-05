## Requirements

### Requirement: Server reads form response sheets and matches registrants by email

The `GET /api/admin/form-completion` endpoint SHALL be protected by admin password. It SHALL accept `eventId` as a query parameter. For each form in the event's `forms` array, it SHALL call the Google Sheets API to read the response sheet (`spreadsheets.values.get` on range `Sheet1!A2:Z` of the `responseSheetId`). It SHALL extract all values in column index `responseEmailColumn` (0-based) as the set of submitted emails. It SHALL compare this set against the registrations list email column. It SHALL return:
```json
{
  "forms": [{ "id": "f1", "name": "課前調查" }],
  "registrants": [
    { "name": "王小明", "email": "wang@example.com", "completed": [true, false, true, false] }
  ]
}
```
where `completed[i]` is `true` if the registrant's email appears in form i's response sheet.

#### Scenario: Full completion matrix returned

- **WHEN** GET /api/admin/form-completion is called with a valid eventId, 2 configured forms, and 3 registrants where 2 have filled form 1 and 1 has filled form 2
- **THEN** the response SHALL contain `forms` array of length 2 and `registrants` array of length 3, with `completed` arrays accurately reflecting which forms each registrant submitted

#### Scenario: Response sheet not accessible

- **WHEN** GET /api/admin/form-completion is called but one form's responseSheetId is not shared with the service account
- **THEN** that form's completion column SHALL default to all `false` and the response SHALL include `{ errors: [{ formId: "f1", message: "Unable to access response sheet" }] }`

#### Scenario: No forms configured

- **WHEN** GET /api/admin/form-completion is called but the event has 0 forms
- **THEN** the response SHALL return `{ forms: [], registrants: [] }`


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
### Requirement: Admin panel displays completion matrix

The admin panel SHALL include a "完成狀況" section with a "重新整理" button. Clicking it SHALL call GET /api/admin/form-completion and render a table where rows are registrants (showing name and email) and columns are form names. Each cell SHALL display "✓" (green) if `completed[i]` is true, or "—" (grey) if false. A summary row SHALL show completion counts per form (e.g., "3 / 10") and SHALL always reflect the full registrant count regardless of active filter.

The section SHALL include filter buttons — "全部", "未完成", "已完成" — and a text search input displayed above the table. Clicking a filter button SHALL immediately update the table to show only matching registrant rows without re-fetching from the API. A registrant is considered "未完成" if any entry in their `completed` array is `false`; "已完成" if all entries are `true`. The default active filter SHALL be "全部". The search input SHALL have placeholder text "搜尋姓名或 Email" and SHALL filter rows by matching the query string (case-insensitive) against the registrant's name or email. The filter button condition and search query SHALL apply simultaneously — a row is visible only if it satisfies both.

#### Scenario: Matrix renders correctly

- **WHEN** admin clicks "重新整理" and the API returns data
- **THEN** a table SHALL render with registrant rows and form columns, green ✓ for completed entries and grey — for incomplete, and filter buttons SHALL be visible above the table with "全部" active by default

#### Scenario: Filter to incomplete registrants

- **WHEN** admin clicks the "未完成" filter button
- **THEN** the table SHALL show only registrants who have at least one `false` in their `completed` array, and the summary row SHALL continue to show the total count (e.g., "1 / 3" not "1 / 1")

#### Scenario: Filter to completed registrants

- **WHEN** admin clicks the "已完成" filter button
- **THEN** the table SHALL show only registrants whose entire `completed` array is `true`

#### Scenario: Reset to all registrants

- **WHEN** admin clicks the "全部" filter button
- **THEN** all registrant rows SHALL be shown

#### Scenario: Search filters by name

- **WHEN** admin types a name substring into the search input
- **THEN** only registrant rows whose name contains the query (case-insensitive) SHALL be shown

#### Scenario: Search filters by email

- **WHEN** admin types an email substring into the search input
- **THEN** only registrant rows whose email contains the query (case-insensitive) SHALL be shown

#### Scenario: Filter and search combine

- **WHEN** admin selects "未完成" filter and also types a search query
- **THEN** only rows that are both incomplete AND match the search query SHALL be shown

#### Scenario: Access error shown in UI

- **WHEN** one form's response sheet is inaccessible
- **THEN** that form's column header SHALL show a ⚠ icon with a tooltip "無法讀取回應表（請確認已共用給 service account）"

<!-- @trace
source: completion-matrix-filter
updated: 2026-04-04
code:
  - client/src/AdminContext.jsx
  - client/.env.example
  - client/vercel.json
  - 活動報名系統-功能模板.md
  - client/src/pages/AdminPage.jsx
  - client/src/pages/LineCallbackPage.jsx
  - client/src/pages/LoginPage.jsx
-->