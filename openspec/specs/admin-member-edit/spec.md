# Spec: Admin Member Edit

## Requirement: Admin can edit member name and activation status

The `PATCH /api/admin/members/:memberId` endpoint SHALL accept an optional `name` field (non-empty string) and an optional `isActivated` field (boolean). The endpoint SHALL update the matching member in `members.json` and return the updated member object (excluding passwordHash, setPasswordToken, setPasswordTokenExpiry).

### Scenario: Admin updates member name

- **WHEN** PATCH is called with `{ name: "新姓名" }` and a valid memberId
- **THEN** the member's name in members.json SHALL be updated and the response SHALL include the updated member object

### Scenario: Admin deactivates a member

- **WHEN** PATCH is called with `{ isActivated: false }` and a valid memberId
- **THEN** the member's isActivated field SHALL be set to false in members.json

### Scenario: MemberId not found

- **WHEN** PATCH is called with a memberId that does not exist in members.json
- **THEN** the system SHALL return HTTP 404 with `{ error: "Member not found" }`

## Requirement: Admin can edit member email with uniqueness validation

The `PATCH /api/admin/members/:memberId` endpoint SHALL accept an optional `email` field. If provided, the system SHALL verify the new email does not already exist in members.json for a different member. If the email is already taken, the system SHALL return HTTP 409.

### Scenario: Email updated to a unique value

- **WHEN** PATCH is called with a new email not used by any other member
- **THEN** the member's email SHALL be updated in members.json

### Scenario: Email already taken by another member

- **WHEN** PATCH is called with an email already belonging to a different member
- **THEN** the system SHALL return HTTP 409 with `{ error: "Email already in use" }`

## Requirement: Admin page shows inline edit form per member

The AdminPage SHALL render an "編輯" button for each member row. Clicking the button SHALL expand an inline form pre-filled with the member's current name, email, and isActivated value. Clicking "取消" SHALL collapse the form without saving. Clicking "儲存" SHALL call PATCH and update the displayed row on success.

### Scenario: Edit form opens and saves

- **WHEN** admin clicks "編輯" on a member row, modifies the name, and clicks "儲存"
- **THEN** the inline form SHALL collapse and the member row SHALL display the updated name without a full page reload

## Requirements

### Requirement: Admin can edit member name and activation status

The `PATCH /api/admin/members/:memberId` endpoint SHALL accept an optional `name` field (non-empty string) and an optional `isActivated` field (boolean). The endpoint SHALL update the matching member in `members.json` and return the updated member object (excluding passwordHash, setPasswordToken, setPasswordTokenExpiry).

#### Scenario: Admin updates member name

- **WHEN** PATCH is called with `{ name: "新姓名" }` and a valid memberId
- **THEN** the member's name in members.json SHALL be updated and the response SHALL include the updated member object

#### Scenario: Admin deactivates a member

- **WHEN** PATCH is called with `{ isActivated: false }` and a valid memberId
- **THEN** the member's isActivated field SHALL be set to false in members.json

#### Scenario: MemberId not found

- **WHEN** PATCH is called with a memberId that does not exist in members.json
- **THEN** the system SHALL return HTTP 404 with `{ error: "Member not found" }`

---
### Requirement: Admin can edit member email with uniqueness validation

The `PATCH /api/admin/members/:memberId` endpoint SHALL accept an optional `email` field. If provided, the system SHALL verify the new email does not already exist in members.json for a different member. If the email is already taken, the system SHALL return HTTP 409.

#### Scenario: Email updated to a unique value

- **WHEN** PATCH is called with a new email not used by any other member
- **THEN** the member's email SHALL be updated in members.json

#### Scenario: Email already taken by another member

- **WHEN** PATCH is called with an email already belonging to a different member
- **THEN** the system SHALL return HTTP 409 with `{ error: "Email already in use" }`

---
### Requirement: Admin page shows inline edit form per member

The AdminPage SHALL render an "編輯" button for each member row. Clicking the button SHALL expand an inline form pre-filled with the member's current name, email, and isActivated value. Clicking "取消" SHALL collapse the form without saving. Clicking "儲存" SHALL call PATCH and update the displayed row on success.

#### Scenario: Edit form opens and saves

- **WHEN** admin clicks "編輯" on a member row, modifies the name, and clicks "儲存"
- **THEN** the inline form SHALL collapse and the member row SHALL display the updated name without a full page reload
