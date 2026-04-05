## Why

活動報名系統缺少後台管理介面、報名通知 Email、彈性議程標籤設定，以及 QR 碼掃描直接報到的功能。這些不足導致主辦單位需手動管理資料、無法即時通知，且 QR 碼體驗不佳（掃描後開啟信箱而非報到頁）。

## What Changes

- 新增 `/admin` 後台管理頁面，支援密碼登入、查看所有會員（含公司名稱）、單筆刪除、清空所有會員
- 新增報名成功後自動寄送兩封 Email：確認信給報名者、通知信給主辦單位
- 議程區塊的標題（英文 tag / 中文標題）及場次名稱（上午場/下午場）改由 Google Sheets 設定，不再硬編碼
- QR 碼內容從會員資訊文字改為報到網址（`http://<local-ip>:3001/api/checkin/mark?token=...`），掃描後直接開瀏覽器完成報到
- 報名表單加入必填驗證：每欄顯示紅色 `*`、送出時頂部顯示錯誤摘要、自動捲到第一個錯誤欄位
- Google Sheets 三個工作表（event-info、agenda、registrations）在 server 啟動時自動寫入紫色標題列並凍結第一列

## Non-Goals

- 後台管理不包含修改會員資料（僅查看與刪除）
- Email 通知不包含活動取消或更改通知
- 不支援多場活動同時管理

## Capabilities

### New Capabilities

- `admin-member-management`: 後台管理頁面，密碼保護，支援查看、刪除會員，整合報名資料顯示公司名稱
- `registration-email-notification`: 報名成功後自動寄送確認信（給報名者）與通知信（給主辦單位）
- `configurable-agenda-labels`: 議程區塊標題與場次標籤由 Google Sheets event-info 工作表 G2/H2 欄位控制，agenda 工作表新增 E 欄「場次」分組

### Modified Capabilities

- `checkin-qr`: QR 碼內容從離線文字改為線上報到網址，掃描後自動標記出席
- `event-registration`: 表單加入前端必填驗證，送出前顯示錯誤摘要

## Impact

- 新增檔案：`client/src/pages/AdminPage.jsx`
- 修改檔案：
  - `server/index.js`（新增 admin API、Email 發送、QR 網址生成）
  - `server/mailer.js`（新增 sendRegistrationConfirmationEmail、sendOrganizerNotificationEmail）
  - `server/sheets.js`（getEventInfo 讀 G2/H2、getAgenda 讀 E 欄、initializeSheets 函式）
  - `client/src/components/RegistrationForm.jsx`（前端驗證強化）
  - `client/src/components/AgendaSection.jsx`（動態場次分組）
  - `client/src/components/EventInfoSection.jsx`（議程標籤編輯器）
  - `client/src/App.jsx`（新增 /admin 路由）
  - `server/.env`（新增 ORGANIZER_EMAIL、ADMIN_PASSWORD、CLIENT_ORIGIN）
