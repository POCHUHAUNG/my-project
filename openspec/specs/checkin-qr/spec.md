## Requirements

### Requirement: Registration generates a unique check-in token

Each registration record SHALL have a unique `checkinToken` (UUID v4) generated at the time of registration and stored in column I of the `registrations` Google Sheet.

#### Scenario: Member submits registration

- **WHEN** `POST /api/register` succeeds
- **THEN** `appendRegistration` SHALL generate a `checkinToken` via `crypto.randomUUID()`, write it to column I of the registrations sheet, and return it to the caller

---
### Requirement: QR code is generated from check-in token

The system SHALL provide an endpoint that generates a QR code PNG image encoding a check-in URL containing the member's `checkinToken`.

#### Scenario: QR code endpoint is requested

- **WHEN** `GET /api/checkin/qr?token=<checkinToken>` is called
- **THEN** the system SHALL resolve the server's local network IP (first IPv4 address starting with `192.` from `os.networkInterfaces()`), construct the URL `http://<localIp>:<PORT>/api/checkin/mark?token=<token>`, generate a 220px PNG QR code using the `qrcode` package, and respond with `Content-Type: image/png`

#### Scenario: Token parameter is missing

- **WHEN** `GET /api/checkin/qr` is called without a `token` query parameter
- **THEN** the system SHALL return HTTP 400 `{ "error": "Missing token" }`

---
### Requirement: Scanning QR code marks attendance as attended

The system SHALL provide an endpoint that, when accessed by scanning the QR code, marks the corresponding registration as attended and returns a confirmation page.

#### Scenario: Admin scans a valid QR code

- **WHEN** `GET /api/checkin/mark?token=<checkinToken>` is called with a token matching column I of a registration row
- **THEN** the system SHALL update column H of that row to `已出席` in the Google Sheet and respond with an HTML confirmation page displaying the member's name, email, and company

#### Scenario: QR code token not found

- **WHEN** `GET /api/checkin/mark?token=<token>` is called with a token that does not match any registration
- **THEN** the system SHALL return HTTP 404 with an error message

---
### Requirement: Member page displays QR code for each registration

The member profile page SHALL display a QR code image for each registration that has a `checkinToken`.

#### Scenario: Member views registration history with QR code

- **WHEN** a logged-in member views `/member` and a registration record has a non-empty `checkinToken`
- **THEN** the page SHALL render an `<img>` element with `src="/api/checkin/qr?token=<checkinToken>"` (90×90px) alongside the registration details
