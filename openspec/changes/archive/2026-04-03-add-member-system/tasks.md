## 1. 環境與依賴設定

- [x] 1.1 安裝 server 依賴：`jsonwebtoken`、`bcryptjs`、`nodemailer`、`uuid`
- [x] 1.2 安裝 client 依賴：`react-router-dom`（v6）
- [x] 1.3 在 `server/.env` 新增環境變數：`JWT_SECRET`（隨機字串，至少 32 字元）、`EMAIL_USER`（Gmail 帳號）、`EMAIL_PASS`（Gmail 應用程式密碼）
- [x] 1.4 建立 `server/data/` 目錄，加入空的 `members.json`（初始內容：`[]`），並在 `server/.gitignore` 排除 `data/members.json`

## 2. 後端 — 會員資料存取層（memberStore）

- [x] 2.1 依照「會員資料儲存：本機 JSON 檔（members.json）」決策與「members.json 資料結構」定義，建立 `server/memberStore.js`：實作 `readMembers()`、`writeMembers(members)`、`findByEmail(email)`、`findByToken(token)`、`createMember({ email, name })`（產生 UUID、memberNumber 三位流水號、setPasswordToken、到期時間）、`activateMember(token, passwordHash)`
- [x] 2.2 在 `server/memberStore.js` 實作並發安全：以 module-level `let writing = false` flag 序列化寫入操作，避免同時寫入造成資料遺失
- [x] 2.3 新增 `setPasswordByEmail(email, passwordHash)`：直接更新 passwordHash 並啟用帳號（不需 token），用於臨時密碼流程
- [x] 2.4 新增 `generateResetToken(email)`：產生新 UUID token 並更新 setPasswordToken / setPasswordTokenExpiry（24 小時），用於忘記密碼流程

## 3. 後端 — JWT 工具與 middleware

- [x] 3.1 建立 `server/auth.js`：實作 `signToken(payload)`（HS256，7 天到期）、`verifyToken(token)`（回傳 payload 或拋出錯誤）
- [x] 3.2 依照「JWT 認證策略」決策，在 `server/auth.js` 建立 `requireAuth` Express middleware 以實作「JWT middleware protects member API routes」：從 `Authorization: Bearer <token>` header 驗證 JWT；token 無效或缺少時回傳 HTTP 401；成功時將 `{ memberId, email }` 附加至 `req.member`

## 4. 後端 — Email 工具

- [x] 4.1 建立 `server/mailer.js`：初始化 nodemailer transporter，實作 `sendSetPasswordEmail(toEmail, token)`（寄送含設定密碼連結的 HTML Email）
- [x] 4.2 新增 `sendResetPasswordEmail(toEmail, token)`：寄送密碼重設 Email，連結格式為 `${CLIENT_ORIGIN}/set-password?token=<token>`

## 5. 後端 — 認證 API 路由

- [x] 5.1 在 `server/index.js` 新增 `POST /api/auth/set-password`（「Member account activation via set-password email」）：驗證 token 與新密碼（isStrongPassword：≥8 字元、含大寫/小寫/數字），以 bcrypt（cost 10）hash 後呼叫 `activateMember`；實作「設定密碼 Email（nodemailer + Gmail SMTP）」流程的接收端
- [x] 5.2 新增 `POST /api/auth/login`（「Member login with email and password」）：以 bcrypt.compare 驗證密碼；帳號未啟用回傳 HTTP 403；憑證錯誤回傳 HTTP 401；成功時以 `signToken({ memberId, email })` 回傳 JWT；實作「API 路由設計（會員相關）」中的登入路由
- [x] 5.3 新增 `POST /api/auth/forgot-password`：以 email 查找會員，呼叫 `generateResetToken`，寄送 `sendResetPasswordEmail`；回應永遠為 200（防止 email 枚舉攻擊）；僅在 EMAIL_USER 設定時才寄信

## 6. 後端 — 會員 API 路由

- [x] 6.1 新增 `GET /api/member/me`（套用 `requireAuth`）：回傳 `{ memberId, email, name, createdAt }`
- [x] 6.2 新增 `GET /api/member/registrations`（套用 `requireAuth`）：並行呼叫 `getRegistrationsByEmail` 與 `getEventInfo`，將活動資訊（title, date, location）合併至每筆報名記錄後回傳
- [x] 6.3 新增 `POST /api/member/change-password`（套用 `requireAuth`）：驗證 currentPassword（bcrypt.compare），通過後以新密碼呼叫 `setPasswordByEmail`

## 7. 後端 — 修改報名 API

