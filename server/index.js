require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}
const { getEventInfo, getAgenda, appendRegistration, getRegistrationsByEmail, getAllRegistrations, updateEventImages, markAttended, getRegistrationByToken, initializeSheets, getFormResponses } = require('./sheets');
const memberStore = require('./memberStore');
const { signToken, requireAuth } = require('./auth');

function isStrongPassword(pw) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);
}
const { sendSetPasswordEmail, sendResetPasswordEmail, sendRegistrationConfirmationEmail, sendOrganizerNotificationEmail, sendEventCancelNotificationEmail, sendEventChangeNotificationEmail, sendPreEventReminderEmail } = require('./mailer');

function generateTempPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const all = upper + lower + digits;
  // Guarantee at least 2 upper + 2 lower + 2 digits → total 10 chars
  let pw = [
    upper[Math.floor(Math.random() * upper.length)],
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    digits[Math.floor(Math.random() * digits.length)],
  ];
  for (let i = 0; i < 4; i++) pw.push(all[Math.floor(Math.random() * all.length)]);
  return pw.sort(() => Math.random() - 0.5).join('');
}

const upload = multer({
  dest: path.join(__dirname, 'public/uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('只允許上傳圖片檔案'));
    }
    cb(null, true);
  },
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, '../client/dist')));

// GET /api/event — 讀取活動介紹
app.get('/api/event', async (req, res) => {
  const eventId = req.query.eventId || process.env.DEFAULT_EVENT_ID || '001';
  try {
    const data = await getEventInfo(eventId);
    if (!data) return res.status(404).json({ error: 'No event info found' });
    res.json(data);
  } catch (err) {
    console.error('GET /api/event error:', err.message);
    res.status(500).json({ error: 'Failed to fetch event info' });
  }
});

// PATCH /api/event — 更新活動欄位（imageUrl / dmUrl / agendaTagEn / agendaTagZh / fieldConfig / forms）
app.patch('/api/event', async (req, res) => {
  const { imageUrl, dmUrl, agendaTagEn, agendaTagZh, fieldConfig, forms } = req.body;
  const eventId = req.query.eventId || process.env.DEFAULT_EVENT_ID || '001';
  if (imageUrl === undefined && dmUrl === undefined && agendaTagEn === undefined && agendaTagZh === undefined && fieldConfig === undefined && forms === undefined) {
    return res.status(400).json({ error: 'Provide at least one field to update' });
  }
  try {
    await updateEventImages({ imageUrl, dmUrl, agendaTagEn, agendaTagZh, fieldConfig, forms }, eventId);
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/event error:', err.message);
    res.status(500).json({ error: 'Failed to update event info' });
  }
});

// GET /api/agenda — 讀取議程列表
app.get('/api/agenda', async (req, res) => {
  const eventId = req.query.eventId || process.env.DEFAULT_EVENT_ID || '001';
  try {
    const data = await getAgenda(eventId);
    res.json(data);
  } catch (err) {
    console.error('GET /api/agenda error:', err.message);
    res.status(500).json({ error: 'Failed to fetch agenda' });
  }
});

