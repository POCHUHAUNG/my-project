## ADDED Requirements

### Requirement: Member list supports search by name or email

The admin member list SHALL include a text search input with placeholder "搜尋姓名或 Email". As the admin types, the displayed member rows SHALL be filtered in real time (case-insensitive) to include only members whose name or email contains the query string. The filter SHALL apply without any API call. When the search query changes, the current page SHALL reset to 1.

#### Scenario: Filter by name substring

- **WHEN** admin types a name substring into the search input
- **THEN** only member rows whose name contains the query (case-insensitive) SHALL be shown

#### Scenario: Filter by email substring

- **WHEN** admin types an email substring into the search input
- **THEN** only member rows whose email contains the query (case-insensitive) SHALL be shown

#### Scenario: Search reset clears filter

- **WHEN** admin clears the search input
- **THEN** all member rows SHALL be shown

### Requirement: Member list supports pagination with selectable page size

The admin member list SHALL display members in pages. The page size SHALL be selectable from the options 20, 30, 40, 50, defaulting to 20. A pagination control SHALL appear below the table showing the current page, total pages, and prev/next navigation buttons. Prev SHALL be disabled on page 1; next SHALL be disabled on the last page. When the page size selection changes, the current page SHALL reset to 1. Pagination SHALL apply to the search-filtered result set.

#### Scenario: Default page size is 20

- **WHEN** admin opens the member list with more than 20 members
- **THEN** only the first 20 members SHALL be shown and the page size selector SHALL show 20 as selected

#### Scenario: Page size change resets to page 1

- **WHEN** admin is on page 2 and changes the page size selector
- **THEN** the current page SHALL reset to 1 and the correct slice of members SHALL be displayed

#### Scenario: Search change resets to page 1

- **WHEN** admin is on page 3 and types into the search input
- **THEN** the current page SHALL reset to 1 and only matching members SHALL be shown

#### Scenario: Navigation buttons respect boundaries

- **WHEN** admin is on the first page
- **THEN** the prev button SHALL be disabled

- **WHEN** admin is on the last page
- **THEN** the next button SHALL be disabled
