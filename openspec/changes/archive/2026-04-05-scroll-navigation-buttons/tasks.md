## 1. 改寫捲動導航元件

- [x] 1.1 在 `client/src/App.jsx` 中將 `ScrollToTop` 元件改名為 `ScrollNav`，實作 three-button scroll navigation renders on all pages：在 `window.scrollY > 300` 時顯示整組按鈕，否則隱藏；三個按鈕垂直排列於固定右下角容器中
- [x] 1.2 實作 scroll to top button navigates to page top：保留現有 ↑ 按鈕邏輯，點擊後執行 `window.scrollTo({ top: 0, behavior: 'smooth' })`
- [x] 1.3 實作 scroll to middle button navigates to page middle：新增 ↕ 按鈕，點擊後執行 `window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' })`
- [x] 1.4 實作 scroll to bottom button navigates to page bottom：新增 ↓ 按鈕，點擊後執行 `window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })`
- [x] 1.5 將 `App.jsx` 中所有引用 `<ScrollToTop />` 的地方改為 `<ScrollNav />`