// POST /api/register — 寫入報名資料，並自動建立會員帳號
app.post('/api/register', async (req, res) => {
  const { name, email, phone, company, lineUserId = '', googleId = '', facebookId = '', extraFields = {} } = req.body;
  const authId = lineUserId || googleId || facebookId;
  const eventId = req.query.eventId || process.env.DEFAULT_EVENT_ID || '001';

  const missing = [];
  if (!name) missing.push('name');
  if (!email) missing.push('email');
  if (!phone) missing.push('phone');
  if (!company) missing.push('company');
  if (!authId) missing.push('auth (lineUserId / googleId / facebookId)');

  if (missing.length > 0) {
    return res.status(400).json({ error: 'Missing required fields', missing });
  }

  try {
    // 1. Check/create member account
    let member = await memberStore.findByEmail(email);
    const isNewMember = !member;
    let tempPassword = null;

    if (isNewMember) {
      member = await memberStore.createMember({ email, name });
      // Auto-generate temp password and activate immediately
      tempPassword = generateTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      await memberStore.setPasswordByEmail(email, passwordHash);
    }

    // 2. Append registration to Sheets
    await appendRegistration({ name, email, phone, company, lineUserId: authId, memberNumber: member.memberNumber || '', extraFields }, eventId);

    // 3. Try sending emails (non-fatal if fails)
    if (process.env.EMAIL_USER) {
      let eventInfo = null;
      try { eventInfo = await getEventInfo(eventId); } catch (_) {}
      const eventTitle = eventInfo?.title || '';
      const eventDate = eventInfo?.date || '';
      const eventLocation = eventInfo?.location || '';

      if (isNewMember) {
        try {
          await sendSetPasswordEmail(email, member.setPasswordToken);
        } catch (mailErr) {
          console.error('Set-password email failed (non-fatal):', mailErr.message);
        }
      }

      // 報名確認信 → 給會員
      try {
        await sendRegistrationConfirmationEmail(email, {
          name, eventTitle, eventDate, eventLocation, company,
          memberNumber: member.memberNumber || '',
        });
      } catch (mailErr) {
        console.error('Confirmation email failed (non-fatal):', mailErr.message);
      }

      // 報名通知信 → 給主辦單位
      try {
        await sendOrganizerNotificationEmail({ name, email, phone, company, lineId: lineUserId, memberNumber: member.memberNumber || '', eventTitle });
      } catch (mailErr) {
        console.error('Organizer notification email failed (non-fatal):', mailErr.message);
      }
    }

    res.status(201).json({ success: true, memberId: member.memberId, tempPassword });
  } catch (err) {
    console.error('POST /api/register error:', err.message);
    res.status(500).json({ error: 'Failed to save registration' });
  }
});

// POST /api/upload — 上傳圖片
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '未收到圖片檔案' });
  const url = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url });
});

// POST /api/auth/forgot-password — 申請重設密碼（寄送 Email）
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  try {
    const member = await memberStore.findByEmail(email);
    // Always return success to avoid email enumeration
    if (member && process.env.EMAIL_USER) {
      const token = await memberStore.generateResetToken(email);
      try {
        await sendResetPasswordEmail(email, token);
      } catch (mailErr) {
        console.error('Reset email send failed:', mailErr.message);
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/auth/forgot-password error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/set-password — 設定密碼並啟用帳號
app.post('/api/auth/set-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Missing token or newPassword' });
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and contain uppercase, lowercase, and a number' });
  }
  try {
    const member = await memberStore.findByToken(token);
    if (!member) return res.status(400).json({ error: 'Invalid token' });
    if (new Date(member.setPasswordTokenExpiry) < new Date()) {
      return res.status(400).json({ error: 'Token expired' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await memberStore.activateMember(token, passwordHash);
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/auth/set-password error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login — 登入
// POST /api/auth/google/callback — verify Google ID token, return googleId + displayName
app.post('/api/auth/google/callback', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing credential' });
  try {
    const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!infoRes.ok) return res.status(400).json({ error: 'Invalid Google credential' });
    const { sub, name, email } = await infoRes.json();
    res.json({ googleId: `google:${sub}`, displayName: name || email });
  } catch (err) {
    console.error('POST /api/auth/google/callback error:', err.message);
    res.status(400).json({ error: 'Google verification failed' });
  }
});

// POST /api/auth/facebook/callback — exchange OAuth code for facebookId + displayName
app.post('/api/auth/facebook/callback', async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code || !redirectUri) return res.status(400).json({ error: 'Missing code or redirectUri' });
  try {
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${encodeURIComponent(process.env.FACEBOOK_APP_ID)}&client_secret=${encodeURIComponent(process.env.FACEBOOK_APP_SECRET)}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(code)}`
    );
    if (!tokenRes.ok) return res.status(400).json({ error: 'Facebook authorization failed' });
    const { access_token } = await tokenRes.json();
    const profileRes = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${encodeURIComponent(access_token)}`);
    if (!profileRes.ok) return res.status(400).json({ error: 'Facebook authorization failed' });
    const { id, name } = await profileRes.json();
    if (!id) return res.status(400).json({ error: 'Facebook verification failed' });
    res.json({ facebookId: `facebook:${id}`, displayName: name });
  } catch (err) {
    console.error('POST /api/auth/facebook/callback error:', err.message);
    res.status(400).json({ error: 'Facebook verification failed' });
  }
});

