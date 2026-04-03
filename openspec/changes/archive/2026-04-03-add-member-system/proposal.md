## Why

活動報名後參加者無法追蹤自己的報名記錄，也無法存取會員專屬內容。透過「報名即成為會員」機制，讓參加者在完成報名的同時自動取得帳號，後續可登入查看個人報名紀錄與會員專屬資訊。同時提供 QR code 報到、出席狀態追蹤、首頁會員狀態區塊，以及管理員可用的後台報表。

## What Changes

- 報名表單提交成功後，系統自動以 Email 建立會員帳號，產生臨時密碼顯示於報名成功畫面
- 新增登入 / 登出功能（JWT-based session）
- 新增會員個人頁面：顯示報名紀錄（含課程名稱、日期、地點、出席狀態）與 QR code
- 首頁右上角固定顯示會員登入狀態，已登入時展開面板顯示報名狀態與歷史
- 忘記密碼：自助 Email 重設流程；管理員可用指令列腳本重設任意會員密碼
- Google Sheets 後台：欄位順序調整、台灣時區時間格式、紫色標題列、會員流水號（001/002/…）
- 每筆報名產生唯一 QR code 報到碼，掃碼後自動標記出席狀態並寫回 Sheets
- 活動主視覺與課程 DM 上傳後寫回 Sheets，重整不消失；顯示縮圖與「更新」按鈕

## Non-Goals (optional)

<!-- 留給 design.md 記錄 -->

## Capabilities

### New Capabilities

- `member-auth`: 會員認證系統 — 報名自動建立帳號、臨時密碼顯示、JWT 登入 / 登出、token 驗證 middleware、忘記密碼 Email 重設、管理員指令列重設
- `member-profile`: 會員個人頁面 — 顯示報名紀錄（課程名稱、日期、地點、出席狀態）、QR code 掃碼報到、會員專屬內容區塊、更改密碼功能
- `member-gated-registration`: 報名需登入 — 未認證用戶提交報名時導向登入流程，登入後自動恢復報名資料並提交
- `checkin-qr`: QR code 報到系統 — 每筆報名產生唯一 checkinToken、`GET /api/checkin/qr` 回傳 QR code PNG（含區域網路 IP）、`GET /api/checkin/mark` 掃碼標記已出席並回傳確認頁面
- `member-status-widget`: 首頁會員狀態浮動按鈕 — 右上角固定顯示，未登入顯示登入入口，已登入展開下拉面板含報名狀態、歷史紀錄、QR code
- `event-image-persistence`: 活動圖片持久化 — `PATCH /api/event` 將 imageUrl/dmUrl 寫回 Sheets E2/F2，上傳後重整不消失，顯示縮圖與更新按鈕

### Modified Capabilities

- `event-registration`: 報名成功後額外觸發會員帳號建立流程、產生臨時密碼、寫入 Sheets 使用流水號會員編號與 checkinToken；報名紀錄 API 合併活動資訊（課程名稱、日期、地點）

## Impact

- 新增 API 路由：`POST /api/auth/login`、`POST /api/auth/forgot-password`、`POST /api/auth/set-password`、`GET /api/member/me`、`GET /api/member/registrations`、`POST /api/member/change-password`、`PATCH /api/event`、`GET /api/checkin/qr`、`GET /api/checkin/mark`
- 新增前端頁面：`/login`、`/member`、`/set-password`、`/forgot-password`
- 新增前端元件：`MemberStatus`（首頁浮動狀態）、`ImageUploadPersist`（縮圖 + 更新）
- 修改：`RegistrationForm.jsx`（臨時密碼顯示）、`App.jsx`（路由）、`EventInfoSection.jsx`（圖片持久化）
- 新增：`server/auth.js`、`server/memberStore.js`、`server/mailer.js`、`server/reset-password.js`
- 修改：`server/index.js`（所有新路由）、`server/sheets.js`（欄位調整、格式化、markAttended、updateEventImages）
- 新增依賴：`jsonwebtoken`、`bcryptjs`、`nodemailer`、`qrcode`
- Google Sheets `registrations` 工作表：A=報名時間（台灣時區）、B=會員編號（流水號）、C=姓名、D=Email、E=電話、F=公司/單位、G=LINE ID、H=出席狀態、I=報到代碼；標題列紫色樣式，第一列凍結
- `server/data/members.json`：新增 `memberNumber` 欄位（三位數流水號）
