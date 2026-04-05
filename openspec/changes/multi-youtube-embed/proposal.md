## Why

現行活動頁只支援單支 YouTube 影片。主辦單位經常需要同時展示課程介紹、講師介紹、活動回顧等多部影片，單一欄位無法滿足需求。

## What Changes

- **BREAKING** `youtubeUrl`（字串）改為 `youtubeVideos`（JSON 陣列），每筆包含 `url` 和 `title` 欄位；Google Sheets K2 存放 JSON 字串
- 活動頁訪客可瀏覽多支影片，依序垂直排列，每支影片上方顯示標題
- 管理員編輯器改為清單介面：顯示現有影片清單、可新增影片（URL + 標題）、刪除個別影片、上下移動排序
- 儲存透過既有 `PATCH /api/event` 傳入 `{ youtubeVideos }` 陣列

## Non-Goals

- 不支援非 YouTube 平台
- 不支援影片自動播放或播放清單模式
- 影片數量上限為 10 支（超過不顯示新增按鈕）

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `youtube-embed`: 單支影片改為多支影片陣列，新增標題欄位，新增管理員清單編輯介面

## Impact

- Affected specs: `youtube-embed`（修改）
- Affected code:
  - `client/src/components/EventInfoSection.jsx`（YouTubeEditor 改為清單介面、embed 區塊改為多支顯示）
  - `server/sheets.js`（K2 改存 JSON 陣列、getEventInfo 解析 youtubeVideos）
  - `server/index.js`（PATCH 白名單加入 youtubeVideos、移除 youtubeUrl）
