## 1. 後端：編輯會員資料 API（admin-member-edit）

- [x] 1.1 在 server/memberStore.js 新增 updateMember(memberId, fields) 函式：讀取 members.json，找到對應 memberId 後更新 name/email/isActivated，寫回檔案並回傳更新後的物件（Admin can edit member name and activation status）
- [x] 1.2 在 server/index.js 新增 PATCH /api/admin/members/:memberId（編輯會員資料採用 PATCH /api/admin/members/:memberId；Admin PATCH endpoint updates member fields），套用 requireAdmin middleware，呼叫 updateMember；若 memberId 不存在回傳 404（MemberId not found）
- [x] 1.3 在 PATCH handler 中，若請求包含 email 欄位，先以 findByEmail 確認新 email 不與其他會員重複，重複時回傳 409（Admin can edit member email with uniqueness validation）

## 2. 前端：編輯會員 inline 表單（admin-member-edit）

- [x] 2.1 在 AdminPage.jsx 每個會員列新增「編輯」按鈕，點擊後展開 inline 表單，預填目前的 name、email、isActivated（Admin page shows inline edit form per member）
- [x] 2.2 inline 表單包含：姓名 input、Email input、啟用狀態 checkbox、「儲存」按鈕、「取消」按鈕；點取消收起表單不儲存
- [x] 2.3 點「儲存」時呼叫 PATCH /api/admin/members/:memberId，成功後更新本地 members state 對應項目並收起表單；失敗時顯示錯誤訊息（Edit form opens and saves）

## 3. 後端：活動通知 Email（event-change-notification）

- [x] 3.1 在 server/mailer.js 新增 sendEventCancelNotificationEmail(toEmail, { eventTitle, message })：HTML 信件主題「【活動取消通知】」，內含活動名稱與 message 文字（Organizer can send event cancellation notification to all registrants）
- [x] 3.2 在 server/mailer.js 新增 sendEventChangeNotificationEmail(toEmail, { eventTitle, message })：HTML 信件主題「【活動資訊更新】」，內含活動名稱與 message 文字（Organizer can send event update notification to all registrants）
- [x] 3.3 在 server/index.js 新增 POST /api/admin/notify-event-change（活動異動通知採用 POST /api/admin/notify-event-change），套用 requireAdmin middleware；接受 { type: 'cancel'|'update', message, eventId? }，從 Sheets 取得所有報名者 email（registrations 工作表 D 欄去重），非同步發送對應函式，立即回傳 { queued: N }（No registrants exist scenario 處理）

## 4. 前端：活動通知 UI（event-change-notification）

- [x] 4.1 在 AdminPage.jsx 新增通知區塊：type 選擇器（下拉或 radio，選項：取消活動/資訊更改）、message textarea（placeholder「請輸入通知內容…」）、「發送通知」按鈕（Admin page provides event notification UI）
- [x] 4.2 點「發送通知」時呼叫 POST /api/admin/notify-event-change，送出期間 disable 按鈕顯示「發送中…」，成功後顯示「已發送通知給 N 位報名者」（Admin sends notification from UI）

## 5. 後端：多場活動支援（multi-event-management）

- [x] 5.1 在 server/sheets.js 更新 getEventInfo(eventId='001')、getAgenda(eventId='001')、appendRegistration({...}, eventId='001')、getRegistrationsByEmail(email, eventId='001')、markAttended(token, eventId='001')、getRegistrationByToken(token, eventId='001')（多活動以 Sheets 工作表名稱區分）：所有工作表名稱改為 `event-info-${eventId}`、`agenda-${eventId}`、`registrations-${eventId}`（Each event uses dedicated Google Sheets tabs）
- [x] 5.2 更新 initializeSheets(eventId='001') 以動態工作表名稱建立三個分頁並套用標題格式
- [x] 5.3 在 server/index.js 所有相關路由（GET /api/event、GET /api/agenda、POST /api/register、GET /api/checkin/qr、GET /api/checkin/mark、GET /api/member/registrations）從 req.query.eventId 取值（預設 '001'）傳入 sheets.js 函式（API routes accept eventId query parameter）
- [x] 5.4 在 server/.env 新增 DEFAULT_EVENT_ID=001

## 6. 前端：多活動切換（multi-event-management）

- [x] 6.1 在 client/src 建立 useEventId() custom hook：讀取 URL query string `?event=` 的值，缺省時回傳 '001'（Frontend supports event switching via URL parameter）
- [x] 6.2 在 EventInfoSection、AgendaSection、RegistrationForm 中引入 useEventId()，將 eventId 加入對應 API 請求的 query string
- [x] 6.3 在 MemberPage 的 registrations fetch 中加入 eventId query string

## 7. 前端：議程多天版面改進（agenda-multi-day-layout）

- [x] 7.1 在 AgendaSection.jsx 修正空場次繼承邏輯：session 欄位為空的列自動繼承前一列的場次名稱，不再歸入「全天」獨立欄（Agenda multi-day layout groups empty session rows under previous session）
- [x] 7.2 在 AgendaSection.jsx 新增動態場次樣式對應（getSessionStyle）：上午場/早上→morning、下午場/下午→afternoon、晚上場→evening、全天→fullday、Day1→day1、Day2→day2、Day3→day3、Day4→day4，其餘依序循環；欄標題 icon 對應更新（Agenda session columns use distinct color themes）
- [x] 7.3 在 client/src/App.css 新增 .agenda-col-label 的 day1/day2/day3/day4/evening/fullday CSS class（各含 background gradient、border、color），使多天分欄標題有獨立配色（Agenda multi-day layout）
- [x] 7.4 在 AgendaSection.jsx 將多欄排版改為 CSS Grid 逐行配對：標題列佔 grid 第一列，卡片逐 row 交錯排列，同行卡片自動等高（align-items: stretch）；欄數依場次數動態設定（最多 3）（Agenda session columns are equal height per row）
- [x] 7.5 在 AgendaCard 將講師欄位前綴從 ⚡ 符號改為「講師」文字（Agenda multi-day layout）
