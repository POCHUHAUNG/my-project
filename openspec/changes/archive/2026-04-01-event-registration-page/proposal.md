## Why

活動主辦方需要一個可以公開發布的報名頁，讓參加者瀏覽活動資訊並完成報名，同時主辦方能直接透過 Google Sheets 管理所有動態內容，無需額外後台系統。

## What Changes

- 建立 React 單頁應用，包含活動介紹、議程表、報名表單三個區塊
- 建立 Node.js API 伺服器，整合 Google Sheets API 進行資料讀寫
- 活動介紹（標題、日期地點、說明文字、主視覺圖片 URL）從 Google Sheets 動態載入
- 議程表從 Google Sheets 動態載入，主辦方直接編輯試算表即可更新，並分上午/下午兩欄顯示
- 報名表單（姓名、Email、電話、公司、LINE ID）提交後寫入 Google Sheets
- 主辦方可透過瀏覽器上傳並裁切主視覺圖片與課程 DM 圖片（canvas 裁切後上傳至伺服器）

## Non-Goals (optional)

<!-- 留給 design.md 記錄 -->

## Capabilities

### New Capabilities

- `event-info-display`: 從 Google Sheets 讀取並展示活動介紹（標題、日期地點、說明文字、主視覺圖片、課程 DM）
- `agenda-display`: 從 Google Sheets 讀取並展示動態議程表（上午/下午兩欄）
- `event-registration`: 收集報名者資料（姓名、Email、電話、公司、LINE ID）並寫入 Google Sheets
- `image-upload`: 主辦方在瀏覽器端上傳圖片、選擇裁切比例（16:9、4:3、1:1、3:1、A4直式、A4橫式）、canvas 裁切後送至 `/api/upload` 儲存

### Modified Capabilities

（無）

## Impact

- 新增程式碼：`client/`（React 前端）、`server/`（Node.js API）
- 外部依賴：Google Sheets API（googleapis）、multer（圖片上傳）、react-easy-crop（裁切 UI）
- 新增 API 路由：`GET /api/event`、`GET /api/agenda`、`POST /api/register`、`POST /api/upload`
- Google Sheets 試算表需建立三個工作表：活動資訊（含 dmUrl 欄）、議程、報名資料
- 新增 `server/public/uploads/` 目錄供圖片儲存，Express 靜態伺服 `/uploads`
