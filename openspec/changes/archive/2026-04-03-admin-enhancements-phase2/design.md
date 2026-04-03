## Context

系統為 Node.js/Express + React 的活動報名平台。會員資料存於 `server/data/members.json`，活動與報名資料存於 Google Sheets。本次變更為三個獨立功能的擴充，影響後端 API、前端管理頁、Email 發送、Sheets 資料結構。

## Goals / Non-Goals

**Goals:**

- 管理員可在後台 inline 編輯單一會員的姓名、Email、啟用狀態
- 主辦單位可一鍵發送活動取消或資訊更改通知給所有報名者
- 系統支援多場活動，各活動資料獨立存放於 Sheets 不同工作表

**Non-Goals:**

- 不支援管理員修改會員密碼
- 通知 Email 不支援自訂 HTML 模板
- 多活動不支援跨活動的報名者統計報表

## Decisions

### 編輯會員資料採用 PATCH /api/admin/members/:memberId

PATCH endpoint 接受 `{ name, email, isActivated }` 欄位（均為 optional）。修改 Email 時須驗證新 Email 在 members.json 中不與其他會員重複，重複時回傳 409。前端 AdminPage 以 inline 展開編輯表單（點編輯按鈕展開，點取消收起），儲存後更新本地 state 不需重新 fetch 全部。

### 活動異動通知採用 POST /api/admin/notify-event-change

endpoint 接受 `{ type: 'cancel' | 'update', message: string, eventId?: string }`。後端讀取對應活動的所有報名者 Email（從 Sheets registrations 工作表），逐一發送 HTML 通知信。發送結果（成功數、失敗數）回傳給前端顯示。

### 多活動以 Sheets 工作表名稱區分

每場活動對應三個工作表：`event-info-<id>`、`agenda-<id>`、`registrations-<id>`（id 為短識別碼如 `001`、`002`）。`spreadsheetId()` 維持不變，所有 sheets.js 函式新增 `eventId` 參數，預設值為 `process.env.DEFAULT_EVENT_ID || '001'`。前端透過 URL 參數 `?event=001` 切換活動，API 路由透過 query string `?eventId=001` 傳遞。

## Risks / Trade-offs

- [Email 大量發送] 報名人數多時逐一發送可能超時 → 後端非同步執行，立即回傳 `{ queued: N }` 不等待完成
- [多活動工作表命名] 若使用者在 Sheets 自行改名會導致 API 找不到 → 在 init-sheets 時統一建立，並在 README 說明命名規則
- [Email 修改後舊 token 仍有效] 修改 Email 不自動清除 JWT → 可接受，JWT 本身有效期限保護
