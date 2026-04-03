# Spec: Admin Member Management

## Requirement: Admin PATCH endpoint updates member fields

The `PATCH /api/admin/members/:memberId` endpoint SHALL be protected by `requireAdmin` middleware. It SHALL accept a JSON body with any subset of `{ name, email, isActivated }` and apply the changes to the matching member in members.json via `memberStore.updateMember`.

### Scenario: Partial update with valid data

- **WHEN** PATCH is called with `{ name: "新名字" }` and correct admin password
- **THEN** only the name field SHALL be updated; other fields SHALL remain unchanged

## Requirements

### Requirement: Admin PATCH endpoint updates member fields

The `PATCH /api/admin/members/:memberId` endpoint SHALL be protected by `requireAdmin` middleware. It SHALL accept a JSON body with any subset of `{ name, email, isActivated }` and apply the changes to the matching member in members.json via `memberStore.updateMember`.

#### Scenario: Partial update with valid data

- **WHEN** PATCH is called with `{ name: "新名字" }` and correct admin password
- **THEN** only the name field SHALL be updated; other fields SHALL remain unchanged
