## 1. 後端：新增會員 API（admin-member-create）

- [x] 1.1 在 server/index.js 新增 POST /api/admin/members 端點（Admin can create a new member from the admin panel），套用 requireAdmin middleware；接受 { name, email, phone?, company?, lineId?, password?, sendEmail? }；name/email 缺少時回傳 400 Missing required fields；呼叫 findByEmail 確認不重複（重複回傳 409 Email already exists）；呼叫 memberStore.createMember({ email, name }) 取得 memberId 與 memberNumber
- [x] 1.2 在 POST /api/admin/members handler 中，若 phone/company/lineId 任一有值，呼叫 appendRegistration({ name, email, phone, company, lineId, memberNumber }, req.query.eventId || DEFAULT_EVENT_ID) 寫入 Google Sheets（Admin can create a new member from the admin panel）
- [x] 1.3 在 POST /api/admin/members handler 中，若 password 有值，使用現有 isStrongPassword 驗證（不符回傳 400 Password too weak），通過後 bcrypt.hash 並呼叫 memberStore.setPasswordByEmail 啟用帳號；若 sendEmail 為 true，呼叫 sendSetPasswordEmail；回傳 { memberId, memberNumber, email, name, isActivated }（Admin can create a new member from the admin panel）

## 2. 前端：新增會員表單 UI（admin-member-create）

- [x] 2.1 在 AdminPage.jsx 實作 AdminPage 表單 UI（Admin panel shows a create member form）：在會員清單上方新增「新增會員」按鈕，點擊後展開 inline 建立表單；表單包含：姓名（必填）、Email（必填）、電話（選填）、公司/單位（選填）、LINE ID（選填）、密碼（選填）、「寄送設定密碼信」checkbox（預設未勾選）；密碼欄位有值時 checkbox 自動 disabled 並清除；「建立」與「取消」按鈕
- [x] 2.2 點「建立」時前端先驗證姓名與 Email 不為空（為空顯示錯誤，不呼叫 API），驗證通過後呼叫 POST /api/admin/members；成功後將新會員 prepend 至 members state 並收合表單；409 顯示「此 Email 已被使用」；其他錯誤顯示「建立失敗，請稍後再試」（Admin panel shows a create member form）

## 3. 前端：批次匯入 CSV（admin-member-create）

- [x] 3.1 在 AdminPage.jsx 新增「批次匯入 CSV」區塊（Admin can batch import members from CSV）：file input（accept=".csv"），選擇檔案後顯示「開始匯入」按鈕；前端以 FileReader 讀取 CSV，解析第一列為 header 對應 name/email/phone/company/lineId；若 CSV 缺少 name 或 email 欄位，顯示「CSV 缺少必要欄位 name 或 email」不送出
- [x] 3.2 驗證通過後，以循序方式（非平行）逐筆呼叫 POST /api/admin/members（sendEmail: false）；全部完成後顯示「成功 N 筆，失敗 M 筆」摘要，成功的新會員 prepend 至 members state（Admin can batch import members from CSV）

## 4. 設計決策驗證

- [x] 4.1 確認 POST /api/admin/members 端點設計符合 design.md：電話/公司/LINE ID 寫入 Sheets，批次匯入循序呼叫（POST /api/admin/members 端點設計）；確認 AdminPage 表單 UI 與設計文件一致（AdminPage 表單 UI）；確認批次匯入設計符合設計文件（批次匯入設計）
