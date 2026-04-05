## ADDED Requirements

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

### Requirement: Admin panel displays completion matrix

The admin panel SHALL include a "完成狀況" section with a "重新整理" button. Clicking it SHALL call GET /api/admin/form-completion and render a table where rows are registrants (showing name and email) and columns are form names. Each cell SHALL display "✓" (green) if `completed[i]` is true, or "—" (grey) if false. A summary row SHALL show completion counts per form (e.g., "3 / 10").

#### Scenario: Matrix renders correctly

- **WHEN** admin clicks "重新整理" and the API returns data
- **THEN** a table SHALL render with registrant rows and form columns, green ✓ for completed entries and grey — for incomplete

#### Scenario: Access error shown in UI

- **WHEN** one form's response sheet is inaccessible
- **THEN** that form's column header SHALL show a ⚠ icon with a tooltip "無法讀取回應表（請確認已共用給 service account）"
