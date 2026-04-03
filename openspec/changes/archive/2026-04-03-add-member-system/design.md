## Context

現有活動報名頁以 Google Sheets 作為唯一資料儲存，報名者提交後無法追蹤記錄。本次新增會員系統，以「報名即成為會員」為核心：報名成功後自動建立帳號，使用 Email + 密碼登入。後端為 Express + Node.js，前端為 React（已有 Vite 建置流程）。會員資料需持久化，但此專案無資料庫，改以本機 JSON 檔儲存。

## Goals / Non-Goals

**Goals:**

- 報名成功後自動建立會員帳號（以 Email 為唯一識別）
- JWT stateless 認證：登入取得 token，前端存於 `localStorage`，每次請求帶入 `Authorization: Bearer <token>`
- 會員個人頁面：顯示過去報名紀錄（從 Google Sheets 讀取）、會員專屬內容區塊
- 報名表單需登入才可提交（未登入者先導向登入頁）
- 寄送設定密碼 Email（使用 nodemailer，預設使用 Gmail SMTP）

**Non-Goals:**

- 不實作第三方 OAuth（Google / LINE 登入）
- 不實作多重身份驗證（MFA）
- 不實作帳號管理後台
- 不實作忘記密碼以外的帳號復原機制
- 不支援多角色（所有會員皆為同一角色）

## Decisions

### 會員資料儲存：本機 JSON 檔（members.json）

**決策**：會員資料（memberId、email、passwordHash、createdAt、名稱等）儲存於 `server/data/members.json`，以 Node.js fs 讀寫。

**理由**：無資料庫，JSON 檔最簡單；此為小型活動頁，會員數量不多（預估 < 500）；避免引入 SQLite 等額外依賴。

**替代方案**：Google Sheets 新工作表 — Sheets API 有配額限制且延遲高，不適合高頻讀寫的認證流程。

---

### JWT 認證策略

**決策**：使用 `jsonwebtoken` 產生 HS256 JWT（payload: `{ memberId, email }`，有效期 7 天），secret 從環境變數 `JWT_SECRET` 讀取。前端存於 `localStorage`，每次 API 請求帶入 `Authorization: Bearer <token>` header。

**理由**：Stateless，不需 session store；符合現有 Express 架構。

**替代方案**：HTTP-only cookie session — 需 `express-session` 與 session store，較複雜；且此專案無 HTTPS（localhost），cookie 安全性差異不大。

---

### 報名即建立帳號（自動建立，寄送設定密碼連結）

**決策**：`POST /api/register` 成功後，系統在 `members.json` 建立新會員（若 email 已存在則跳過），並寄送設定密碼 Email（含 token link）。回應加入 `memberId`。

**理由**：使用者不需額外填表單，降低摩擦；設定密碼用 Email 確認，確保 email 有效。

**替代方案**：報名與註冊分開 — 使用者需兩次操作，體驗差。

---

### 設定密碼 Email（nodemailer + Gmail SMTP）

**決策**：使用 nodemailer，SMTP 設定從環境變數讀取（`EMAIL_USER`、`EMAIL_PASS`）。設定密碼連結格式：`http://localhost:3001/set-password?token=<uuid>`，token 存於 `members.json`，有效期 24 小時。

**理由**：nodemailer 是 Node.js 最成熟的 Email 套件；Gmail SMTP 免費且易設定。

**替代方案**：直接設定預設密碼 — 安全性差，不建議。

---

### 前端路由：React 新增 /login 與 /member 頁面

**決策**：使用 `react-router-dom`（v6）管理路由。新增 `<LoginPage>`、`<MemberPage>`、`<SetPasswordPage>` 元件。`RegistrationForm` 加入登入守衛：`localStorage` 無 token 時導向 `/login`，登入後重導回報名頁。

**理由**：現有專案尚未引入 router；react-router v6 是 React 生態系的標準選擇。

---

### API 路由設計（會員相關）

| Method | Path | Auth | 說明 |
|--------|------|------|------|
| POST | `/api/auth/login` | 無 | Email + password，回傳 JWT |
| POST | `/api/auth/set-password` | 無 | token + newPassword，設定密碼並啟用帳號 |
| POST | `/api/auth/logout` | 無 | 前端清除 token（stateless，無需後端操作）|
| GET | `/api/member/me` | Bearer JWT | 回傳 memberId、email、name |
| GET | `/api/member/registrations` | Bearer JWT | 從 Google Sheets 搜尋該 email 的報名記錄 |

---

### members.json 資料結構

```json
[
  {
    "memberId": "uuid-v4",
    "email": "user@example.com",
    "name": "王小明",
    "passwordHash": "bcrypt-hash-or-null",
    "isActivated": false,
    "setPasswordToken": "uuid-v4",
    "setPasswordTokenExpiry": "2026-04-02T00:00:00.000Z",
    "createdAt": "2026-04-01T00:00:00.000Z"
  }
]
```

`passwordHash` 為 `null` 表示尚未設定密碼（未啟用帳號），`isActivated: true` 表示已完成設定密碼。

## Risks / Trade-offs

- **members.json 並發寫入** → Node.js 單執行緒，短時間內多次寫入需排隊（使用 async file lock 或接受小機率競態）；活動頁流量低，接受此風險
- **JWT 無法撤銷** → 登出只清除 localStorage；若 token 外洩需等 7 天到期；可接受（非高安全場景）
- **Gmail SMTP 需開啟應用程式密碼** → 使用者需在 Google 帳號設定；README 需說明步驟
- **設定密碼 Email 可能進垃圾信箱** → 提醒使用者檢查垃圾信箱；無法完全解決
- **報名表單登入守衛** → 使用者需先登入才可報名，增加一步流程；由「報名即建立帳號」機制平衡（首次用戶完成報名後即有帳號）
