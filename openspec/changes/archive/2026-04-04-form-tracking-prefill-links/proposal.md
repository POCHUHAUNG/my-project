## Why

課程中學員需填寫 3 個調查表單與 1 個小測驗，主辦單位目前須手動逐一比對 Google Forms 回應與報名名單，耗費大量時間。需要自動化「發送個人化預填連結」與「完成狀況追蹤」，讓後台一眼看出誰填了哪些表單。

## What Changes

- 管理後台新增「表單管理」區塊，可設定最多 4 個 Google Forms（名稱、預填 URL 模板、回應 Sheet ID）
- 系統為每位報名學員生成個人化預填連結（URL 中自動帶入姓名與 Email）
- 管理後台可一鍵透過 Email 或 LINE 批次發送預填連結給所有學員；亦可顯示連結清單供主辦人複製
- 後台新增「完成狀況」頁面，從各表單的 Google Sheets 回應讀取資料，以 email 比對報名學員，顯示完成矩陣（學員 × 表單）

## Capabilities

### New Capabilities

- `form-config-management`：管理後台設定 Google Forms 表單清單（名稱、預填 URL 模板、回應 Sheet ID）並存入活動設定
- `prefill-link-generation`：依報名學員的姓名與 email，將預填 URL 模板中的 `{name}` 與 `{email}` 佔位符替換，生成個人化 Google Forms 預填連結
- `form-link-distribution`：批次發送預填連結——支援 Email（透過現有 email 服務）、LINE（透過現有 LINE Messaging API）、及後台複製清單三種方式
- `form-completion-tracking`：讀取各表單對應的 Google Sheets 回應資料，以 email 比對報名學員，於後台顯示完成矩陣

### Modified Capabilities

- `event-registration`：活動設定（event-info sheet 欄位 I）新增 `forms` 陣列，儲存表單設定清單（原 `fieldConfig` 擴充）

## Impact

- Affected specs: form-config-management（新）、prefill-link-generation（新）、form-link-distribution（新）、form-completion-tracking（新）、event-registration（改）
- Affected code:
  - `server/sheets.js`：新增 `getFormResponses()` 讀取表單回應 Sheet
  - `server/index.js`：新增 `GET /api/admin/form-completion`、`POST /api/admin/send-form-links` 端點
  - `client/src/pages/AdminPage.jsx`：新增表單設定區塊、發送按鈕、完成矩陣表格
