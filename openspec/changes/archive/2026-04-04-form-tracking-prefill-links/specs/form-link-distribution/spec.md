## ADDED Requirements

### Requirement: Admin can send pre-fill links via Email

The `POST /api/admin/send-form-links` endpoint SHALL accept `{ eventId, channel: "email" }` with admin password. It SHALL generate pre-fill links for all registrants (same logic as generate-form-links), then send one email per registrant containing all their personalized form links. The email subject SHALL be "【課程表單】請填寫以下表單" and the body SHALL list each form name with its clickable link. It SHALL return `{ sent: N, skipped: M }` where skipped counts registrants with no email address.

#### Scenario: Email batch send succeeds

- **WHEN** POST /api/admin/send-form-links is called with `channel: "email"` and all registrants have email addresses
- **THEN** each registrant SHALL receive one email with all form links, and the response SHALL return `{ sent: N, skipped: 0 }`

#### Scenario: Some registrants have no email

- **WHEN** POST /api/admin/send-form-links is called with `channel: "email"` and 2 of 10 registrants have no email
- **THEN** 8 emails SHALL be sent and the response SHALL return `{ sent: 8, skipped: 2 }`

### Requirement: Admin can send pre-fill links via LINE

The `POST /api/admin/send-form-links` endpoint SHALL accept `{ eventId, channel: "line" }`. It SHALL send a LINE push message to each registrant whose `lineUserId` starts with "U" (valid LINE user ID). The message SHALL list each form name followed by its personalized link. Registrants without a valid `lineUserId` SHALL be skipped. It SHALL return `{ sent: N, skipped: M }`.

#### Scenario: LINE batch send with mixed LINE IDs

- **WHEN** POST /api/admin/send-form-links is called with `channel: "line"` and 6 of 10 registrants have valid lineUserId (starting with "U")
- **THEN** 6 LINE messages SHALL be sent and the response SHALL return `{ sent: 6, skipped: 4 }`

### Requirement: Admin can view and copy pre-fill links in the admin panel

The admin panel SHALL have a "顯示連結清單" button that calls `POST /api/admin/generate-form-links`, then renders the result as a table with columns: 學員姓名, Email, and one column per form. Each cell SHALL contain the personalized pre-fill URL as a clickable link. A "全部複製" button SHALL copy all links as plain text (one registrant per line, tab-separated: name, email, url1, url2...) to the clipboard.

#### Scenario: Admin views link list

- **WHEN** admin clicks "顯示連結清單"
- **THEN** the panel SHALL display a table with one row per registrant and one link column per configured form

#### Scenario: Admin copies all links

- **WHEN** admin clicks "全部複製"
- **THEN** all link data SHALL be copied to clipboard as tab-separated values with one registrant per line
