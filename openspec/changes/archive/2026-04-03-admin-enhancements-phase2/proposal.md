## Why

現有後台管理僅支援查看與刪除會員，無法修改姓名、Email 等基本資料。Email 通知只涵蓋報名成功，缺少活動異動（取消、時間地點更改）的主動通知。系統目前僅支援單一活動，主辦單位無法同時管理多場活動，限制了平台的擴充性。

## What Changes

- 後台管理頁面新增「編輯會員資料」功能：可修改姓名、Email、啟用狀態
- 新增活動通知 Email 功能：主辦單位可從後台發送「活動取消」或「活動資訊更改」通知信給所有已報名會員
- 系統改為多場活動架構：Google Sheets 支援多個活動工作表，前端可切換活動，報名與報到依活動 ID 區分
- 議程版面改進：支援 Day1/Day2 多天分欄（含配色）、欄間卡片等高排列、空場次自動繼承前一列場次、講師標籤文字化

## Capabilities

### New Capabilities

- `admin-member-edit`: 後台管理員可修改指定會員的姓名、Email（唯一性驗證）、isActivated 狀態
- `event-change-notification`: 主辦單位可從後台發送活動取消或資訊更改通知 Email 給所有該活動的報名者
- `multi-event-management`: 系統支援多場活動，每場活動有獨立的 eventId，Google Sheets 以工作表名稱（如 `event-001`）區分，前端提供活動切換介面
- `agenda-multi-day-layout`: 議程支援 Day1/Day2/Day3 多天分欄顯示，各天配色不同；欄間卡片以 CSS Grid 等高排列；空場次列自動繼承前一列場次歸組；講師欄位以「講師」文字顯示取代符號

### Modified Capabilities

- `admin-member-management`: 新增 PATCH /api/admin/members/:memberId 端點支援更新姓名、Email、isActivated

## Impact

- 新增檔案：（無）
- 修改檔案：
  - `server/index.js`（新增 PATCH /api/admin/members/:memberId、POST /api/admin/notify-event-change、多活動路由）
  - `server/mailer.js`（新增 sendEventChangeNotificationEmail、sendEventCancelNotificationEmail）
  - `server/sheets.js`（多活動支援：eventId 參數化、動態工作表名稱）
  - `server/memberStore.js`（新增 updateMember 函式）
  - `client/src/pages/AdminPage.jsx`（新增編輯會員 inline 表單、活動通知發送 UI）
  - `client/src/App.jsx`（多活動切換路由）
  - `client/src/components/AgendaSection.jsx`（多天分欄、等高 Grid、空場次繼承、講師標籤）
  - `client/src/App.css`（day1/day2/day3/day4/evening/fullday 欄位配色 CSS classes）