// POST /api/auth/line/callback — LINE Login OAuth: exchange code for lineUserId
app.post('/api/auth/line/callback', async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code || !redirectUri) return res.status(400).json({ error: 'Missing code or redirectUri' });
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINE_LOGIN_CLIENT_ID,
      client_secret: process.env.LINE_LOGIN_CLIENT_SECRET,
    });
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!tokenRes.ok) return res.status(400).json({ error: 'LINE authorization failed' });
    const { access_token } = await tokenRes.json();
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!profileRes.ok) return res.status(400).json({ error: 'LINE authorization failed' });
    const { userId, displayName } = await profileRes.json();
    res.json({ lineUserId: userId, displayName });
  } catch (err) {
    console.error('POST /api/auth/line/callback error:', err.message);
    res.status(400).json({ error: 'LINE authorization failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  try {
    const member = await memberStore.findByEmail(email);
    if (!member) return res.status(401).json({ error: 'Invalid credentials' });
    if (!member.isActivated) {
      return res.status(403).json({ error: 'Account not activated. Check your email to set a password.' });
    }
    const valid = await bcrypt.compare(password, member.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ memberId: member.memberId, email: member.email });
    res.json({ token, member: { memberId: member.memberId, email: member.email, name: member.name } });
  } catch (err) {
    console.error('POST /api/auth/login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/member/me — 取得會員資料
app.get('/api/member/me', requireAuth, async (req, res) => {
  try {
    const member = await memberStore.findByEmail(req.member.email);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json({ memberId: member.memberId, email: member.email, name: member.name, createdAt: member.createdAt });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/member/registrations — 取得會員報名紀錄（含活動資訊）
app.get('/api/member/registrations', requireAuth, async (req, res) => {
  const eventId = req.query.eventId || process.env.DEFAULT_EVENT_ID || '001';
  try {
    const [registrations, eventInfo] = await Promise.all([
      getRegistrationsByEmail(req.member.email, eventId),
      getEventInfo(eventId),
    ]);
    const event = eventInfo
      ? { title: eventInfo.title || '', date: eventInfo.date || '', location: eventInfo.location || '' }
      : { title: '', date: '', location: '' };
    res.json(registrations.map((r) => ({ ...r, ...event })));
  } catch (err) {
    console.error('GET /api/member/registrations error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/member/change-password — 已登入會員直接更改密碼
app.post('/api/member/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing currentPassword or newPassword' });
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and contain uppercase, lowercase, and a number' });
  }
  try {
    const member = await memberStore.findByEmail(req.member.email);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    const valid = await bcrypt.compare(currentPassword, member.passwordHash);
    if (!valid) return res.status(401).json({ error: '目前密碼不正確' });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await memberStore.setPasswordByEmail(req.member.email, passwordHash);
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/member/change-password error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/checkin/qr?token=xxx — 產生 QR code PNG（掃碼直接開報到頁）
app.get('/api/checkin/qr', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  try {
    const base = process.env.SERVER_BASE_URL || `http://${getLocalIP()}:${PORT}`;
    const checkinUrl = `${base}/api/checkin/mark?token=${token}`;
    const png = await QRCode.toBuffer(checkinUrl, { type: 'png', width: 260, margin: 2 });
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    res.status(500).json({ error: 'QR generation failed' });
  }
});

// GET /api/checkin/mark?token=xxx — 掃碼報到，標記已出席
app.get('/api/checkin/mark', async (req, res) => {
  const { token } = req.query;
  const eventId = req.query.eventId || process.env.DEFAULT_EVENT_ID || '001';
  if (!token) return res.status(400).json({ error: 'Missing token' });
  try {
    const result = await markAttended(token, eventId);
    if (!result) return res.status(404).send(`
      <html><head><meta charset="utf-8">
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fef2f2;}
      .box{text-align:center;padding:2rem 3rem;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1);}
      h2{color:#dc2626;}p{color:#6b7280;}</style></head>
      <body><div class="box">
        <div style="font-size:3rem">❌</div>
        <h2>找不到此報到碼</h2>
        <p>此 QR Code 已失效，請重新報名取得新的報到碼。</p>
      </div></body></html>
    `);
    res.send(`
      <html><head><meta charset="utf-8">
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f0fdf4;}
      .box{text-align:center;padding:2rem 3rem;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1);}
      h2{color:#16a34a;}p{color:#374151;}</style></head>
      <body><div class="box">
        <div style="font-size:3rem">✅</div>
        <h2>報到成功！</h2>
        <p><strong>${result.name}</strong></p>
        <p style="color:#6b7280">${result.email}</p>
        ${result.company ? `<p style="color:#6b7280">${result.company}</p>` : ''}
      </div></body></html>
    `);
  } catch (err) {
    console.error('GET /api/checkin/mark error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin 驗證 middleware
function requireAdmin(req, res, next) {
  const pw = req.headers['x-admin-password'];
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// GET /api/admin/members — 取得所有會員（含公司、報名課程）
app.get('/api/admin/members', requireAdmin, async (req, res) => {
  const eventId = req.query.eventId || process.env.DEFAULT_EVENT_ID || '001';
  try {
    const { google } = require('googleapis');
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new (require('googleapis').google.auth.GoogleAuth)({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = require('googleapis').google.sheets({ version: 'v4', auth });

    const [regRes, eventRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: process.env.SPREADSHEET_ID, range: `registrations-${eventId}!A2:I` }),
      sheets.spreadsheets.values.get({ spreadsheetId: process.env.SPREADSHEET_ID, range: `event-info-${eventId}!A2:B2` }),
    ]);

    const eventRows = eventRes.data.values || [];
    const eventTitle = (eventRows[0] && eventRows[0][0]) || '';
    const eventDate = (eventRows[0] && eventRows[0][1]) || '';

    // Build email → { company, registrations[] } map
    const emailMap = {};
    (regRes.data.values || []).forEach((row) => {
      const email = row[3] || '';
      const company = row[5] || '';
      const attended = row[7] || '待確認';
      if (!email) return;
      if (!emailMap[email]) emailMap[email] = { company, registrations: [] };
      emailMap[email].company = company;
      emailMap[email].registrations.push({ eventTitle, eventDate, attended, submittedAt: row[0] || '' });
    });

    const members = await memberStore.readMembers();
    res.json(members.map(({ passwordHash, setPasswordToken, setPasswordTokenExpiry, ...m }) => ({
      ...m,
      company: (emailMap[m.email] && emailMap[m.email].company) || '',
      registrations: (emailMap[m.email] && emailMap[m.email].registrations) || [],
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/members — 後台手動建立新會員
app.post('/api/admin/members', requireAdmin, async (req, res) => {
  const { name, email, phone, company, lineId, password, sendEmail } = req.body;
  const eventId = req.query.eventId || process.env.DEFAULT_EVENT_ID || '001';

  // 必填欄位驗證
  const missing = [];
  if (!name) missing.push('name');
  if (!email) missing.push('email');
  if (missing.length > 0) return res.status(400).json({ error: 'Missing required fields', missing });

  // 密碼強度驗證（若有填）
  if (password && !isStrongPassword(password)) {
    return res.status(400).json({ error: 'Password too weak' });
  }

  try {
    // Email 唯一性
    const existing = await memberStore.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    // 建立會員
    const member = await memberStore.createMember({ email, name });

    // 電話/公司/LINE ID 寫入 Sheets
    if (phone || company || lineId) {
      try {
        await appendRegistration({ name, email, phone: phone || '', company: company || '', lineId: lineId || '', memberNumber: member.memberNumber }, eventId);
      } catch (sheetErr) {
        console.error('Sheets write failed (non-fatal):', sheetErr.message);
      }
    }

    // 直接設定密碼（若有填）
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await memberStore.setPasswordByEmail(email, passwordHash);
    }

    // 寄送設定密碼信
    if (sendEmail && process.env.EMAIL_USER) {
      try {
        await sendSetPasswordEmail(email, member.setPasswordToken);
      } catch (mailErr) {
        console.error('Set-password email failed (non-fatal):', mailErr.message);
      }
    }

    // 取得最新 isActivated 狀態
    const updated = await memberStore.findByEmail(email);
    res.status(201).json({
      memberId: updated.memberId,
      memberNumber: updated.memberNumber,
      email: updated.email,
      name: updated.name,
      isActivated: updated.isActivated,
    });
  } catch (err) {
    console.error('POST /api/admin/members error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/members/:memberId — 刪除指定會員
app.delete('/api/admin/members/:memberId', requireAdmin, async (req, res) => {
  try {
    const members = await memberStore.readMembers();
    const filtered = members.filter((m) => m.memberId !== req.params.memberId);
    if (filtered.length === members.length) return res.status(404).json({ error: 'Member not found' });
    await memberStore.writeMembers(filtered);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/members/:memberId — 更新會員資料（name / email / isActivated）
app.patch('/api/admin/members/:memberId', requireAdmin, async (req, res) => {
  const { name, email, isActivated } = req.body;
  try {
    // Email 唯一性驗證
    if (email !== undefined) {
      const existing = await memberStore.findByEmail(email);
      if (existing && existing.memberId !== req.params.memberId) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }
    const updated = await memberStore.updateMember(req.params.memberId, { name, email, isActivated });
    if (!updated) return res.status(404).json({ error: 'Member not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/members — 清空所有會員
app.delete('/api/admin/members', requireAdmin, async (req, res) => {
  try {
    await memberStore.writeMembers([]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/notify-event-change — 發送活動取消或更改通知給所有報名者
app.post('/api/admin/notify-event-change', requireAdmin, async (req, res) => {
  const { type, message, eventId = process.env.DEFAULT_EVENT_ID || '001' } = req.body;
  if (!type || !message) return res.status(400).json({ error: 'Missing type or message' });
  try {
    const { google } = require('googleapis');
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `registrations-${eventId}!A2:D`,
    });
    const rows = sheetRes.data.values || [];
    const emails = [...new Set(rows.map((r) => r[3]).filter(Boolean))];

    let eventTitle = '';
    try { const info = await getEventInfo(eventId); eventTitle = info?.title || ''; } catch (_) {}

    // 非同步發送，立即回傳
    const sendFn = type === 'cancel' ? sendEventCancelNotificationEmail : sendEventChangeNotificationEmail;
    emails.forEach((email) => {
      sendFn(email, { eventTitle, message }).catch((e) => console.error('Notify email failed:', e.message));
    });

    res.json({ queued: emails.length });
  } catch (err) {
    console.error('POST /api/admin/notify-event-change error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/notify-pre-event — 課前通知：同時發送 Email 和 LINE 推播給所有報名者
app.post('/api/admin/notify-pre-event', requireAdmin, async (req, res) => {
  const { title, message, channels = [] } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Missing title or message' });
  if (!Array.isArray(channels) || channels.length === 0) return res.status(400).json({ error: 'Missing channels' });

  try {
    const registrations = await getAllRegistrations();
    let emailCount = 0;
    let lineCount = 0;

    if (channels.includes('email') && process.env.EMAIL_USER) {
      const emails = [...new Set(registrations.map((r) => r.email).filter(Boolean))];
      emailCount = emails.length;
      Promise.allSettled(
        emails.map((email) => sendPreEventReminderEmail(email, { title, message }))
      ).then((results) => {
        const failed = results.filter((r) => r.status === 'rejected');
        if (failed.length > 0) console.error(`notify-pre-event: ${failed.length} email(s) failed`);
      });
    }

    if (channels.includes('line') && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      const { sendLineMulticast } = require('./line');
      const userIds = registrations.map((r) => r.lineUserId).filter(Boolean);
      lineCount = userIds.length;
      sendLineMulticast(userIds, [{ type: 'text', text: `${title}\n${message}` }])
        .catch((e) => console.error('notify-pre-event LINE error:', e.message));
    }

    res.json({ queued: { email: emailCount, line: lineCount } });
  } catch (err) {
    console.error('POST /api/admin/notify-pre-event error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/init-sheets — 初始化所有後台表頭並套用紫色樣式
app.post('/api/admin/init-sheets', async (req, res) => {
  try {
    await initializeSheets();
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/admin/init-sheets error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Helper: generate pre-fill links for all registrants of an event
async function generateFormLinks(eventId) {
  const info = await getEventInfo(eventId);
  const forms = (info && info.forms) || [];
  if (forms.length === 0) return { forms: [], links: null };
  const registrations = await getAllRegistrations(eventId);
  const links = registrations.map((r) => ({
    name: r.name,
    email: r.email,
    lineUserId: r.lineUserId,
    links: forms.map((form) => ({
      formName: form.name,
      formId: form.id,
      url: form.prefillTemplate
        .replace(/\{name\}/g, encodeURIComponent(r.name || ''))
        .replace(/\{email\}/g, encodeURIComponent(r.email || '')),
    })),
  }));
  return { forms, links };
}

// POST /api/admin/generate-form-links — 產生學員個人化預填連結
app.post('/api/admin/generate-form-links', requireAdmin, async (req, res) => {
  const { eventId = process.env.DEFAULT_EVENT_ID || '001' } = req.body;
  try {
    const { forms, links } = await generateFormLinks(eventId);
    if (forms.length === 0) return res.status(400).json({ error: 'No forms configured for this event' });
    res.json(links);
  } catch (err) {
    console.error('POST /api/admin/generate-form-links error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/send-form-links — 批次發送預填連結（email / line）
app.post('/api/admin/send-form-links', requireAdmin, async (req, res) => {
  const { eventId = process.env.DEFAULT_EVENT_ID || '001', channel } = req.body;
  if (channel !== 'email' && channel !== 'line') {
    return res.status(400).json({ error: 'channel must be "email" or "line"' });
  }
  try {
    const { forms, links } = await generateFormLinks(eventId);
    if (forms.length === 0) return res.status(400).json({ error: 'No forms configured for this event' });

    let sent = 0;
    let skipped = 0;

    if (channel === 'email') {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      for (const r of links) {
        if (!r.email) { skipped++; continue; }
        const linksHtml = r.links.map((l) => `<p><strong>${l.formName}</strong>：<a href="${l.url}">${l.url}</a></p>`).join('');
        try {
          const { data, error } = await resend.emails.send({
            from: '活動報名系統 <onboarding@resend.dev>',
            to: [r.email],
            subject: '【課程表單】請填寫以下表單',
            html: `<h2>親愛的 ${r.name}，</h2><p>請填寫以下課程表單：</p>${linksHtml}`,
          });
          if (error) {
            console.error(`send-form-links email to ${r.email} failed:`, JSON.stringify(error));
            skipped++;
          } else {
            console.log(`send-form-links email to ${r.email} sent:`, data?.id);
            sent++;
          }
        } catch (mailErr) {
          console.error(`send-form-links email to ${r.email} exception:`, mailErr.message);
          skipped++;
        }
      }
    } else {
      const { messagingApi } = require('@line/bot-sdk');
      const client = new messagingApi.MessagingApiClient({ channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN });
      for (const r of links) {
        if (!r.lineUserId || !r.lineUserId.startsWith('U')) { skipped++; continue; }
        const text = r.links.map((l) => `${l.formName}：${l.url}`).join('\n');
        try {
          await client.pushMessage({ to: r.lineUserId, messages: [{ type: 'text', text }] });
          sent++;
        } catch (lineErr) {
          console.error(`send-form-links LINE to ${r.lineUserId} failed:`, lineErr.message);
          skipped++;
        }
      }
    }

    res.json({ sent, skipped });
  } catch (err) {
    console.error('POST /api/admin/send-form-links error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/form-completion — 讀取各表單回應 Sheet，回傳完成矩陣
app.get('/api/admin/form-completion', requireAdmin, async (req, res) => {
  const eventId = req.query.eventId || process.env.DEFAULT_EVENT_ID || '001';
  try {
    const info = await getEventInfo(eventId);
    const forms = (info && info.forms) || [];
    if (forms.length === 0) return res.json({ forms: [], registrants: [] });

    const registrations = await getAllRegistrations(eventId);
    const errors = [];

    // Read each form's response sheet
    const emailSets = await Promise.all(
      forms.map(async (form) => {
        try {
          return await getFormResponses(form.responseSheetId, form.responseEmailColumn ?? 1);
        } catch (err) {
          errors.push({ formId: form.id, message: 'Unable to access response sheet' });
          return null;
        }
      })
    );

    const registrants = registrations.map((r) => ({
      name: r.name,
      email: r.email,
      completed: emailSets.map((emailSet) =>
        emailSet ? emailSet.has((r.email || '').toLowerCase()) : false
      ),
    }));

    const result = {
      forms: forms.map((f) => ({ id: f.id, name: f.name })),
      registrants,
    };
    if (errors.length > 0) result.errors = errors;
    res.json(result);
  } catch (err) {
    console.error('GET /api/admin/form-completion error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Auto-initialize sheet headers on startup (non-blocking)
    initializeSheets().catch((err) => console.warn('Sheet init skipped:', err.message));
  });
}

module.exports = app;
