## 1. Server：sheets.js 表單設定存入 J 欄

- [x] 1.1 在 `server/sheets.js` 的 `getEventInfo()` 中將讀取範圍從 `A2:I2` 改為 `A2:J2`，並解析 J 欄 JSON 為 `forms` 陣列（空或無效 JSON 時回傳 `[]`）——實現「Forms configuration is persisted in the event-info sheet column J」（表單設定儲存於 event-info sheet 的 J 欄（新增），與 fieldConfig 分離）
- [x] 1.2 在 `server/sheets.js` 的 `updateEventImages()` 中接受 `forms` 參數，將其序列化為 JSON 字串寫入 J2 欄（`spreadsheets.values.update`，range `J2`）
- [x] 1.3 在 `server/sheets.js` 新增 `getFormResponses(responseSheetId, responseEmailColumn)` 函式：呼叫 `spreadsheets.values.get`（range `Sheet1!A2:Z`），取出指定欄（0-based index）的所有值，回傳 `Set<string>`（小寫 email）；若 API 拋錯，則拋出自訂 Error——以 email 為 key 完成比對（不用姓名）

## 2. Server：GET /api/event 回傳 forms

- [x] 2.1 在 `server/index.js` 的 `GET /api/event` handler 中，將 `getEventInfo()` 回傳的 `forms` 欄位加入 response JSON（`{ title, date, location, description, imageUrl, dmUrl, agendaTagEn, agendaTagZh, fieldConfig, forms }`）——確保 Registration form collects required fields 所需的 forms 設定可由前台讀取

## 3. Server：PATCH /api/event 儲存 forms（Admin can configure up to 4 Google Forms for an event）

- [x] 3.1 在 `server/index.js` 的 `PATCH /api/event` handler 中，從 request body 取出 `forms`（若有），傳入 `updateEventImages()` 以寫入 J 欄；現有 `fieldConfig` 寫入 I 欄邏輯不變——Admin can configure up to 4 Google Forms for an event（儲存入 J 欄）

## 4. Server：POST /api/admin/generate-form-links（Server generates personalized pre-fill links for each registrant）

- [x] 4.1 在 `server/index.js` 新增 `POST /api/admin/generate-form-links` 端點：驗證 `x-admin-password` header；從 body 取 `eventId`；呼叫 `getEventInfo(eventId)` 取 `forms`；若 `forms` 為空陣列，回傳 HTTP 400 `{ error: "No forms configured for this event" }`——Server generates personalized pre-fill links for each registrant（預填連結生成在 server 端，避免前端暴露 Sheet ID）
- [x] 4.2 讀取 `registrations`（呼叫現有 `getRegistrations(eventId)`）；若無報名者回傳 `[]`；對每位報名者，對每個 form 將 `prefillTemplate` 中的 `{name}` 替換為 `encodeURIComponent(registrant.name)`、`{email}` 替換為 `encodeURIComponent(registrant.email)`；回傳格式：`[{ name, email, links: [{ formName, url }] }]`

## 5. Server：POST /api/admin/send-form-links Email 頻道（Admin can send pre-fill links via Email）

- [x] 5.1 在 `server/index.js` 新增 `POST /api/admin/send-form-links` 端點：驗證 admin 密碼；從 body 取 `{ eventId, channel }`；先執行 generate-form-links 邏輯取得每位報名者的連結清單——發送以現有服務為基礎，不新增第三方套件
- [x] 5.2 當 `channel === "email"` 時，對每位報名者：若 `email` 為空則計入 skipped；否則複用現有 nodemailer transporter 發送 email，主旨 `【課程表單】請填寫以下表單`，內文列出每個 form 名稱與個人化連結；回傳 `{ sent: N, skipped: M }`——Admin can send pre-fill links via Email

## 6. Server：POST /api/admin/send-form-links LINE 頻道（Admin can send pre-fill links via LINE）

- [x] 6.1 當 `channel === "line"` 時，對每位報名者：若 `lineUserId` 不以 `"U"` 開頭則計入 skipped；否則使用現有 LINE Messaging API `pushMessage` 發送訊息，內容列出每個 form 名稱與個人化連結；回傳 `{ sent: N, skipped: M }`——Admin can send pre-fill links via LINE

## 7. Server：GET /api/admin/form-completion（Server reads form response sheets and matches registrants by email）

