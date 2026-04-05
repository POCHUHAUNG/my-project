## Context

目前系統已有 Gmail SMTP（`server/mailer.js`、nodemailer）以及後台管理頁面（`client/src/pages/AdminPage.jsx`）。報名表單（`client/src/components/RegistrationForm.jsx`）目前收集 `lineId` 文字欄位，但該字串無法用於 LINE Messaging API 推播。LINE 推播需要的是 LINE 系統分配的 `userId`（格式如 `Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`），只能透過 LINE Login OAuth 或 Webhook 取得。

## Goals / Non-Goals

**Goals:**

- 透過 LINE Login OAuth 在報名流程中取得每位報名者的 LINE `userId`
- 後台主辦人可手動觸發課前通知，同時透過 Gmail 及 LINE 推播發送
- 所有設計選擇對現有報名流程的衝擊降到最低

**Non-Goals:**

- 不支援排程自動發送
- 不支援 LINE Webhook 聊天互動
- 不儲存通知發送歷史
- 不支援分群發送（每次對象為全體報名者）

## Decisions

### LINE Login OAuth 在前端發起、後端換 token

前端 `RegistrationForm.jsx` 顯示「以 LINE 登入」按鈕，點擊後將使用者導向 LINE 授權頁：

```
https://access.line.me/oauth2/v2.1/authorize
  ?response_type=code
  &client_id=<LINE_LOGIN_CLIENT_ID>
  &redirect_uri=<CLIENT_ORIGIN>/line-callback
  &state=<random>
  &scope=profile
```

授權完成後 LINE 將使用者導回 `/line-callback?code=xxx&state=xxx`。前端將 `code` 送至後端：

```
POST /api/auth/line/callback  { code, redirectUri }
→ 後端向 LINE token endpoint 換取 access_token
→ 再向 LINE profile API 取得 userId、displayName
→ 回傳 { lineUserId, displayName }
```

前端將 `lineUserId` 存入 component state，顯示「已授權：{displayName}」，送出報名表單時一起 POST。

選擇前端發起（而非後端 redirect）的原因：報名表單是 SPA，後端 redirect 會打斷 React 狀態，改為前端開新視窗（`window.open`）或 redirect 再返回更符合現有架構。

### LINE Messaging API 使用 Multicast

課前通知使用 `POST https://api.line.me/v2/bot/message/multicast`，一次最多傳送 500 個 userId。若報名人數超過 500，分批處理（每批 500 人）。

```
server/line.js
  sendLineMulticast(userIds, messages)
    → 分批呼叫 multicast API
    → 失敗記 log，不中斷整體流程
```

選擇 multicast（而非 broadcast）：broadcast 會發給所有加好友的人，multicast 僅發給指定 userId 清單，符合「只通知已報名者」的需求。

### Registrations Sheet 新增欄 J 儲存 lineUserId

`appendRegistration` 在欄 J 寫入 `lineUserId`（原欄位 lineId 欄 G 保留但不再使用）。`getAllRegistrations` 新增讀取欄 J 回傳 `lineUserId`。

不刪除既有 lineId 欄（G）以維持向後相容，避免破壞現有 Sheet 格式。

### 課前通知端點獨立於現有 event-change-notification

現有 `POST /api/admin/notify-event-change` 僅處理活動取消／更新 Email，新增獨立的 `POST /api/admin/notify-pre-event` 端點處理課前通知（Email + LINE）。兩者分開可避免混用邏輯，未來也可各自擴充。

## Risks / Trade-offs

- **LINE userId 只在使用者有加官方帳號好友時才能推播**：若使用者未加好友，multicast 對該 userId 靜默失敗（LINE API 回 400，不影響其他接收者）。緩解：Email 同步發送作為 fallback。
- **LINE Login 需要獨立 Login Channel**：與 Messaging API Channel 不同，需在 LINE Developers Console 另行建立，並設定 Callback URL 白名單（`<CLIENT_ORIGIN>/line-callback`）。
- **前端暫存 lineUserId**：授權後 `lineUserId` 存於 React state，若使用者重整頁面需重新授權。緩解：授權後立即顯示確認狀態，引導使用者直接填表送出。
- **Gmail 群發速率**：Gmail SMTP 個人帳號每日上限約 500 封。報名人數大時有風險。緩解：超過限制屬已知限制，本次不處理（Non-Goal）。
