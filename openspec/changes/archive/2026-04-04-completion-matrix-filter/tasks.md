## 1. Client：篩選狀態與邏輯

- [x] 1.1 在 `client/src/pages/AdminPage.jsx` 新增 `completionFilter` state（預設 `'all'`，可為 `'all'` | `'incomplete'` | `'complete'`）；新增 `filteredRegistrants` 計算值：當 filter 為 `'incomplete'` 時只保留 `completed` 含任一 `false` 的學員，`'complete'` 時只保留 `completed` 全為 `true` 的學員，`'all'` 時返回全部——實現「Admin panel displays completion matrix」的篩選邏輯

## 2. Client：篩選按鈕 UI

- [x] 2.1 在「完成狀況」矩陣表格上方新增三個篩選按鈕「全部」、「未完成」、「已完成」；點擊時設定 `completionFilter`；當前 active 按鈕以深色背景標示，其餘為淺色；按鈕列排列於「重新整理」按鈕同行或其下方——實現「Admin panel displays completion matrix」的篩選按鈕

## 3. Client：搜尋狀態與邏輯

- [x] 3.1 在 `client/src/pages/AdminPage.jsx` 新增 `completionSearch` state（預設空字串）；更新 `filteredRegistrants` 計算值，在篩選按鈕條件之後再進一步以 `completionSearch`（轉小寫）對 `r.name` 和 `r.email` 做 `includes` 比對，兩個條件同時滿足才顯示——實現「Filter and search combine」場景

## 4. Client：搜尋輸入框 UI

- [x] 4.1 在篩選按鈕列旁新增搜尋輸入框（`<input type="text">`），placeholder 為「搜尋姓名或 Email」，`onChange` 設定 `completionSearch` state；輸入框與篩選按鈕排列於同一列或緊接其下——實現「Search filters by name」與「Search filters by email」場景

## 5. Client：表格改用 filteredRegistrants

- [x] 5.1 將矩陣表格的 `completionData.registrants.map(...)` 改為使用 `filteredRegistrants`；底部完成人數統計列繼續使用 `completionData.registrants`（全體），不受篩選影響——確保「Filter to incomplete registrants」場景的完成人數仍顯示全體數字
