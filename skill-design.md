# 設計風格建議

## 🎨 10 種設計風格

| 風格名稱 | 特色說明 | 主色調 | 操作說明 |
|------|------|------|------|
| 科技感 Tech Dark | 深色背景、霓虹藍、發光邊框、等寬字體 | 背景 #0a0e1a / 主色 #00d4ff | 修改 App.css：background: #0a0e1a；所有按鈕加上 box-shadow: 0 0 15px #00d4ff；引入 Google Font：Space Grotesk |
| 3D 立體卡片 | 滑鼠懸停時卡片傾斜產生立體感 | 任意配色 | CSS：.card:hover { transform: perspective(800px) rotateY(5deg) rotateX(3deg); transition: 0.3s; } |
| 極簡奢華 Luxury Minimal | 大量留白、金色、細線條、Serif 字體 | 背景 #fafaf8 / 金色 #c9a84c | 引入 Google Font：Playfair Display；主色改為 #c9a84c；所有邊框改為 0.5px solid；字距 letter-spacing: 0.1em |
| 漸層玻璃 Glassmorphism | 毛玻璃半透明卡片、彩色漸層背景 | 彩色漸層 | CSS：background: rgba(255,255,255,0.15); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; |
| 國際會議風 | 藍白配色、專業感、時間軸議程設計 | 主色 #1e40af | 主色改為 #1e40af；AgendaSection 改為垂直時間軸設計；使用 Noto Sans TC 字體 |
| 節慶慶典風 | 溫暖橘紅色系、動態 confetti 彩帶動畫 | 主色 #dc2626 / 輔色 #f59e0b | npm install canvas-confetti；報名成功後觸發 confetti() 動畫效果 |
| 雜誌排版 Editorial | 不對稱排版、超大字號標題、斜切區塊 | 黑白為主 | CSS clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%) 做斜切 section；標題字級放大到 5rem |
| 柔和粉嫩 Pastel | 莫蘭迪色系、圓潤設計、Neumorphism 陰影 | 主色 #a78bfa | CSS：box-shadow: 6px 6px 12px #e9d5ff, -6px -6px 12px #fff；border-radius: 20px；引入 Nunito 字體 |
| 未來主義 Futurism | 高對比黑底、螢光色、打字機動畫效果 | 黑底 / #ff0080 + #00ff88 | 引入 Orbitron 字體；標題加入 CSS 打字機 @keyframes typing；背景加入 CSS 掃描線動畫 |
| 自然有機 Organic | 大地色、不規則圓角、SVG 波浪分隔線 | 主色 #16a34a | 各 section 之間加入 SVG wave 圖形；圓角統一改為 border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%；引入 Quicksand 字體 |

---

## 如何套用字體（Google Fonts）

1. 前往 [fonts.google.com](https://fonts.google.com) 搜尋字體名稱
2. 點選字體 → 右上角「Get font」→ 「Get embed code」
3. 複製 `<link>` 標籤貼到 `client/index.html` 的 `<head>` 內
4. 在 `App.css` 加入：`font-family: '字體名稱', sans-serif;`

## 如何修改主色調

主要修改 `client/src/App.css`，搜尋現有的紫色 `#6c63ff` 全部取代為新顏色即可。
