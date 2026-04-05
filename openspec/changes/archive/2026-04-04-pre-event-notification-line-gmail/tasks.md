## 1. 環境設定與套件安裝

- [x] 1.1 在 `server/.env` 新增三個環境變數：`LINE_LOGIN_CLIENT_ID`、`LINE_LOGIN_CLIENT_SECRET`、`LINE_CHANNEL_ACCESS_TOKEN`，並在 `.env.example` 加入對應說明
- [x] 1.2 在 `server/` 目錄執行 `npm install @line/bot-sdk`，確認 `package.json` 已新增此依賴

## 2. Sheets 更新：Registrations Sheet 新增欄 J 儲存 lineUserId

- [x] 2.1 修改 `server/sheets.js` 的 `appendRegistration`，實作 lineUserId is stored in registrations sheet column J：函式簽名改為接受 `lineUserId` 參數（取代 `lineId`），在 `values` 陣列中欄 G 保留空字串，欄 J 寫入 `lineUserId`；row 格式：`[submittedAt, memberNumber, name, email, phone, company, '', '待確認', checkinToken, lineUserId]`（共 10 欄）
- [x] 2.2 修改 `server/sheets.js` 的 `getAllRegistrations`：讀取範圍從 `A2:I` 擴充至 `A2:J`，在回傳物件中加入 `lineUserId: row[9] || ''` 欄位（successful registration appends data to Google Sheets）

## 3. LINE Login OAuth 後端

- [x] 3.1 在 `server/index.js` 新增 `POST /api/auth/line/callback` 端點，實作 backend exchanges LINE authorization code for lineUserId：接受 `{ code, redirectUri }`，以 `axios.post` 向 `https://api.line.me/oauth2/v2.1/token` 換取 `access_token`（參數：`grant_type=authorization_code`、`code`、`redirect_uri`、`client_id=LINE_LOGIN_CLIENT_ID`、`client_secret=LINE_LOGIN_CLIENT_SECRET`），再以 `axios.get` 向 `https://api.line.me/v2/profile` 取得 `userId` 與 `displayName`，回傳 `{ lineUserId: userId, displayName }`；LINE API 失敗時回傳 HTTP 400 `{ error: "LINE authorization failed" }`；此端點為 LINE Login OAuth 在前端發起、後端換 token 的後端部分

## 4. LINE Login OAuth 前端

- [x] 4.1 修改 `client/src/components/RegistrationForm.jsx`，實作 registration form initiates LINE Login OAuth to obtain lineUserId：移除 `lineId` 文字輸入欄，改為「以 LINE 登入」按鈕；點擊時以 `window.location.href` 導向 LINE OAuth URL（LINE Login OAuth 在前端發起）：`https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${import.meta.env.VITE_LINE_LOGIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/line-callback')}&state=<random>&scope=profile`
- [x] 4.2 新增 `client/src/pages/LineCallbackPage.jsx`：從 URL query params 取得 `code`，POST 至 `/api/auth/line/callback`（帶 `redirectUri`），成功後將 `{ lineUserId, displayName }` 存入 `sessionStorage`，再以 `window.location.href` 導回 `/register`
- [x] 4.3 在 `client/src/App.jsx` 新增 `/line-callback` 路由，指向 `LineCallbackPage`
- [x] 4.4 修改 `RegistrationForm.jsx`，實作 authorized LINE identity is shown in registration form and submitted with registration：mount 時從 `sessionStorage` 讀取 `lineUserId` 與 `displayName`；若已授權顯示「✓ 已授權：{displayName}」綠色提示；未授權時 submit 按鈕保持 disabled 並顯示「請先完成 LINE 授權」
- [x] 4.5 修改 `RegistrationForm.jsx` 的 submit 邏輯：POST body 包含 `lineUserId`（取代 `lineId`）；若 `lineUserId` 為空，阻止送出並顯示「請先完成 LINE 授權」（registration form collects required fields）

## 5. 報名 API 更新（Successful registration appends data to Google Sheets）

- [x] 5.1 修改 `server/index.js` 的 `POST /api/register`：從 req.body 取出 `lineUserId`（不再取 `lineId`）；若 `lineUserId` 為空字串或未提供，回傳 HTTP 400 `{ error: "Missing lineUserId" }`；呼叫 `appendRegistration` 時傳入 `lineUserId`

## 6. LINE Multicast 發送模組

- [x] 6.1 建立 `server/line.js`，export `sendLineMulticast(userIds, messages)` 函式，實作 sendLineMulticast sends LINE push messages in batches of 500（LINE Messaging API 使用 Multicast）：先過濾 `userIds`，保留以 `"U"` 開頭且長度 >= 10 的有效 userId；將過濾後的 userId 切分為每批最多 500 個的陣列；對每批以 `axios.post` 呼叫 `https://api.line.me/v2/bot/message/multicast`，header 加入 `Authorization: Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`，body 為 `{ to: batch, messages }`；單批失敗以 `console.error` 記錄，繼續處理下一批；函式為 async，無回傳值

## 7. Gmail 課前提醒 Email

- [x] 7.1 在 `server/mailer.js` 新增 `sendPreEventReminderEmail(toEmail, { title, message })` async 函式，實作 sendPreEventReminderEmail sends an HTML reminder email：若 `EMAIL_USER` 未設定則直接 return；建立 transporter 並以 `sendMail` 發送，`subject` 為 `【課前通知】${title}`，`html` 包含 title（h2）與 message 文字，樣式與現有 email 一致（紫色主題、max-width 520px）；export 此函式

## 8. 課前通知後端端點

- [x] 8.1 在 `server/index.js` 新增 `POST /api/admin/notify-pre-event` 端點，實作 POST /api/admin/notify-pre-event sends notification to all registrants（課前通知端點獨立於現有 event-change-notification）：套用 `requireAdmin` middleware；接受 `{ title, message, channels }`；呼叫 `getAllRegistrations()` 取得所有報名資料；若 `channels` 包含 `"email"` 且 `EMAIL_USER` 已設定，以 `Promise.allSettled` 對所有唯一 email 非同步呼叫 `sendPreEventReminderEmail`，記錄 email 數量；若 `channels` 包含 `"line"` 且 `LINE_CHANNEL_ACCESS_TOKEN` 已設定，收集所有非空 `lineUserId`，呼叫 `sendLineMulticast(userIds, [{ type: 'text', text: \`${title}\n${message}\` }])`，記錄 line 數量；立即回傳 `{ queued: { email: N, line: M } }`

## 9. 後台課前通知 UI（Admin can compose and trigger a pre-event notification from the admin panel）

- [x] 9.1 修改 `client/src/pages/AdminPage.jsx`，實作 admin can compose and trigger a pre-event notification from the admin panel：在現有內容下方新增「課前通知」section；包含 `<input>` 標題欄、`<textarea>` 訊息欄、兩個 checkbox（Email 預設勾選、LINE 預設勾選）、「發送通知」`<button>`；button 在兩個 checkbox 皆未勾或 isSending 狀態時 disabled
- [x] 9.2 在 `AdminPage.jsx` 實作發送邏輯：點擊「發送通知」後設 `isSending=true`，POST 至 `/api/admin/notify-pre-event`（帶 `x-admin-password` header），成功後顯示 `已排入發送：Email ${queued.email} 封、LINE ${queued.line} 則`，失敗顯示錯誤訊息，最終重設 `isSending=false`
- [x] 9.3 在 `client/.env`（或 `.env.example`）新增 `VITE_LINE_LOGIN_CLIENT_ID` 並在 README 說明需填入 LINE Login Channel ID
