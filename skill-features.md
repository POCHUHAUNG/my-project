# 活動網站功能清單

## ✅ 已完成功能

| 項目名稱 | 功能說明 | 需要串接 | 串接服務 | 操作說明 |
|------|------|------|------|------|
| 活動資訊頁面 | 顯示活動名稱、日期、地點、主辦單位等基本資訊 | 否 | | |
| 議程表 | 顯示活動各時段講者與議題安排 | 否 | | |
| 報名表單 | 收集姓名、Email、電話等報名資料並儲存 | 否 | | |
| 會員登入系統 | 帳號密碼登入、Token 驗證、記住登入狀態 | 否 | | |
| LINE 登入 | 點擊 LINE 按鈕直接以 LINE 帳號登入 | 是 | LINE Login API | 1. 前往 developers.line.biz 建立 Provider 和 Channel / 2. 取得 Channel ID 和 Channel Secret / 3. 設定 Callback URL 為你的網址/line-callback / 4. 填入 server/.env 的 LINE_CLIENT_ID 和 LINE_CLIENT_SECRET |
| Facebook 登入 | 點擊 Facebook 按鈕直接以 FB 帳號登入 | 是 | Facebook Login API | 1. 前往 developers.facebook.com 建立應用程式 / 2. 新增 Facebook Login 產品 / 3. 設定有效的 OAuth 重新導向 URI / 4. 填入 server/.env 的 FB_APP_ID 和 FB_APP_SECRET |
| 忘記密碼 | 輸入 Email 後收到重設密碼連結 | 是 | Resend API | 1. 前往 resend.com 註冊帳號 / 2. 建立 API Key / 3. 填入 server/.env 的 RESEND_API_KEY / 4. 設定寄件人 Email（需驗證網域） |
| 設定密碼 | 點擊信件連結後設定新密碼 | 否 | | |
| 會員頁面 | 登入後可查看個人報名資料與狀態 | 否 | | |
| 管理員後台 | 查看所有報名者名單與管理功能 | 否 | | |
| 會員列表搜尋 | 依姓名或 Email 即時篩選會員 | 否 | | |
| 會員列表分頁 | 每頁顯示 20/30/40/50 筆可切換 | 否 | | |
| 三鍵捲動導航 | 頁面右下角顯示↑置頂、↕置中、↓置底三個按鈕 | 否 | | |
| 電子郵件發送 | 系統自動寄送報名確認信 | 是 | Resend API | 同上 Resend API 設定 |
| Google Sheets 同步 | 報名資料自動同步到 Google 試算表 | 是 | Google Sheets API | 1. 前往 console.cloud.google.com / 2. 建立專案並啟用 Google Sheets API / 3. 建立服務帳戶並下載 JSON 金鑰 / 4. 將 JSON 金鑰內容填入 server/.env 的 GOOGLE_SERVICE_ACCOUNT_KEY / 5. 在試算表共用給服務帳戶 Email |

---

## ⬜ 建議新增功能

### 報名流程

| 項目名稱 | 功能說明 | 需要串接 | 串接服務 | 操作說明 |
|------|------|------|------|------|
| 報名截止倒數計時器 | 首頁顯示距離截止的 DD:HH:MM:SS 倒數，製造緊迫感 | 否 | | 純前端 JavaScript：用 setInterval 每秒計算目標時間與現在時間的差值並顯示 |
| 候補名單機制 | 名額滿後自動轉候補，有人取消自動遞補並發信通知 | 是 | Resend API | 後端新增 waitlist 欄位；取消報名時觸發遞補邏輯；用 Resend 發通知信 |
| 票種選擇 | 一般票 / 早鳥票 / VIP 票，各有名額和價格限制 | 否 | | 後端新增 ticket_type 欄位；前端報名表單加入票種選擇下拉；設定各票種剩餘名額 |
| 團報折扣 | 3 人以上同時報名顯示優惠提示或自動計算折扣 | 否 | | 前端偵測同一 IP 或同一時間報名數量；後端驗證並套用折扣規則 |

