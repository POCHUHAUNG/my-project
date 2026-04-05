## 1. 後台管理 API（admin-member-management）

- [x] 1.1 在 server/index.js 新增 requireAdmin middleware（後台管理採用獨立頁面 + Header 密碼驗證），讀取 x-admin-password header 與 ADMIN_PASSWORD env 比對，不符回傳 401（Admin page requires password authentication）
- [x] 1.2 實作 GET /api/admin/members：讀取 members.json 並交叉比對 registrations sheet 取得公司名稱，排除敏感欄位後回傳（Admin can view all members with company name）
- [x] 1.3 實作 DELETE /api/admin/members/:memberId：從 members.json 刪除指定 memberId，找不到時回傳 404（Admin can delete individual members）
- [x] 1.4 實作 DELETE /api/admin/members：將 members.json 清空為 []（Admin can clear all members）
- [x] 1.5 在 server/.env 新增 ADMIN_PASSWORD 環境變數

## 2. 後台管理前端頁面（admin-member-management）

- [x] 2.1 建立 client/src/pages/AdminPage.jsx：包含密碼登入表單、密碼存入 sessionStorage
- [x] 2.2 AdminPage 顯示會員列表：編號、姓名、Email、公司名稱、啟用狀態、加入日期
- [x] 2.3 AdminPage 實作單筆刪除按鈕（含 window.confirm 二次確認）
- [x] 2.4 AdminPage 實作清空所有會員按鈕（含二次確認展開確認列）
- [x] 2.5 在 client/src/App.jsx 新增 /admin 路由

## 3. 報名 Email 通知（registration-email-notification）

- [x] 3.1 在 server/mailer.js 新增 sendRegistrationConfirmationEmail（Email 使用 Gmail SMTP + 應用程式密碼）：HTML 信件含活動資訊、會員編號、前往會員頁連結（Member receives registration confirmation email）
- [x] 3.2 在 server/mailer.js 新增 sendOrganizerNotificationEmail：回傳若 ORGANIZER_EMAIL 未設定則直接 return（Organizer receives new registration notification email）
- [x] 3.3 在 POST /api/register 流程中，EMAIL_USER 有值時依序呼叫 sendRegistrationConfirmationEmail 與 sendOrganizerNotificationEmail，失敗僅 log 不中斷流程
- [x] 3.4 在 server/.env 新增 ORGANIZER_EMAIL 與 CLIENT_ORIGIN 環境變數

## 4. 議程標籤可設定（configurable-agenda-labels）

- [x] 4.1 更新 getEventInfo() 讀取範圍至 A2:H2（議程標籤存於 event-info 工作表 G2/H2），回傳 agendaTagEn（G2）與 agendaTagZh（H2），空值時預設 "Schedule"/"活動議程"（Agenda section title is configurable via Sheets）
- [x] 4.2 更新 getAgenda() 讀取範圍至 A2:E，回傳每列的 session 欄位（Agenda items are grouped by session column）
- [x] 4.3 更新 updateEventImages() 支援 agendaTagEn 與 agendaTagZh 欄位，對應 Sheets G2/H2（Admin can update agenda labels via PATCH /api/event）
- [x] 4.4 更新 PATCH /api/event route 接受 agendaTagEn 與 agendaTagZh
- [x] 4.5 更新 AgendaSection.jsx：同時 fetch /api/event 取得標題，依 session 欄位動態分組，單一場次時渲染單欄佈局
- [x] 4.6 在 EventInfoSection.jsx 新增 AgendaLabelEditor 元件，點擊 ✏️ 修改可編輯並 PATCH 儲存

## 5. QR 碼改為報到網址（checkin-qr）

- [x] 5.1 在 server/index.js 引入 os 模組，新增 getLocalIP() 函式（QR 碼改為報到 URL），取得第一個非 internal IPv4 地址（QR code encodes a check-in URL）
- [x] 5.2 更新 GET /api/checkin/qr：QR 內容改為 `${SERVER_BASE_URL || http://<localIP>:<PORT>}/api/checkin/mark?token=<token>`
- [x] 5.3 更新 GET /api/checkin/mark 找不到 token 時回傳完整 HTML 錯誤頁（紅色主題，含說明文字）

## 6. 表單驗證強化（event-registration）

- [x] 6.1 更新 RegistrationForm.jsx：每個欄位 label 後加入紅色 * 必填標記（Registration form validates all required fields before submission）
- [x] 6.2 送出時若有錯誤，在表單頂部顯示紅色摘要框列出所有未填欄位
- [x] 6.3 送出時自動捲動到第一個錯誤欄位

## 7. Sheets 初始化（configurable-agenda-labels）

- [x] 7.1 在 server/sheets.js 新增 initializeSheets()（Sheets 初始化在 server 啟動時自動執行）：對三個工作表寫入標題列（含新欄位）並套用紫色背景白色粗體格式，凍結第一列
- [x] 7.2 在 server/index.js 的 app.listen callback 中非同步呼叫 initializeSheets()，失敗只 warn
- [x] 7.3 新增 POST /api/admin/init-sheets 端點供手動觸發
