## Context

目前系統以 Google Sheets 為資料庫，透過 Google Sheets API（service account）讀寫報名資料。活動設定存於 `event-info-{eventId}` sheet 的 I 欄（JSON 格式的 `fieldConfig`）。已有 Email 發送（nodemailer）與 LINE Messaging API 功能。

本功能需新增：表單設定儲存、預填連結生成、批次發送、及回應讀取四個能力。

## Goals / Non-Goals

**Goals:**
- 管理員在後台設定最多 4 個 Google Forms（名稱 + 預填 URL 模板 + 回應 Sheet ID）
- 系統依報名學員的 `name` 與 `email` 生成個人化預填連結
- 支援 Email、LINE、複製清單三種發送方式
- 從回應 Sheet 以 email 比對，顯示完成矩陣

**Non-Goals:**
- 不自行建立或修改 Google Forms 表單內容（由主辦人手動建立）
- 不追蹤學員的具體作答內容，只追蹤「是否已提交」
- 不支援匿名表單（必須有 email 欄位才能比對）
- 不即時推播（完成矩陣須手動點「重新整理」）

## Decisions

### 表單設定儲存於 event-info Sheet 的 J 欄（新增），與 fieldConfig 分離

將表單設定（`forms` 陣列）存於 J 欄，獨立於 I 欄的 `fieldConfig`（報名欄位設定）。
理由：關注點分離，避免兩種設定互相干擾；J 欄可獨立讀寫。

`forms` 陣列格式（JSON）：
```json
[
  {
    "id": "f1",
    "name": "課前調查",
    "prefillTemplate": "https://docs.google.com/forms/d/FORM_ID/viewform?entry.111={name}&entry.222={email}",
    "responseSheetId": "SHEET_ID",
    "responseEmailColumn": 1
  }
]
```
- `prefillTemplate`：管理員從 Google Forms「取得預填連結」功能取得，將實際值改為 `{name}` 和 `{email}` 佔位符
- `responseSheetId`：Google Forms 回應連結的試算表 ID
- `responseEmailColumn`：回應 Sheet 中 email 所在欄的索引（0-based，預設 1 即 B 欄）

### 預填連結生成在 server 端，避免前端暴露 Sheet ID

`POST /api/admin/generate-form-links` 接收 eventId，讀取 `forms` 設定與 `registrations`，生成每位學員的連結清單，回傳 JSON。前端不直接持有 Sheet ID。

### 發送以現有服務為基礎，不新增第三方套件

- **Email**：複用 `sendEventChangeNotificationEmail` 的 nodemailer 設定，逐筆發送
- **LINE**：複用現有 LINE Messaging API（`pushMessage`），以 `lineUserId` 為 target
- **複製清單**：`/api/admin/generate-form-links` 直接回傳連結陣列，前端渲染為可複製的文字

### 完成比對以 email 為 key（不用姓名）

Google Forms 回應 Sheet 必定有 email 欄（主辦人建立表單時需加入）。以 email 比對報名學員，避免同名問題。

回應 Sheet 讀取範圍：`Sheet1!A2:Z`（全欄），取 `responseEmailColumn` 欄的值做 Set，再與 `registrations` email 欄對照。

## Risks / Trade-offs

- **回應 Sheet 權限**：主辦人需將每個回應 Sheet 共用給 service account email，否則 API 無法讀取。→ 後台顯示 service account email 供複製，並在讀取失敗時顯示明確錯誤訊息
- **LINE 發送失敗**：學員若未綁定 LINE，`lineUserId` 為空，跳過發送。→ 後台顯示發送結果摘要（成功 N 筆，跳過 M 筆）
- **預填 URL 模板錯誤**：管理員填錯佔位符格式（如打成 `{Name}` 大寫）→ 系統顯示預覽連結讓管理員確認，不做強制驗證
- **回應 Sheet 欄位順序**：不同表單 email 欄位置不同 → 由 `responseEmailColumn` 欄位讓管理員手動指定

## Migration Plan

1. 部署 server：新增 `getEventForms`、`updateEventForms`、`getFormResponses` 至 `sheets.js`；新增三個 API 端點至 `index.js`
2. 部署 client：AdminPage 新增表單管理 UI、發送區塊、完成矩陣
3. 無資料 migration 需求（J 欄初始為空，功能開箱即用）
4. 主辦人一次性設定：建立表單、連結回應 Sheet、共用給 service account、填入後台設定