### 參與者體驗

| 項目名稱 | 功能說明 | 需要串接 | 串接服務 | 操作說明 |
|------|------|------|------|------|
| 電子識別證 PDF | 報名成功後可下載 PDF 識別證，含姓名、票種、QR Code | 否 | html2canvas + jsPDF | 1. npm install html2canvas jspdf / 2. 設計識別證 HTML 樣板 / 3. 用 html2canvas 截圖 / 4. 用 jsPDF 轉成 PDF 供下載 |
| 加入行事曆 | .ics 檔案下載，一鍵加入 Google/Apple Calendar | 否 | | 產生符合 iCalendar 格式的 .ics 文字檔；包含活動標題、時間、地點、描述；讓使用者下載即可加入行事曆 |
| 活動提醒推播 | 活動前 1 天自動寄提醒信給報名者 | 是 | Resend API + Render Cron Job | 1. 在 Render 設定 Cron Job（每天早上 9 點執行）/ 2. 程式查詢明天有哪些報名者 / 3. 批次用 Resend 寄提醒信 |
| 報名分享連結追蹤 | 個人化分享連結加上 UTM 參數追蹤哪個管道帶來最多報名 | 是 | Google Analytics | 1. 在 Google Analytics 設定帳號取得 Measurement ID / 2. 在 client/index.html 加入 GA 追蹤碼 / 3. 分享連結加上 ?utm_source=line&utm_medium=social 等參數 |

### 後台管理

| 項目名稱 | 功能說明 | 需要串接 | 串接服務 | 操作說明 |
|------|------|------|------|------|
| QR Code 報到系統 | 現場用手機掃描識別證 QR Code 即時標記出席 | 否 | qrcode + jsQR | 1. npm install qrcode 產生每位報名者專屬 QR Code / 2. npm install jsqr 在手機瀏覽器讀取攝影機掃描 / 3. 後端新增 checked_in 欄位記錄出席狀態 |
| 匯出 Excel | 後台一鍵將報名名單匯出為 .xlsx 檔案 | 否 | xlsx 套件 | 1. npm install xlsx / 2. 後台加入匯出按鈕 / 3. 呼叫 XLSX.utils.json_to_sheet 轉換資料 / 4. XLSX.writeFile 下載檔案 |
| 即時統計儀表板 | 圓餅圖顯示性別比、折線圖顯示每日報名數、長條圖顯示票種分布 | 否 | Chart.js | 1. npm install chart.js / 2. 在後台新增 Dashboard 頁面 / 3. 用 canvas 元素 + Chart.js 繪製各種圖表 / 4. 資料來源呼叫後端 API 取得統計數字 |
| 批次寄信 | 後台勾選會員後一次發送通知信給多位 | 是 | Resend Batch API | Resend 支援批次發信 API：一次最多 100 封；後台新增勾選框；呼叫 /batch endpoint 傳入收件人陣列 |

### 互動功能

| 項目名稱 | 功能說明 | 需要串接 | 串接服務 | 操作說明 |
|------|------|------|------|------|
| 活動問卷/投票 | 活動前收集議題意見、活動後做滿意度調查 | 否 | | 後端新增 survey 資料表；前端設計問卷表單頁面；結果在後台以圖表呈現 |
| 講者介紹頁 | 每位講者的詳細介紹、照片、議題說明 | 否 | | 在 server/data 新增 speakers.json 存放講者資料；前端 AgendaSection 加入點擊展開詳情功能 |
| 心得牆 | 參與者活動後可以留言，公開顯示在頁面上 | 否 | | 後端新增 comments API；前端顯示留言列表；加入簡單的內容審核（管理員可刪除） |
| PWA 手機應用程式 | 讓使用者可以將網站加入手機主畫面像 App 一樣使用 | 否 | | 在 client/public 新增 manifest.json 設定圖示和名稱；新增 service-worker.js 支援離線瀏覽；在 index.html 加入 link rel="manifest" |
