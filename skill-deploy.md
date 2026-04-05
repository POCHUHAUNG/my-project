# 部署流程說明

## 架構說明

| 項目 | 服務 | 說明 |
|------|------|------|
| 前端 | Vercel | React 靜態網站 |
| 後端 | Render | Node.js API 伺服器 |

---

## 前端部署（Vercel）

每次修改前端程式碼後執行：

```
# 先在 client 目錄底下建置
cd client
npm run build

# 部署到 Vercel（在 client 目錄內執行）
vercel --prod
```

或在 Claude Code 的對話框輸入：
```
! cd client && vercel --prod
```

---

## 後端部署（Render）

每次修改後端程式碼後執行：

```
git add .
git commit -m "說明這次修改了什麼"
git push
```

Render 會自動偵測 git push 並重新部署，約等待 1-2 分鐘。

---

## 一鍵部署腳本（deploy.bat）

位置：專案根目錄 `deploy.bat`

功能：自動建置前端 + commit dist + push（只處理 Render 後端部署）

執行方式：雙擊 `deploy.bat` 或在終端機輸入 `deploy.bat`

> 注意：此腳本只會觸發 Render 重新部署，Vercel 還是需要另外執行 `vercel --prod`

---

## Render 設定

| 設定項目 | 值 |
|------|------|
| Root Directory | server/ |
| Build Command | cd ../client && npm install && npm run build && cd ../server && npm install |
| Start Command | node index.js |

---

## 環境變數位置

後端環境變數放在：`server/.env`（不會上傳到 git）

```
RESEND_API_KEY=你的金鑰
LINE_CLIENT_ID=你的LINE Channel ID
LINE_CLIENT_SECRET=你的LINE Channel Secret
FB_APP_ID=你的FB App ID
FB_APP_SECRET=你的FB App Secret
GOOGLE_SERVICE_ACCOUNT_KEY=JSON內容
GOOGLE_SHEET_ID=試算表ID
JWT_SECRET=自訂密鑰
```

在 Render 後台的 Environment 頁面也要填入同樣的環境變數。