- [x] 7.1 修改 `server/index.js` 的 `POST /api/register`（「報名即建立帳號（自動建立，寄送設定密碼連結）」）：不再硬性要求登入；附帶 token 時以 optional auth 識別會員；實作「Registration automatically creates a member account」：對新會員呼叫 `generateTempPassword`、bcrypt hash 後呼叫 `setPasswordByEmail` 立即啟用，回應加入 `tempPassword`
- [x] 7.2 新增 `generateTempPassword()`：10 字元，保證含 2 個大寫 + 2 個小寫 + 2 個數字 + 4 個隨機，最後亂序排列
- [x] 7.3 更新 `appendRegistration`（「Successful registration appends data to Google Sheets」、「Registration generates a unique check-in token」）：接受 `memberNumber`（三位流水號），寫入 Sheets B 欄；同時產生 `checkinToken`（UUID），寫入 Sheets I 欄；函式回傳 `checkinToken`

## 8. 後端 — Google Sheets 報名資料

- [x] 8.1 在 `server/sheets.js` 新增 `getRegistrationsByEmail(email)`：讀取 `registrations!A2:I`，過濾 D 欄（email），回傳含 `checkinToken` 的物件陣列
- [x] 8.2 新增 `markAttended(token)`：讀取 `registrations!A2:I`，依 I 欄比對 token，更新對應列 H 欄為「已出席」，回傳 `{ name, email, company }`
- [x] 8.3 新增 `updateEventImages({ imageUrl, dmUrl })`：分別更新 `event-info!E2`（imageUrl）與 `event-info!F2`（dmUrl）

## 9. 後端 — Sheets 格式與欄位調整

- [x] 9.1 調整 `registrations` 欄位順序為：A=報名時間、B=會員編號、C=姓名、D=Email、E=電話、F=公司/單位、G=LINE ID、H=出席狀態、I=報到代碼，共 9 欄；`REGISTRATION_HEADERS` 常數對應更新
- [x] 9.2 `formatTaipeiTime(date)`：以 `sv-SE` locale 輸出 `YYYY-MM-DD HH:mm:ss` 台灣時間（Asia/Taipei），取代原 ISO 格式
- [x] 9.3 `ensureRegistrationHeaders` 自動偵測並補寫 A1:I1 標題列（包含「出席狀態」與「報到代碼」）
- [x] 9.4 透過 Google Sheets API `batchUpdate` 套用紫色標題列樣式（背景 #7546C1、白色粗體、置中對齊、凍結第一列）至 A~I 共 9 欄

## 10. 後端 — QR code 報到系統

- [x] 10.1 安裝 `qrcode` npm 套件
- [x] 10.2 新增 `GET /api/checkin/qr?token=xxx`（「QR code is generated from check-in token」）：從 os.networkInterfaces() 取得 192.x.x.x 區域網路 IP，產生 QR code PNG（220px），內容為 `http://<localIp>:<PORT>/api/checkin/mark?token=<token>`，回傳 image/png
- [x] 10.3 新增 `GET /api/checkin/mark?token=xxx`（「Scanning QR code marks attendance as attended」）：呼叫 `markAttended(token)`，掃碼後顯示含姓名/Email/公司的報到成功 HTML 頁面；token 不存在時回傳 404

## 11. 後端 — 活動圖片持久化

- [x] 11.1 新增 `PATCH /api/event`（「PATCH /api/event updates event image fields」、「Uploaded event images persist across page reloads」）：接受 `{ imageUrl?, dmUrl? }`，呼叫 `updateEventImages`，將 URL 寫回 Sheets E2/F2

## 12. 前端 — React Router 設定

- [x] 12.1 修改 `client/src/main.jsx`：以 `<BrowserRouter>` 包覆 `<App />`
- [x] 12.2 修改 `client/src/App.jsx`：設定路由 `"/"、"/login"、"/member"、"/set-password"、"/forgot-password"`；在 `<>` fragment 最外層掛載 `<MemberStatus />`（全頁固定浮動）

## 13. 前端 — 登入頁（LoginPage）

- [x] 13.1 建立 `client/src/pages/LoginPage.jsx`（「前端路由：React 新增 /login 與 /member 頁面」）：Email + 密碼欄位，POST /api/auth/login，成功存 `memberToken` 至 localStorage，實作「Login page supports post-login redirect」：導向 `?redirect=` query param 或預設 `/member`
- [x] 13.2 錯誤顯示：401 → 「Email 或密碼不正確」；403 → 「帳號尚未啟用...」；頁面底部加入「忘記密碼？」連結（`/forgot-password`）

## 14. 前端 — 設定密碼頁（SetPasswordPage）

- [x] 14.1 建立 `client/src/pages/SetPasswordPage.jsx`：從 URL query `?token=` 取得 token，新密碼 + 確認密碼欄位，POST /api/auth/set-password，成功後顯示成功訊息與登入連結
- [x] 14.2 密碼驗證：長度 ≥8、含大寫/小寫/數字；不符時顯示錯誤，不送出請求

