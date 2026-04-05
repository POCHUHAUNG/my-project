## ADDED Requirements

### Requirement: QR code encodes a check-in URL

The `GET /api/checkin/qr` endpoint SHALL generate a QR code PNG whose content is a check-in URL in the format `http://<server-base>:<port>/api/checkin/mark?token=<checkinToken>`. The server base address SHALL be determined by `process.env.SERVER_BASE_URL` if set, otherwise by the first non-internal IPv4 address returned by `os.networkInterfaces()`. The QR code SHALL NOT embed plain-text member information.

#### Scenario: QR code scanned on local network

- **WHEN** a member scans the QR code with a smartphone on the same network
- **THEN** the phone browser SHALL open the check-in URL and the server SHALL mark the member as attended

#### Scenario: SERVER_BASE_URL is set

- **WHEN** `process.env.SERVER_BASE_URL` is set to "https://example.com"
- **THEN** the QR content SHALL be `https://example.com/api/checkin/mark?token=<token>`