- [x] 7.1 在 `server/index.js` 新增 `GET /api/admin/form-completion` 端點：驗證 admin 密碼（query param `password` 或 `x-admin-password` header）；從 query 取 `eventId`；呼叫 `getEventInfo(eventId)` 取 `forms` 與報名清單
- [x] 7.2 若 `forms` 為空陣列，回傳 `{ forms: [], registrants: [] }`；否則對每個 form 呼叫 `getFormResponses(responseSheetId, responseEmailColumn)`，API 失敗時記錄 error（formId、message）並將該 form 的 completed 欄位預設全 false——完成比對以 email 為 key（不用姓名）
- [x] 7.3 對每位報名者建立 `completed` 陣列（長度與 forms 相同），以 `registrant.email.toLowerCase()` 查詢各 form 的 email Set 是否包含；回傳 `{ forms: [{ id, name }], registrants: [{ name, email, completed }], errors? }`

## 8. Client：AdminPage 表單管理 UI（Admin can configure up to 4 Google Forms for an event）

- [x] 8.1 在 `client/src/pages/AdminPage.jsx` 登入後新增 `forms` state（陣列），在 fetch `/api/event` 後從 `data.forms` 初始化；新增 `newFormEntry` state（`{ name, prefillTemplate, responseSheetId, responseEmailColumn }`，預設 responseEmailColumn 為 1）——實現「Forms configuration is persisted in the event-info sheet column J」的前端設定儲存
- [x] 8.2 新增「表單管理」UI 區塊：列出現有 forms（顯示 name、prefillTemplate 摘要、responseSheetId），每筆有「刪除」按鈕（移除該 form，未點儲存前不寫入後端）；「新增表單」按鈕在已有 4 個 forms 時 disabled 並顯示「最多 4 個表單」
- [x] 8.3 點擊「新增表單」時，將 `newFormEntry` 加入 `forms` state（id 為 `f_${Date.now()}`）並清空 `newFormEntry`；「儲存表單設定」按鈕呼叫 `PATCH /api/event` 帶 `{ forms }`，成功顯示「✓ 已儲存」

## 9. Client：AdminPage 連結清單與複製（Admin can view and copy pre-fill links in the admin panel）

- [x] 9.1 在 AdminPage 新增「顯示連結清單」按鈕，點擊後呼叫 `POST /api/admin/generate-form-links`（帶 admin 密碼），結果存入 `linkList` state——Admin can view and copy pre-fill links in the admin panel（預填連結生成在 server 端，避免前端暴露 Sheet ID）
- [x] 9.2 `linkList` 有資料時渲染表格：欄位為「學員姓名」、「Email」、各 form 名稱（各一欄）；每個 form 欄顯示個人化預填 URL 為可點擊連結
- [x] 9.3 新增「全部複製」按鈕：將 `linkList` 轉為 tab 分隔純文字（每位報名者一行：`name\temail\turl1\turl2...`），呼叫 `navigator.clipboard.writeText()` 複製至剪貼簿

## 10. Client：AdminPage 批次發送（Admin can send pre-fill links via Email、Admin can send pre-fill links via LINE）

- [x] 10.1 在 AdminPage 新增「發送連結」區塊：兩個按鈕「寄送 Email」與「發送 LINE 訊息」；點擊後各自呼叫 `POST /api/admin/send-form-links`（帶 `channel: "email"` 或 `channel: "line"`），顯示 loading 狀態——發送以現有服務為基礎，不新增第三方套件
- [x] 10.2 API 回傳後顯示結果摘要：「已發送 N 筆，跳過 M 筆」；若發生錯誤顯示錯誤訊息

## 11. Client：AdminPage 完成狀況矩陣（Admin panel displays completion matrix）

- [x] 11.1 在 AdminPage 新增「完成狀況」區塊，含「重新整理」按鈕；點擊後呼叫 `GET /api/admin/form-completion?eventId=...`（帶 admin 密碼），將回傳存入 `completionData` state
- [x] 11.2 `completionData` 有資料時渲染矩陣表格：列為報名者（顯示姓名與 email），欄為各 form 名稱；各儲存格顯示綠色「✓」（completed）或灰色「—」（未完成）；最後一列顯示每欄完成人數（如「3 / 10」）——Admin panel displays completion matrix（Server reads form response sheets and matches registrants by email）
- [x] 11.3 若某 form 的回應 Sheet 無法讀取（errors 中有該 formId），該欄標題旁顯示 ⚠ icon，tooltip 文字為「無法讀取回應表（請確認已共用給 service account）」
