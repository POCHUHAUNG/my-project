# Gemini Canvas / Google AI Studio 練習提示詞

> 使用方式：複製下方提示詞，貼到 Gemini Canvas 或 Google AI Studio，即可練習對應功能。

---

## ✅ 已完成功能 — 練習理解原理

### 報名表單
```
請用 React 幫我建立一個活動報名表單，包含以下欄位：
- 姓名（必填）
- Email（必填，需驗證格式）
- 電話（選填）
- 送出按鈕

送出後顯示「報名成功！」的提示訊息。
請附上完整的程式碼說明，讓初學者也能看懂每一行的用途。
```

---

### 會員登入系統
```
請用 Node.js + Express 幫我建立一個簡單的會員登入 API，包含：
1. POST /login：接收 email 和 password，驗證後回傳 JWT Token
2. GET /member：需帶 JWT Token 才能存取，回傳會員資料

請附上每個步驟的說明，解釋 JWT 是什麼、為什麼需要它。
```

---

### 搜尋與分頁
```
我有一個 React 元件，顯示一個會員列表陣列。
請幫我加入：
1. 搜尋框：可依姓名或 Email 即時篩選
2. 分頁功能：每頁顯示 20 筆，可切換上一頁 / 下一頁
3. 每頁顯示筆數選擇器（20 / 30 / 40 / 50）

請用 useState 管理狀態，並說明每個 state 的用途。
```

---

### 捲動導航按鈕
```
請用 React 幫我製作一個固定在頁面右下角的捲動導航元件，包含三個按鈕：
- ↑ 回到頂部
- ↕ 捲到頁面中間
- ↓ 捲到底部

只有當使用者往下捲超過 300px 時才顯示這三個按鈕。
請說明 useEffect 和 window.scrollY 的運作方式。
```

---

## ⬜ 建議新增功能 — 練習實作

### 倒數計時器
```
請用 React 幫我製作一個活動報名截止倒數計時器。
目標時間設定為 2026-05-01 00:00:00。
顯示格式為：XX天 XX時 XX分 XX秒
每秒自動更新，倒數結束後顯示「報名已截止」。

請說明 setInterval 和 useEffect cleanup 的用途。
```

---

### 電子識別證 PDF 下載
```
請用 React + jsPDF + html2canvas 幫我製作一個電子識別證下載功能。
識別證內容包含：
- 活動名稱
- 參與者姓名
- 票種（一般票 / VIP）
- 一個假的 QR Code 圖片

點擊「下載識別證」按鈕後，將識別證轉成 PDF 並下載。
請說明 html2canvas 和 jsPDF 各自的功能。
```

---

### 加入行事曆（.ics 下載）
```
請用 JavaScript 幫我製作一個「加入行事曆」功能。
活動資訊如下：
- 名稱：2026 年度大會
- 開始時間：2026-05-10 09:00
- 結束時間：2026-05-10 17:00
- 地點：台北市信義區市府路1號

點擊按鈕後自動下載 .ics 檔案，可以直接匯入 Google Calendar 或 Apple Calendar。
請說明 .ics 格式的基本結構。
```

---

### QR Code 產生
```
請用 React + qrcode 套件幫我製作一個 QR Code 產生器。
輸入框讓使用者輸入任意文字，下方即時顯示對應的 QR Code 圖片。
並附上一個「下載 QR Code」按鈕，可將圖片存成 PNG。

請說明如何安裝 qrcode 套件以及基本使用方式。
```

---

### 匯出 Excel
```
請用 React + xlsx 套件幫我製作一個匯出 Excel 功能。
我有以下假資料（陣列格式）：
[
  { 姓名: "王小明", Email: "ming@example.com", 票種: "一般票" },
  { 姓名: "李小華", Email: "hua@example.com", 票種: "VIP" }
]

點擊「匯出 Excel」按鈕後，下載 .xlsx 檔案。
請說明 XLSX.utils.json_to_sheet 和 XLSX.writeFile 的用途。
```

---

### 統計圖表儀表板
```
請用 React + Chart.js 幫我製作一個報名統計儀表板，包含：
1. 圓餅圖：顯示各票種比例（一般票 70%、VIP 20%、早鳥票 10%）
2. 折線圖：顯示過去 7 天每日報名人數（用假資料）
3. 長條圖：顯示報名來源（LINE 40人、Facebook 25人、直接報名 35人）

請說明 Chart.js 的基本設定方式和如何在 React 中使用。
```

---

### 候補名單機制
```
請用 Node.js + Express 幫我設計一個候補名單 API，邏輯如下：
- 名額上限：100 人
- POST /register：報名時若名額已滿，自動加入候補名單
- DELETE /register/:id：取消報名時，自動通知候補第一名
- GET /waitlist：查看目前候補名單

請用假資料（不需要真實資料庫），說明整體邏輯流程。
```

---

### 批次寄信
```
請說明如何使用 Resend API 批次發送電子郵件。
我想要一次寄信給以下 3 位收件人：
- 王小明 ming@example.com
- 李小華 hua@example.com
- 張大同 tom@example.com

郵件主旨：活動提醒通知
郵件內容：您報名的活動將於明天舉行，請準時出席。

請提供完整的 Node.js 程式碼，並說明 Resend Batch API 的使用方式。
```

---

## 🎨 設計風格 — 練習套用

### Glassmorphism 玻璃效果
```
請幫我將以下 React 元件的樣式改成 Glassmorphism（毛玻璃）風格：
- 背景要有彩色漸層
- 卡片要有半透明毛玻璃效果（backdrop-filter: blur）
- 邊框要有淡白色半透明線條

請提供完整的 CSS 程式碼，並解釋每個屬性的效果。
```

---

### 深色科技風
```
請幫我將一個 React 活動報名頁面改成科技感深色主題：
- 背景色：#0a0e1a（深海藍黑）
- 主色：#00d4ff（霓虹藍）
- 按鈕要有發光效果（glow）
- 字體改用等寬科技感字體

請提供完整的 CSS，並說明如何引入 Google Fonts。
```

---

### 打字機動畫效果
```
請用純 CSS 幫我製作一個打字機動畫效果，讓標題文字「歡迎參加 2026 年度大會」像是被一個字一個字打出來的感覺。
動畫結束後游標停在最後一個字後面閃爍。

請說明 @keyframes 和 CSS animation 的基本用法。
```

---

## 串接服務 — 練習設定

### Resend 寄信
```
請教我如何用 Resend API 在 Node.js 中寄送一封 HTML 格式的電子郵件。
需求：
- 收件人：test@example.com
- 主旨：報名確認通知
- 內容：包含姓名、活動時間、地點的 HTML 格式信件

請提供完整步驟，包含：如何申請 API Key、安裝套件、完整程式碼。
```

---

### Google Sheets API
```
請教我如何用 Node.js 將資料寫入 Google 試算表，步驟包含：
1. 在 Google Cloud Console 建立服務帳戶
2. 啟用 Google Sheets API
3. 下載金鑰 JSON 檔案
4. 用 googleapis 套件將一筆資料（姓名、Email、時間）寫入指定試算表

請用最簡單的方式說明，適合第一次操作的人。
```

---

### LINE Login 串接
```
請教我如何在網站中串接 LINE Login 功能，步驟包含：
1. 在 LINE Developers Console 建立 Channel
2. 設定 Callback URL
3. 前端點擊 LINE 按鈕後跳轉到 LINE 授權頁
4. 後端接收 code 並換取 access_token
5. 用 access_token 取得使用者的 LINE 名稱和大頭貼

請用 Node.js + Express 示範後端部分的完整程式碼。
```
