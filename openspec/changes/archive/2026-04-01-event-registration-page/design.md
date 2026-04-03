## Context

本變更建立一個全新的活動報名頁，包含 React 前端與 Node.js 後端。前端為單頁應用，後端負責與 Google Sheets API 溝通，作為唯一的資料儲存與管理介面。主辦方直接編輯 Google Sheets 試算表即可更新活動內容，無需額外管理後台。

## Goals / Non-Goals

**Goals:**

- 建立可公開存取的活動報名頁（活動介紹、議程表、報名表單）
- 所有動態內容（活動資訊、議程）從 Google Sheets 讀取
- 報名資料寫入 Google Sheets
- 前後端分離，Node.js API 統一處理 Google Sheets 存取

**Non-Goals:**

- 不建立管理後台 UI（主辦方直接操作 Google Sheets）
- 不實作使用者帳號或登入功能
- 不支援多場活動（單一活動頁）
- 不實作報名確認 Email 寄送
- 不處理付款流程

## Decisions

### 使用 Google Sheets 作為唯一資料儲存

**決策**：以 Google Sheets 取代傳統資料庫，作為活動資訊、議程、報名資料的儲存介面。

**理由**：主辦方熟悉試算表操作，無需學習後台系統；開發成本低；報名資料可直接在 Sheets 中處理與匯出。

**替代方案**：使用 PostgreSQL/MongoDB — 需要額外的資料庫設定與管理後台，對此場景過度工程。

---

### Node.js 統一代理 Google Sheets API

**決策**：前端不直接呼叫 Google Sheets API，所有存取透過 Node.js API 路由進行。

**理由**：避免將 Google 服務帳號憑證暴露於前端；可在後端統一處理錯誤、快取、資料格式轉換。

**替代方案**：前端直接呼叫 Sheets API — 會暴露憑證，且需在瀏覽器端處理 OAuth，不安全。

---

### Google Sheets 試算表結構

三個工作表（Sheets）：

| 工作表名稱 | 欄位 | 說明 |
|-----------|------|------|
| `event-info` | title, date, location, description, imageUrl, dmUrl | 活動介紹，只有第一列為有效資料；imageUrl = 主視覺圖片 URL，dmUrl = 課程 DM 圖片 URL |
| `agenda` | time, topic, speaker, description | 議程表，每列一個時段 |
| `registrations` | name, email, phone, company, lineId, submittedAt | 報名資料，每列一筆 |

---

### API 路由設計

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/event` | 讀取活動介紹 |
| GET | `/api/agenda` | 讀取議程列表 |
| POST | `/api/register` | 寫入報名資料 |
| POST | `/api/upload` | 接收圖片（multipart/form-data，field: `image`，限 5MB、image/* MIME），以 multer 儲存至 `server/public/uploads/`，回傳 `{ url }` |

---

### React 前端頁面結構

單一頁面，垂直排列四個 section：

```
<EventInfoSection>   ← GET /api/event（含 ImageUpload × 2：主視覺、課程DM）
<AgendaSection>      ← GET /api/agenda（上午欄 ≤12:xx / 下午欄 >12:xx）
<RegistrationForm>   ← POST /api/register
<DmSection>          ← 顯示課程 DM 圖片（dmUrl from event-info）
```

**議程上午/下午分欄邏輯**：解析 `time` 欄位的第一個數字，≤12 歸入上午欄，>12 歸入下午欄，兩欄並排顯示。

**圖片上傳流程**：
1. 使用者點選上傳按鈕，選取本地圖片
2. 前端開啟 crop modal（react-easy-crop），可選比例（16:9、4:3、1:1、3:1、A4直式 210×297、A4橫式 297×210）
3. 確認後以 canvas 產生裁切後的 Blob
4. POST 至 `/api/upload`（multipart/form-data），取得 `{ url }`
5. 回填至 `EventInfoSection` 的 `imageUrl` 或 `dmUrl` 狀態，立即預覽

---

### 服務帳號憑證管理

**決策**：使用 Google Service Account，憑證 JSON 透過環境變數（`GOOGLE_SERVICE_ACCOUNT_KEY`）注入，不提交至版本控制。

**理由**：Service Account 適合伺服器對伺服器的自動化存取，不需使用者授權流程。

### 圖片上傳儲存策略

**決策**：裁切後的圖片上傳至 `server/public/uploads/`，由 Express 靜態伺服；URL 為 `http://localhost:{PORT}/uploads/{filename}`。

**理由**：無需外部儲存服務（S3 等），適合小型活動頁；主辦方只需重新上傳即可更新圖片。

**替代方案**：Base64 存入 Google Sheets — 欄位過大，Sheets API 效能差，不適合。

---

### Express 單進程部署

**決策**：`npm run build`（React）後，Express 直接 serve `client/dist/`，前後端同一 port（3001）。

**理由**：簡化部署，不需管理兩個進程；主辦方以 `start.bat` 啟動即可使用。

---

## Risks / Trade-offs

- **Google Sheets API 配額限制** → 每分鐘讀取有限制（預設 60 req/min）；若流量高可在 Node.js 層加入簡單記憶體快取（TTL 30 秒）緩解
- **試算表結構異動** → 主辦方若修改欄位順序或名稱，API 回傳資料會錯誤；README 需明確記載試算表結構規範
- **重複報名** → 本次不實作防重複機制，相同 Email 可重複提交；主辦方需自行在 Sheets 篩選
