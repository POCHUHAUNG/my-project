## 1. 專案初始化

- [x] 1.1 建立 `client/`（React，使用 Vite 或 Create React App）與 `server/`（Node.js + Express）目錄結構
- [x] 1.2 安裝 server 依賴：`express`、`googleapis`、`cors`、`dotenv`
- [x] 1.3 安裝 client 依賴：`axios`（或使用 fetch）
- [x] 1.4 依照「服務帳號憑證管理」決策，建立 `.env` 範本（`GOOGLE_SERVICE_ACCOUNT_KEY`、`SPREADSHEET_ID`），並將 `.env` 加入 `.gitignore`
- [x] 1.5 依照「Google Sheets 試算表結構」與「使用 Google Sheets 作為唯一資料儲存」決策，在 Google Sheets 建立三個工作表：`event-info`（欄位：title, date, location, description, imageUrl）、`agenda`（欄位：time, topic, speaker, description）、`registrations`（欄位：name, email, phone, company, lineId, submittedAt）

## 2. Node.js API — Google Sheets 整合

- [x] 2.1 依照「Node.js 統一代理 Google Sheets API」決策，建立 `server/sheets.js`：初始化 Google Sheets API 客戶端，使用服務帳號憑證（從環境變數讀取）
- [x] 2.2 依照「API 路由設計」實作 `GET /api/event`：讀取 `event-info` 工作表第一列資料，回傳 JSON（title, date, location, description, imageUrl）；符合「API returns event info from Google Sheets」需求（工作表空時回傳 404）
- [x] 2.3 實作 `GET /api/agenda`：讀取 `agenda` 工作表所有列，回傳 JSON 陣列（time, topic, speaker, description）；符合「API returns agenda list from Google Sheets」需求（空時回傳 `[]`）
- [x] 2.4 實作 `POST /api/register`：驗證五個必填欄位（name, email, phone, company, lineId），將資料附加一列至 `registrations` 工作表並加上 `submittedAt` 時間戳；符合「Successful registration appends data to Google Sheets」需求
- [x] 2.5 在 `POST /api/register` 加入伺服器端驗證：缺少必填欄位時回傳 HTTP 400 並列出缺少的欄位；Sheets 寫入失敗時回傳 HTTP 500 `{ "error": "Failed to save registration" }`
- [x] 2.6 設定 Express CORS middleware，允許前端開發伺服器的來源

## 3. React 前端 — 活動介紹

- [x] 3.1 依照「React 前端頁面結構」決策，建立 `client/src/App.jsx`，垂直排列三個 section：`<EventInfoSection>`、`<AgendaSection>`、`<RegistrationForm>`
- [x] 3.2 建立 `EventInfoSection` 元件：頁面載入時呼叫 `GET /api/event`，渲染 title、date、location、description；符合「Display event information from Google Sheets」需求
- [x] 3.3 在 `EventInfoSection` 實作圖片顯示邏輯：imageUrl 非空時渲染 `<img>`，空時不渲染圖片元素
- [x] 3.4 在 `EventInfoSection` 實作載入中與錯誤狀態：API 回傳非 2xx 時顯示錯誤訊息取代整個 section

## 4. React 前端 — 議程表

- [x] 4.1 建立 `AgendaSection` 元件：頁面載入時呼叫 `GET /api/agenda`，將每個議程項目渲染為一列（time, topic, speaker, description）；符合「Display agenda from Google Sheets」需求
- [x] 4.2 在 `AgendaSection` 實作空議程狀態：API 回傳空陣列時顯示佔位文字
- [x] 4.3 在 `AgendaSection` 實作錯誤狀態：API 回傳非 2xx 時顯示錯誤訊息

## 5. React 前端 — 報名表單

- [x] 5.1 建立 `RegistrationForm` 元件，包含五個必填欄位：姓名、Email、電話、公司、LINE ID；符合「Registration form collects required fields」需求
- [x] 5.2 實作前端表單驗證：點擊送出時，若有欄位空白則顯示個別欄位的錯誤訊息，不送出請求；Email 格式不符時顯示格式錯誤
- [x] 5.3 送出成功（HTTP 201）時顯示成功訊息並停用送出按鈕；符合「Frontend shows result feedback after submission」需求
- [x] 5.4 送出失敗（HTTP 500）時顯示錯誤訊息並重新啟用送出按鈕，讓使用者可重試

## 6. 圖片上傳與裁切

- [x] 6.1 安裝 `multer` 至 server、安裝 `react-easy-crop` 至 client
- [x] 6.2 依照「圖片上傳儲存策略」決策，在 `server/index.js` 實作 `POST /api/upload`：multer 接收 `image` field（限 5MB、image/* MIME），儲存至 `server/public/uploads/`，回傳 `{ url }`；掛載 `/uploads` 靜態路由
- [x] 6.3 依照「Image upload with in-browser crop」需求，建立 `client/src/components/ImageUpload.jsx`：含上傳按鈕、crop modal（react-easy-crop）、比例選擇（16:9、4:3、1:1、3:1、A4直式 210/297、A4橫式 297/210）、縮放滑桿；canvas 裁切後 POST 至 `/api/upload`，取得 URL 後呼叫 `onUploaded(url)` callback
- [x] 6.4 依照「Uploaded image URL is reflected in the page immediately」需求，在 `EventInfoSection` 加入兩個 `<ImageUpload>` 按鈕：「主視覺」與「課程 DM」；上傳成功後更新對應狀態並立即顯示圖片
- [x] 6.5 在 `event-info` 工作表新增第六欄 `dmUrl`，`GET /api/event` 同步回傳 `dmUrl`，`EventInfoSection` 於頁面底部渲染課程 DM 圖片

## 7. 議程上午/下午分欄

- [x] 7.1 在 `AgendaSection` 依時間字串第一個數字將議程分為上午（≤12）、下午（>12）兩欄，並排顯示
- [x] 7.2 上午/下午欄各有獨立標籤（☀️ 上午場 / 🌆 下午場），各自獨立排序計數

## 8. 部署整合（Express 單進程）

- [x] 8.1 依照「Express 單進程部署」決策，執行 `npm run build`（client），由 `server/index.js` 使用 `express.static` serve `client/dist/`，同一 port（3001）服務前後端
- [x] 8.2 加入 catch-all 路由 `app.get('/{*path}', ...)` 支援 React SPA 的前端路由（Express v5 語法）
- [x] 8.3 建立 `start.bat` 以一個 PowerShell 視窗啟動 `node index.js`，並開啟 `http://localhost:3001`

## 9. 整合驗證

- [x] 9.1 端對端測試：填寫完整表單並送出，確認資料出現在 Google Sheets `registrations` 工作表
- [x] 9.2 確認主辦方修改 `agenda` 工作表後，前端重新整理頁面即可看到更新內容
- [x] 9.3 確認主辦方修改 `event-info` 工作表後，前端重新整理頁面即可看到更新的活動資訊
- [x] 9.4 上傳圖片並裁切後，確認圖片顯示於頁面並可於瀏覽器直接存取 `/uploads/{filename}`
