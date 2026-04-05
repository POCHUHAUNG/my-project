## 1. 前端：YouTube URL 轉換工具

- [x] 1.1 在 `EventInfoSection.jsx` 新增 `extractYouTubeEmbedUrl(url)` 函式，支援將標準 watch URL（`youtube.com/watch?v=`）和短網址（`youtu.be/`）轉換成 embed URL；無效 URL 回傳 null（實作 convert YouTube URL to embed format 需求）

## 2. 前端：顯示 YouTube video embed

- [x] 2.1 在 `EventInfoSection.jsx` 的課程 DM 區塊（`dm-section`）下方，新增 YouTube embed 區塊：當 `event.youtubeUrl` 非空時呼叫 `extractYouTubeEmbedUrl`，取得有效 embed URL 後渲染 `<iframe>`；embed URL 無效或 `youtubeUrl` 為空時不渲染（實作 display YouTube video embed on event page 需求）
- [x] 2.2 iframe 樣式設定：寬度 100%、固定高度 400px（或維持 16:9 比例）、無邊框、圓角 8px，配合頁面整體風格

## 3. 前端：管理員 YouTube URL 編輯器

- [x] 3.1 在 `EventInfoSection.jsx` 新增 `YouTubeEditor` 元件，結構與現有 `AgendaLabelEditor` 一致：顯示目前 URL（或「尚未設定」提示）、「✏️ 修改」按鈕展開輸入框、「儲存」和「取消」按鈕（實作 admin can set YouTube URL via inline editor 需求）
- [x] 3.2 儲存時呼叫 `PATCH /api/event` 傳入 `{ youtubeUrl }`，成功後更新 `event` state，embed 區塊即時反映新影片；清空 URL 時傳入 `{ youtubeUrl: "" }` 並移除 embed（實作 admin saves / clears YouTube URL 需求）
- [x] 3.3 `YouTubeEditor` 元件僅在 `isAdmin === true` 時渲染，訪客看不到編輯介面（實作 non-admin visitor 需求）

## 4. 後端：event 資料支援 youtubeUrl 欄位

- [x] 4.1 確認 `PATCH /api/event` 已允許儲存任意欄位（包含 `youtubeUrl`）到 `server/data/event.json`；若有白名單限制則加入 `youtubeUrl`（實作 API returns event info 含 youtubeUrl 欄位需求）
- [x] 4.2 確認 `GET /api/event`（API returns event info from Google Sheets）回傳的 JSON 包含 `youtubeUrl` 欄位（空值時回傳空字串而非 undefined）
