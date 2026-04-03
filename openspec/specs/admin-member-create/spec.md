## ADDED Requirements

### Requirement: Admin can create a new member from the admin panel

The `POST /api/admin/members` endpoint SHALL be protected by `requireAdmin` middleware. It SHALL accept `{ name, email, phone?, company?, lineId?, password?, sendEmail? }`. Both `name` and `email` are required; missing either SHALL return HTTP 400 `{ error: "Missing required fields", missing: [...] }`. If `email` already exists in members.json, the endpoint SHALL return HTTP 409 `{ error: "Email already exists" }`. On success the endpoint SHALL create the member via `memberStore.createMember`, optionally write phone/company/lineId to Google Sheets via `appendRegistration`, optionally hash and set the password if `password` is provided and strong, optionally call `sendSetPasswordEmail` if `sendEmail` is true, and return `{ memberId, memberNumber, email, name, isActivated }`.

#### Scenario: Admin creates a member with all fields and direct password

- **WHEN** POST /api/admin/members is called with name, email, phone, company, lineId, and a strong password
- **THEN** a member SHALL be created in members.json with `isActivated: true`, the registration record SHALL be written to Google Sheets, and the response SHALL include the new member's `memberNumber`

#### Scenario: Admin creates a member and sends set-password email

- **WHEN** POST /api/admin/members is called with name, email, and `sendEmail: true`
- **THEN** a new member SHALL be created with `isActivated: false` AND `sendSetPasswordEmail` SHALL be called with the member's setPasswordToken

#### Scenario: Duplicate email is rejected

- **WHEN** POST /api/admin/members is called with an email that already exists
- **THEN** the endpoint SHALL return HTTP 409 with `{ error: "Email already exists" }` and no new member SHALL be created

#### Scenario: Missing required fields returns 400

- **WHEN** POST /api/admin/members is called without `name` or without `email`
- **THEN** the endpoint SHALL return HTTP 400 with `{ error: "Missing required fields", missing: [...] }`

#### Scenario: Weak password is rejected

- **WHEN** POST /api/admin/members is called with a `password` that does not meet strength requirements (8+ chars, uppercase, lowercase, digit)
- **THEN** the endpoint SHALL return HTTP 400 with `{ error: "Password too weak" }` and no member SHALL be created

---

### Requirement: Admin panel shows a create member form

The AdminPage SHALL include a "新增會員" button. When clicked, an inline form SHALL expand with: name input (required), email input (required), phone input (optional), company input (optional), lineId input (optional), password input (optional, if filled disables the sendEmail checkbox), "寄送設定密碼信" checkbox (default unchecked, disabled when password is filled), "建立" submit button, "取消" button. Submitting with empty name or email SHALL show inline validation error without calling the API. On success the new member SHALL be prepended to the members list and the form SHALL collapse. On 409 the form SHALL display "此 Email 已被使用". On other errors the form SHALL display "建立失敗，請稍後再試".

#### Scenario: Admin opens and submits the create form with full fields

- **WHEN** admin clicks "新增會員", fills in name, email, phone, company, lineId, and clicks "建立"
- **THEN** POST /api/admin/members SHALL be called, the new member SHALL appear at the top of the list, and the form SHALL collapse

#### Scenario: Admin cancels the create form

- **WHEN** admin clicks "取消" on the open create form
- **THEN** the form SHALL collapse without making any API call

#### Scenario: Duplicate email shows inline error

- **WHEN** admin submits the form with an email that already exists
- **THEN** the form SHALL display "此 Email 已被使用" and remain open

#### Scenario: Filling password disables sendEmail checkbox

- **WHEN** admin types a value into the password field
- **THEN** the "寄送設定密碼信" checkbox SHALL become disabled and unchecked

---

### Requirement: Admin can batch import members from CSV

The AdminPage SHALL include a "批次匯入 CSV" section with a file input (accept=".csv"). The CSV first row SHALL be treated as headers mapping to columns: name (required), email (required), phone (optional), company (optional), lineId (optional). The frontend SHALL parse the CSV client-side and call `POST /api/admin/members` sequentially for each row (sendEmail: false). After all rows are processed, the UI SHALL display a summary "成功 N 筆，失敗 M 筆". Successfully created members SHALL be added to the members list.

#### Scenario: Admin uploads a valid CSV and all rows succeed

- **WHEN** admin selects a CSV with 5 valid rows and clicks import
- **THEN** 5 POST /api/admin/members calls SHALL be made sequentially, and the summary SHALL show "成功 5 筆，失敗 0 筆"

#### Scenario: CSV with some duplicate emails

- **WHEN** admin imports a CSV where 2 of 5 rows have emails already in use
- **THEN** 3 members SHALL be created, 2 SHALL fail with 409, and the summary SHALL show "成功 3 筆，失敗 2 筆"

#### Scenario: CSV missing required columns

- **WHEN** admin uploads a CSV that has no "name" or "email" header column
- **THEN** the import SHALL be rejected before any API calls with an error "CSV 缺少必要欄位 name 或 email"

