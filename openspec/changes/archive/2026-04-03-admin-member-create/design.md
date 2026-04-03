## Context

後台管理（AdminPage.jsx + /api/admin/members）目前支援查看、編輯、刪除會員，但沒有「新增」入口。`memberStore.createMember({ email, name })` 已存在且會自動指派流水號編號。電話、公司、LINE ID 屬於報名資料，目前只存在 Google Sheets 的 `registrations-{eventId}` 工作表。設定密碼流程沿用 `sendSetPasswordEmail`（token 信件）或新增直接設定。

## Goals / Non-Goals

**Goals:**

- 管理員可從後台表單手動建立新會員（完整欄位：姓名、Email、電話、公司、LINE ID）
- 建立時可直接輸入密碼，或選擇寄送設定密碼信，或兩者皆不做（帳號未啟用）
- 電話/公司/LINE ID 同步寫入 Google Sheets registrations 工作表（與一般報名資料相同位置）
- 支援 CSV 批次匯入：上傳 CSV，解析 name/email（必填）、phone/company/lineId（選填），批次呼叫建立邏輯

**Non-Goals:**

- 不支援從後台修改已存在的 Sheets 報名記錄（僅新增）
- 批次匯入不支援 Excel 格式，僅 CSV

## Decisions

### POST /api/admin/members 端點設計

接受 body：`{ name, email, phone?, company?, lineId?, password?, sendEmail? }`

流程：
1. 驗證 name、email 不為空，回傳 400
2. `findByEmail` 確認不重複，重複回傳 409
3. `memberStore.createMember({ email, name })` 建立會員（取得 memberNumber）
4. 若 `phone/company/lineId` 有值，呼叫 `appendRegistration({ name, email, phone, company, lineId, memberNumber }, eventId)` 寫入 Sheets（eventId 從 query param 或 DEFAULT_EVENT_ID）
5. 若 `password` 有值且符合強度規則（8碼以上、含大小寫與數字），呼叫 `bcrypt.hash` 後 `memberStore.setPasswordByEmail` 啟用帳號
6. 若 `sendEmail` 為 true，呼叫 `sendSetPasswordEmail`
7. 回傳 `{ memberId, memberNumber, email, name, isActivated }`

### AdminPage 表單 UI

在會員清單上方新增「新增會員」按鈕，點擊後展開 inline 表單（收合設計與現有 inline 編輯一致）。

表單欄位：
- 姓名（必填）、Email（必填）、電話（選填）、公司/單位（選填）、LINE ID（選填）
- 密碼（選填，若填寫則直接啟用帳號）
- 「寄送設定密碼信」checkbox（預設未勾選，若填了密碼則 disabled）

### 批次匯入設計

獨立區塊「批次匯入 CSV」，上傳 file input（accept=".csv"）。前端解析 CSV（第一列為標題，對應欄位：name/email/phone/company/lineId），逐筆呼叫 POST /api/admin/members（sendEmail: false），匯入完成後顯示「成功 N 筆，失敗 M 筆」摘要。

## Risks / Trade-offs

- **Sheets 寫入頻率**：批次匯入若一次 50 筆，每筆各呼叫一次 Sheets API，可能觸發 Google API rate limit → 採循序呼叫（非平行）降低風險
- **密碼強度驗證**：後端沿用現有 `isStrongPassword` 函式（8碼+大小寫+數字），若直接設密碼但不符合強度則回傳 400

## Open Questions

（無）
