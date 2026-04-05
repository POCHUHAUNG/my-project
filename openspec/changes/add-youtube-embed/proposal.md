## Why

活動頁面目前只支援圖片展示，無法嵌入影片。許多活動主辦單位希望在報名頁放上宣傳影片或課程預覽，以提升報名意願。

## What Changes

- 活動資訊頁（EventInfoSection）課程 DM 圖片下方新增 YouTube 影片嵌入區塊
- 管理員登入後可在同一頁面輸入 YouTube 網址並儲存，訪客即時看到嵌入影片
- 後端 event 資料新增 `youtubeUrl` 欄位，透過既有 `PATCH /api/event` 儲存
- 支援標準 YouTube 網址格式（`youtube.com/watch?v=`）和短網址（`youtu.be/`），自動轉換成 embed 格式

## Non-Goals

- 不支援非 YouTube 平台（Vimeo、Facebook 影片等）
- 不支援多部影片，每個活動只顯示一部
- 不自訂播放器外觀，使用 YouTube 預設 iframe

## Capabilities

### New Capabilities

- `youtube-embed`: 在活動頁嵌入 YouTube 影片，管理員可透過編輯介面設定網址

### Modified Capabilities

- `event-info-display`: 新增 YouTube 影片區塊的顯示邏輯

## Impact

- Affected specs: `youtube-embed`（新增）、`event-info-display`（修改）
- Affected code:
  - `client/src/components/EventInfoSection.jsx`（新增影片區塊和管理員編輯 UI）
  - `server/data/event.json`（新增 `youtubeUrl` 欄位儲存）