## Requirements

### Requirement: Admin can create a new member from the admin panel

The `POST /api/admin/members` endpoint SHALL be protected by `requireAdmin` middleware. It SHALL accept `{ name, email, phone?, company?, lineId?, password?, sendEmail? }`. Both `name` and `email` are required; missing either SHALL return HTTP 400 `{ error: "Missing required fields", missing: [...] }`. If `email` already exists in members.json, the endpoint SHALL return HTTP 409 `{ error: "Email already exists" }`. On success the endpoint SHALL create the member via `memberStore.createMember`, optionally write phone/company/lineId to Google Sheets via `appendRegistration`, optionally hash and set the password if `password` is provided and strong, optionally call `sendSetPasswordEmail` if `sendEmail` is true, and return `{ memberId, memberNumber, email, name, isActivated }`.

#### Scenario: Admin creates a member with all fields and direct password

- **WHEN** POST /api/admin/members is called with name, email, phone, company, lineId, and a strong password
- **THEN** a member SHALL be created in members.json with `isActivated: true`, the registration record SHALL be written to Google Sheets, and the response SHALL include the new member's `memberNumber`

#### Scenario: Admin creates a member and sends set-password email

- **WHEN** POST /api/admin/members is called with name, email, and `sendEmail: true`
- **THEN** a new member SHALL be created with `isActivated: false` AND `sendSetPasswordEmail` SHALL be called with the member's setPasswordToken

#### Scenario: Duplicate email is rejected

- **WHEN** POST /api/admin/members is called with an email that already exists
- **THEN** the endpoint SHALL return HTTP 409 with `{ error: "Email already exists" }` and no new member SHALL be created

#### Scenario: Missing required fields returns 400

- **WHEN** POST /api/admin/members is called without `name` or without `email`
- **THEN** the endpoint SHALL return HTTP 400 with `{ error: "Missing required fields", missing: [...] }`

#### Scenario: Weak password is rejected

- **WHEN** POST /api/admin/members is called with a `password` that does not meet strength requirements (8+ chars, uppercase, lowercase, digit)
- **THEN** the endpoint SHALL return HTTP 400 with `{ error: "Password too weak" }` and no member SHALL be created

---
### Requirement: Admin panel shows a create member form

The AdminPage SHALL include a "新增會員" button. When clicked, an inline form SHALL expand with: name input (required), email input (required), phone input (optional), company input (optional), lineId input (optional), password input (optional, if filled disables the sendEmail checkbox), "寄送設定密碼信" checkbox (default unchecked, disabled when password is filled), "建立" submit button, "取消" button. Submitting with empty name or email SHALL show inline validation error without calling the API. On success the new member SHALL be prepended to the members list and the form SHALL collapse. On 409 the form SHALL display "此 Email 已被使用". On other errors the form SHALL display "建立失敗，請稍後再試".

#### Scenario: Admin opens and submits the create form with full fields

- **WHEN** admin clicks "新增會員", fills in name, email, phone, company, lineId, and clicks "建立"
- **THEN** POST /api/admin/members SHALL be called, the new member SHALL appear at the top of the list, and the form SHALL collapse

#### Scenario: Admin cancels the create form

- **WHEN** admin clicks "取消" on the open create form
- **THEN** the form SHALL collapse without making any API call

#### Scenario: Duplicate email shows inline error

- **WHEN** admin submits the form with an email that already exists
- **THEN** the form SHALL display "此 Email 已被使用" and remain open

#### Scenario: Filling password disables sendEmail checkbox

- **WHEN** admin types a value into the password field
- **THEN** the "寄送設定密碼信" checkbox SHALL become disabled and unchecked

---
### Requirement: Admin can batch import members from CSV

The AdminPage SHALL include a "批次匯入 CSV" section with a file input (accept=".csv"). The CSV first row SHALL be treated as headers mapping to columns: name (required), email (required), phone (optional), company (optional), lineId (optional). The frontend SHALL parse the CSV client-side and call `POST /api/admin/members` sequentially for each row (sendEmail: false). After all rows are processed, the UI SHALL display a summary "成功 N 筆，失敗 M 筆". Successfully created members SHALL be added to the members list.

#### Scenario: Admin uploads a valid CSV and all rows succeed

- **WHEN** admin selects a CSV with 5 valid rows and clicks import
- **THEN** 5 POST /api/admin/members calls SHALL be made sequentially, and the summary SHALL show "成功 5 筆，失敗 0 筆"

#### Scenario: CSV with some duplicate emails

- **WHEN** admin imports a CSV where 2 of 5 rows have emails already in use
- **THEN** 3 members SHALL be created, 2 SHALL fail with 409, and the summary SHALL show "成功 3 筆，失敗 2 筆"

#### Scenario: CSV missing required columns

- **WHEN** admin uploads a CSV that has no "name" or "email" header column
- **THEN** the import SHALL be rejected before any API calls with an error "CSV 缺少必要欄位 name 或 email"
