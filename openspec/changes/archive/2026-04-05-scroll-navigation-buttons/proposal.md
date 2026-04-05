## Why

頁面內容較長時，使用者需要快速跳到頂部、中間或底部，目前只有置頂按鈕，缺乏置底與置中導航。

## What Changes

- 將 `App.jsx` 中現有的 `ScrollToTop` 元件改寫為三合一捲動導航元件 `ScrollNav`
- 新增置底（↓）按鈕：點擊後平滑捲動至頁面最底部
- 新增置中（↕）按鈕：點擊後平滑捲動至頁面垂直中間位置
- 三個按鈕垂直排列（↑ 上、↕ 中、↓ 下），固定於右下角
- 捲動超過 300px 後整組按鈕才顯示

## Non-Goals (optional)

- 不針對特定頁面（AdminPage、MemberPage 等）個別實作，使用全域元件
- 不新增鍵盤快捷鍵
- 不儲存使用者的捲動偏好

## Capabilities

### New Capabilities

- `scroll-navigation`: 三合一捲動導航按鈕（置頂、置中、置底）

### Modified Capabilities

(none)

## Impact

- Affected code: `client/src/App.jsx`