## 15. 前端 — 忘記密碼頁（ForgotPasswordPage）

- [x] 15.1 建立 `client/src/pages/ForgotPasswordPage.jsx`：Email 輸入欄位，POST /api/auth/forgot-password，無論結果一律顯示「確認信已送出」（防止 email 枚舉）；含返回登入連結

## 16. 前端 — 會員頁面（MemberPage）

- [x] 16.1 建立 `client/src/pages/MemberPage.jsx`（「Member profile page displays profile and registrations」）：載入時若無 token 導向 `/login`（「Unauthenticated user navigates to /member」）；並行 fetch `GET /api/member/me`（「Member can view their own profile」）與 `GET /api/member/registrations`（「Member can view their registration history」）；渲染姓名、email、加入日期
- [x] 16.2 報名紀錄列表（「API 路由設計（會員相關）」、「Member page displays QR code for each registration」）：每筆顯示課程名稱、📅 日期、📍 地點、出席狀態（顏色標籤：已出席綠/未出席紅/待確認黃）、報名時間、公司；若 `checkinToken` 存在，左側顯示 90px QR code 圖片（src=`/api/checkin/qr?token=<token>`）
- [x] 16.3 `<details>` 更改密碼區塊：內含 current/next/confirm 三個密碼欄位，POST /api/member/change-password，成功後顯示「✓ 密碼已更新！」
- [x] 16.4 「回到活動頁」與「登出」按鈕，登出清除 localStorage.memberToken

## 17. 前端 — 報名表單更新

- [x] 17.1 修改 `client/src/components/RegistrationForm.jsx`（「Registration form requires authentication」）：移除硬性登入守衛；若有 token 附帶 Authorization header，否則以匿名提交；成功後若回應含 `tempPassword` 則在綠色框顯示臨時密碼（monospace 大字）與密碼規則說明；顯示「前往登入 →」按鈕
- [x] 17.2 保留 sessionStorage.pendingRegistration 還原邏輯：mount 時讀取並清除

## 18. 前端 — 首頁會員狀態元件（MemberStatus）

- [x] 18.1 建立 `client/src/components/MemberStatus.jsx`（「Home page displays a fixed member status widget」、「Member status widget is present on all pages」）：fixed 定位於右上角（top:12px, right:16px, z-index:1000）；掛載於 App 的 `<>` fragment 最外層，所有頁面均可見
- [x] 18.2 未登入：紫色「👤 會員登入」膠囊連結按鈕
- [x] 18.3 已登入（「Member status dropdown shows registration status and history」）：綠色「{姓名} ▼」按鈕，點擊展開下拉面板；面板含姓名/email 標頭、✅/⏳ 報名狀態標籤、報名紀錄列表（含課程/日期/地點/出席狀態/時間）、「個人頁面」連結與「登出」按鈕；點擊面板外自動收起（mousedown 事件監聽）

## 19. 前端 — 活動圖片持久化（EventInfoSection）

- [x] 19.1 新增 `ImageUploadPersist` 元件（「Upload controls show existing image thumbnail and update label」）：已有圖片時顯示 80×52px 縮圖；呼叫原 ImageUpload，上傳完成後額外 PATCH /api/event 寫回 Sheets
- [x] 19.2 上傳主視覺時傳 `{ imageUrl: url }`，上傳課程 DM 時傳 `{ dmUrl: url }`；按鈕文字依現有圖片狀態切換「上傳」/「更新」

## 20. 後端 — 管理員工具

- [x] 20.1 建立 `server/reset-password.js`：命令列腳本，用法 `node reset-password.js <email>`；查找會員、呼叫 generateTempPassword、bcrypt hash、setPasswordByEmail，輸出含姓名與臨時密碼的結果

## 21. 整合驗證

- [x] 21.1 端對端：填寫報名表單 → 看到臨時密碼 → 前往登入 → 以臨時密碼登入 → 進入 /member 頁面，確認報名紀錄、QR code 顯示正常
- [x] 21.2 端對端：手機掃描 QR code → 開啟 `http://192.x.x.x:3001/api/checkin/mark?token=...` → 顯示報到成功頁面 → Sheets H 欄更新為「已出席」
- [x] 21.3 端對端：會員頁面更改密碼 → 登出 → 用新密碼重新登入成功
- [x] 21.4 管理員工具：`node reset-password.js email` → 輸出臨時密碼 → 用臨時密碼登入成功
- [x] 21.5 Google Sheets 確認：欄位順序正確（A=報名時間 台灣時區、B=會員編號 001/002、C~G 報名資料、H=出席狀態、I=報到代碼）；標題列紫色樣式
- [x] 21.6 圖片持久化：上傳主視覺 → 重整頁面 → 圖片仍顯示（已寫回 Sheets E2）
