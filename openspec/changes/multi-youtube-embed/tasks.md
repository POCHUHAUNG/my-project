## 1. 後端：youtubeVideos 欄位支援

- [x] 1.1 在 `server/sheets.js` 的 `getEventInfo` 中，將 K2 解析方式從字串改為 JSON 陣列：讀取後用 `JSON.parse` 解析，解析失敗或空值時回傳 `[]`；若舊資料是字串形式的單一 URL，則自動轉換為 `[{ url: oldValue, title: '' }]`（向下相容 display YouTube video embed on event page 需求）
- [x] 1.2 在 `server/sheets.js` 的 `updateEventImages` 中，將 `youtubeVideos` 加入 `fieldMap`（對應 K2），存入前用 `JSON.stringify` 序列化；同時移除 `youtubeUrl` 欄位對應（實作 admin can set YouTube URL via inline editor 需求）
- [x] 1.3 在 `server/index.js` 的 `PATCH /api/event` 中，將白名單的 `youtubeUrl` 改為 `youtubeVideos`，並傳入 `updateEventImages`（移除 admin can set YouTube URL via inline editor (single-URL version) 需求，改由陣列版本取代）

## 2. 前端：多影片顯示區塊

- [x] 2.1 確認 `extractYouTubeEmbedUrl` 函式仍正確支援 convert YouTube URL to embed format（watch URL 和 youtu.be 短網址），無需修改；確認無效 URL 回傳 null
- [x] 2.2 修改 `EventInfoSection.jsx` 的 embed 顯示區塊：將單支 iframe 改為遍歷 `event.youtubeVideos` 陣列，對每筆有效 URL 呼叫 `extractYouTubeEmbedUrl`，渲染 `<h3>` 標題 + 16:9 iframe；跳過無效 URL（實作 display YouTube video embed on event page 需求、entry has invalid URL 需求）
- [x] 2.2 `event.youtubeVideos` 為空陣列或不存在時，不渲染任何影片區塊（實作 youtubeVideos is empty or absent 需求）

## 3. 前端：管理員多影片編輯器

- [x] 3.1 將 `EventInfoSection.jsx` 的 `YouTubeEditor` 改為 `YouTubeListEditor`：顯示現有影片清單，每筆顯示標題、URL、↑上移、↓下移、🗑刪除按鈕（實作 admin reorders videos 和 admin deletes a video 需求）
- [x] 3.2 清單底部加入新增列：URL 輸入框 + 標題輸入框 + 「新增」按鈕；按下後將 `{ url, title }` 加入陣列末端並呼叫 `PATCH /api/event`（實作 admin adds a video 需求）
- [x] 3.3 當清單長度達 10 筆時，禁用新增按鈕並顯示「已達上限 10 支」提示（實作 list reaches 10 videos 需求）
- [x] 3.4 每次新增、刪除、移動後立即呼叫 `PATCH /api/event` 傳入更新後的 `youtubeVideos` 陣列，並更新 `event` state 使前台即時反映（實作 admin can set YouTube URL via inline editor 需求）
- [x] 3.5 `YouTubeListEditor` 僅在 `isAdmin === true` 時渲染（實作 non-admin visitor 需求）
