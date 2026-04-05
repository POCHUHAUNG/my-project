## Why

當會員人數增多時，管理後台的會員列表會變得過長，難以快速找到特定會員。需要加入搜尋與分頁功能，讓管理者能高效管理大量會員資料。

## What Changes

- 在會員列表上方新增搜尋輸入框，可依姓名或 Email 即時過濾會員
- 在列表下方新增分頁控制列，支援每頁顯示 20、30、40、50 筆可選擇
- 搜尋條件改變時自動重設至第一頁
- 每頁筆數改變時自動重設至第一頁

## Non-Goals (optional)

- 不修改後端 API，所有過濾與分頁均為前端純狀態操作
- 不對搜尋加入防抖（debounce），即時回應即可
- 不儲存使用者的分頁偏好設定至 localStorage

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `admin-member-management`: 新增搜尋輸入框與分頁控制，會員列表顯示邏輯改為搜尋過濾後再分頁

## Impact

- Affected code: `client/src/pages/AdminPage.jsx`
