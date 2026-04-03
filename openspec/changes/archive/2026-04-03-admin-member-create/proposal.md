## Why

後台管理員目前無法主動新增會員，只能等待使用者自行完成線上報名流程。若需要替未使用線上報名的學員建立帳號（如電話報名、現場報到），或需要批次匯入名單，管理員沒有任何入口可操作。

## What Changes

- 後台新增「新增會員」表單：填寫姓名、Email、電話、公司/單位、LINE ID，可直接設定密碼或選擇寄送設定密碼信
- 新增 `POST /api/admin/members` 端點，支援完整欄位建立會員（同時寫入 members.json 與 Google Sheets 報名記錄）
- 新增「批次匯入」功能：後台可上傳 CSV 檔案，解析後批次建立多筆會員（姓名 + Email 為必填欄位）

## Capabilities

### New Capabilities

- `admin-member-create`: 後台管理員可透過表單手動建立新會員，包含完整欄位（姓名、Email、電話、公司、LINE ID）、直接設定密碼或寄送密碼信，以及 CSV 批次匯入功能

### Modified Capabilities

(none)

## Impact

- 新增檔案：（無）
- 修改檔案：
  - `server/index.js`（新增 POST /api/admin/members 端點）
  - `server/memberStore.js`（擴充 createMember 支援 phone/company/lineId，或另行寫入 Sheets）
  - `client/src/pages/AdminPage.jsx`（新增建立表單 UI、批次匯入 UI）
