## Why

完成狀況矩陣顯示所有學員，當報名人數多時清單過長，管理員無法快速辨識哪些學員尚未填寫表單。

## What Changes

- 在「完成狀況」矩陣上方新增篩選按鈕列：「全部」、「未完成」、「已完成」
- 點擊篩選按鈕後，矩陣只顯示符合條件的學員列（純前端 filter，不重新呼叫 API）
- 底部完成人數統計列（如「1 / 3」）維持顯示全體數字，不受篩選影響
- 新增搜尋框，輸入姓名或 Email 即時過濾顯示的學員列（純前端，不呼叫 API）
- 篩選按鈕與搜尋框可同時作用（先篩選狀態，再於結果中搜尋）

## Non-Goals

- 不新增後端 API 過濾參數
- 不支援依特定表單篩選（僅依「任一表單未完成」整體判斷）

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `form-completion-tracking`: 管理員面板完成狀況矩陣新增篩選按鈕（全部 / 未完成 / 已完成）

## Impact

- Affected specs: `form-completion-tracking`（delta spec）
- Affected code: `client/src/pages/AdminPage.jsx`
