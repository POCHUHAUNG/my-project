## Why

主辦單位需要在活動前主動通知所有已報名的學員，目前系統缺少課前提醒機制，且無法透過 LINE 推播觸及參與者。現有 `lineId` 欄位僅為使用者自填字串，無法用於 LINE Messaging API 推播。

## What Changes

- 報名表單以 **LINE Login OAuth** 取代原本的 LINE ID 文字欄位，強制授權以取得系統 `lineUserId`，寫入 Registrations Sheet 新欄 J
- 後台新增「課前通知」區塊，主辦人可撰寫標題與訊息，選擇透過 Gmail 和／或 LINE 發送
- 新增 `POST /api/admin/notify-pre-event` 端點，讀取所有報名者的 email 與 lineUserId，分別透過 nodemailer（Gmail SMTP）群發 Email 及 LINE Messaging API Multicast 推播
- 新增 `GET /api/auth/line/callback` 端點處理 LINE Login OAuth 回調，回傳 `lineUserId` 給前端
- 新增 `sendPreEventReminderEmail()` 於 `server/mailer.js`

## Non-Goals

- 不支援排程（自動在活動前 N 小時發送）；本次僅支援手動觸發
- 不修改 LINE 官方帳號的自動回覆或 Webhook 聊天功能
- 不支援個別發送（每次通知對象為全體報名者）
- 不儲存通知歷史記錄

## Capabilities

### New Capabilities

- `line-login-oauth`: 報名時透過 LINE Login OAuth 取得 `lineUserId`，儲存於 Registrations Sheet 欄 J，取代原本的 lineId 文字欄位
- `pre-event-notification`: 後台觸發課前通知，同時透過 Gmail 群發 Email 及 LINE Messaging API Multicast 推播給所有報名者

### Modified Capabilities

- `event-registration`: 報名表單移除 lineId 文字輸入欄，改為 LINE Login OAuth 授權按鈕（必填），`POST /api/register` 接受 `lineUserId` 取代 `lineId`

## Impact

- 新增檔案：
  - `server/line.js`（LINE Messaging API multicast 函式）
- 修改檔案：
  - `server/index.js`（新增 `/api/auth/line/callback`、`/api/admin/notify-pre-event` 端點）
  - `server/mailer.js`（新增 `sendPreEventReminderEmail`）
  - `server/sheets.js`（`appendRegistration` 接受 `lineUserId`、寫入欄 J；`getAllRegistrations` 新增回傳 `lineUserId`）
  - `client/src/components/RegistrationForm.jsx`（LINE Login OAuth 按鈕取代 lineId 欄位）
  - `client/src/pages/AdminPage.jsx`（新增課前通知區塊）
  - `server/.env`（新增 `LINE_LOGIN_CLIENT_ID`、`LINE_LOGIN_CLIENT_SECRET`、`LINE_CHANNEL_ACCESS_TOKEN`）
- 新增 npm 套件：`@line/bot-sdk`（server）
