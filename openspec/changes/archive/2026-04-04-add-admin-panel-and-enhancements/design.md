## Context

系統為單一 Node.js/Express 後端 + React 前端的活動報名平台。會員資料存於 `server/data/members.json`，報名與活動資料存於 Google Sheets。本次變更跨越後端 API、前端頁面、Email 發送、Google Sheets 資料結構四個面向。

## Goals / Non-Goals

**Goals:**

- 提供密碼保護的後台管理頁面，讓主辦單位可管理會員資料
- 報名完成後自動寄送 Email 通知（報名者確認信、主辦通知信）
- 讓議程標題與場次名稱可透過 Sheets 設定，無需改程式碼
- QR 碼掃描直接觸發報到，避免跳信箱的問題
- 報名表單在前端即時驗證必填欄位

**Non-Goals:**

- 後台不支援編輯會員資料內容
- Email 不支援 HTML 圖片附件
- 不支援多場活動切換

## Decisions

### 後台管理採用獨立頁面 + Header 密碼驗證

後台路由 `/admin` 為獨立 React 頁面，密碼存於 `sessionStorage`，每次 API 請求帶 `x-admin-password` header，後端 `requireAdmin` middleware 比對 `process.env.ADMIN_PASSWORD`。
選擇 header 而非 JWT 是因為後台為單人使用的維護工具，不需要 session 管理複雜度。

### Email 使用 Gmail SMTP + 應用程式密碼

沿用既有 nodemailer + Gmail 設定，新增兩個函式：`sendRegistrationConfirmationEmail`（給報名者）與 `sendOrganizerNotificationEmail`（給主辦）。
發送失敗為 non-fatal（catch 後只 log），不影響報名流程。
`ORGANIZER_EMAIL` 為空時自動跳過主辦通知。

### 議程標籤存於 event-info 工作表 G2/H2

`getEventInfo()` 讀取範圍從 `A2:F2` 擴展至 `A2:H2`，G2=agendaTagEn、H2=agendaTagZh。
前端 AgendaSection 同時 fetch `/api/event` 取得標籤，依 agenda 各列的 E 欄（場次）分組顯示。單一場次時不顯示場次標頭，多場次時並排顯示。

### QR 碼改為報到 URL

`/api/checkin/qr` 不再嵌入文字，改用 `http://<local-ip>:<PORT>/api/checkin/mark?token=<uuid>` 作為 QR 內容。本機 IP 透過 `os.networkInterfaces()` 自動偵測，可被 `SERVER_BASE_URL` 環境變數覆寫。

### Sheets 初始化在 server 啟動時自動執行

`initializeSheets()` 在 `app.listen` callback 中非同步呼叫（失敗只 warn，不中斷啟動），同時也作為 `POST /api/admin/init-sheets` 端點供手動觸發。

## Risks / Trade-offs

- [本機 IP 偵測] 若機器有多張網卡，`getLocalIP()` 取第一個非 internal IPv4，可能非預期介面 → 使用 `SERVER_BASE_URL` env 覆寫
- [members.json 並發寫入] writeQueue 序列化寫入，但 server 重啟中的請求仍有遺失風險 → 已為可接受範圍（非生產資料庫）
- [Email 密碼明文存 .env] 使用 Gmail 應用程式密碼而非主密碼，降低風險；.env 不進版控
