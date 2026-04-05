const { google } = require('googleapis');
const { randomUUID } = require('crypto');

function getClient() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
  const credentials = JSON.parse(keyJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

const spreadsheetId = () => {
  const id = process.env.SPREADSHEET_ID;
  if (!id) throw new Error('SPREADSHEET_ID environment variable is not set');
  return id;
};

const defaultEventId = () => process.env.DEFAULT_EVENT_ID || '001';

async function updateEventImages({ imageUrl, dmUrl, agendaTagEn, agendaTagZh, fieldConfig, forms, youtubeUrl }, eventId = defaultEventId()) {
  const sheets = getClient();
  const tab = `event-info-${eventId}`;
  const fieldMap = { imageUrl: 'E2', dmUrl: 'F2', agendaTagEn: 'G2', agendaTagZh: 'H2', fieldConfig: 'I2', forms: 'J2', youtubeUrl: 'K2' };
  const args = {
    imageUrl, dmUrl, agendaTagEn, agendaTagZh,
    fieldConfig: fieldConfig !== undefined ? JSON.stringify(fieldConfig) : undefined,
    forms: forms !== undefined ? JSON.stringify(forms) : undefined,
    youtubeUrl,
  };
  const requests = Object.entries(args)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId(),
      range: `${tab}!${fieldMap[key]}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[value]] },
    }));
  await Promise.all(requests);
}

async function getEventInfo(eventId = defaultEventId()) {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `event-info-${eventId}!A2:K2`,
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) return null;
  const [title, date, location, description, imageUrl, dmUrl, agendaTagEn, agendaTagZh, fieldConfigStr, formsStr, youtubeUrl] = rows[0];
  let fieldConfig = { hints: {}, customFields: [] };
  try { if (fieldConfigStr) fieldConfig = JSON.parse(fieldConfigStr); } catch {}
  let forms = [];
  try { if (formsStr) forms = JSON.parse(formsStr); } catch {}
  if (!Array.isArray(forms)) forms = [];
  return {
    title, date, location, description,
    imageUrl: imageUrl || '',
    dmUrl: dmUrl || '',
    agendaTagEn: agendaTagEn || 'Schedule',
    agendaTagZh: agendaTagZh || '活動議程',
    fieldConfig,
    forms,
    youtubeUrl: youtubeUrl || '',
  };
}

async function getFormResponses(responseSheetId, responseEmailColumn) {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: responseSheetId,
    range: 'A2:Z',
  });
  const rows = res.data.values || [];
  const emails = new Set();
  for (const row of rows) {
    const val = row[responseEmailColumn];
    if (val && typeof val === 'string') emails.add(val.trim().toLowerCase());
  }
  return emails;
}

async function getAgenda(eventId = defaultEventId()) {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `agenda-${eventId}!A2:E`,
  });
  const rows = res.data.values || [];
  return rows.map(([time, topic, speaker, description, session]) => ({
    time: time || '',
    topic: topic || '',
    speaker: speaker || '',
    description: description || '',
    session: session || '',
  }));
}

const REGISTRATION_HEADERS = ['報名時間', '會員編號', '姓名', 'Email', '電話', '公司 / 單位', 'LINE ID', '出席狀態', '報到代碼', '驗證帳號', '自訂資料'];

function formatTaipeiTime(date) {
  return date.toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).replace('T', ' ');
}

async function ensureRegistrationHeaders(sheets, eventId) {
  const tab = `registrations-${eventId}`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${tab}!A1:K1`,
  });
  const firstRow = (res.data.values || [])[0] || [];
  if (firstRow[0] !== REGISTRATION_HEADERS[0] || firstRow[10] !== REGISTRATION_HEADERS[10]) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId(),
      range: `${tab}!A1:K1`,
      valueInputOption: 'RAW',
      requestBody: { values: [REGISTRATION_HEADERS] },
    });
  }
}

async function appendRegistration({ name, email, phone, company, lineUserId, memberNumber, extraFields }, eventId = defaultEventId()) {
  const sheets = getClient();
  await ensureRegistrationHeaders(sheets, eventId);
  const submittedAt = formatTaipeiTime(new Date());
  const checkinToken = randomUUID();
  const extraStr = extraFields && Object.keys(extraFields).length > 0 ? JSON.stringify(extraFields) : '';
  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: `registrations-${eventId}!A2`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[submittedAt, memberNumber || '', name, email, phone, company, '', '待確認', checkinToken, lineUserId || '', extraStr]],
    },
  });
  return checkinToken;
}

async function getRegistrationsByEmail(email, eventId = defaultEventId()) {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `registrations-${eventId}!A2:I`,
  });
  const rows = res.data.values || [];
  return rows
    .filter((row) => row[3] === email)
    .map((row) => ({
      submittedAt: row[0] || '',
      name: row[2] || '',
      email: row[3] || '',
      phone: row[4] || '',
      company: row[5] || '',
      lineId: row[6] || '',
      attended: row[7] || '待確認',
      checkinToken: row[8] || '',
    }));
}

async function getAllRegistrations(eventId = defaultEventId()) {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `registrations-${eventId}!A2:J`,
  });
  const rows = res.data.values || [];
  return rows.map((row) => ({
    submittedAt: row[0] || '',
    memberNumber: row[1] || '',
    name: row[2] || '',
    email: row[3] || '',
    phone: row[4] || '',
    company: row[5] || '',
    attended: row[7] || '待確認',
    checkinToken: row[8] || '',
    lineUserId: row[9] || '',
  }));
}

async function getRegistrationByToken(token, eventId = defaultEventId()) {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `registrations-${eventId}!A2:I`,
  });
  const rows = res.data.values || [];
  const row = rows.find((r) => r[8] === token);
  if (!row) return null;
  return {
    submittedAt: row[0] || '',
    memberNumber: row[1] || '',
    name: row[2] || '',
    email: row[3] || '',
    company: row[5] || '',
  };
}

async function markAttended(token, eventId = defaultEventId()) {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `registrations-${eventId}!A2:I`,
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((row) => row[8] === token);
  if (rowIndex === -1) return null;
  const sheetRow = rowIndex + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: `registrations-${eventId}!H${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['已出席']] },
  });
  return { name: rows[rowIndex][2], email: rows[rowIndex][3], company: rows[rowIndex][5] };
}

const EVENT_INFO_HEADERS = ['活動名稱', '日期', '地點', '說明', '主視覺圖片 URL', '課程 DM URL', '議程英文標籤', '議程中文標題', '欄位設定', '表單設定', 'YouTube 影片 URL'];
const AGENDA_HEADERS = ['時間', '主題', '講者', '說明', '場次'];

async function initializeSheets(eventId = defaultEventId()) {
  const sheets = getClient();
  const sid = spreadsheetId();

  const eventInfoTab = `event-info-${eventId}`;
  const agendaTab = `agenda-${eventId}`;
  const registrationsTab = `registrations-${eventId}`;

  // Get sheet IDs for formatting
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sid });
  const sheetIdMap = {};
  meta.data.sheets.forEach((s) => {
    sheetIdMap[s.properties.title] = s.properties.sheetId;
  });

  // Create missing sheets
  const addRequests = [];
  [eventInfoTab, agendaTab, registrationsTab].forEach((title) => {
    if (sheetIdMap[title] === undefined) {
      addRequests.push({ addSheet: { properties: { title } } });
    }
  });
  if (addRequests.length > 0) {
    const addRes = await sheets.spreadsheets.batchUpdate({ spreadsheetId: sid, requestBody: { requests: addRequests } });
    addRes.data.replies.forEach((reply) => {
      if (reply.addSheet) {
        const { title, sheetId } = reply.addSheet.properties;
        sheetIdMap[title] = sheetId;
      }
    });
  }

  // Write header rows
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sid,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        { range: `${eventInfoTab}!A1:K1`, values: [EVENT_INFO_HEADERS] },
        { range: `${agendaTab}!A1:E1`, values: [AGENDA_HEADERS] },
        { range: `${registrationsTab}!A1:I1`, values: [REGISTRATION_HEADERS] },
      ],
    },
  });

  // Purple background + white bold text + freeze row 1
  const purple = { red: 0.42, green: 0.18, blue: 0.56 };
  const white = { red: 1, green: 1, blue: 1 };
  const sheetDefs = [
    { title: eventInfoTab, cols: 11 },
    { title: agendaTab, cols: 5 },
    { title: registrationsTab, cols: 9 },
  ];

  const requests = [];
  sheetDefs.forEach(({ title, cols }) => {
    const sheetId = sheetIdMap[title];
    if (sheetId === undefined) return;
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: cols },
        cell: {
          userEnteredFormat: {
            backgroundColor: purple,
            textFormat: { bold: true, foregroundColor: white, fontSize: 10 },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    });
    requests.push({
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    });
  });

  await sheets.spreadsheets.batchUpdate({ spreadsheetId: sid, requestBody: { requests } });
}

async function patchEventInfoHeaders(eventId = defaultEventId()) {
  const sheets = getClient();
  const sid = spreadsheetId();
  const tab = `event-info-${eventId}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: `${tab}!A1:K1`,
    valueInputOption: 'RAW',
    requestBody: { values: [EVENT_INFO_HEADERS] },
  });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: sid });
  const sheetObj = meta.data.sheets.find((s) => s.properties.title === tab);
  if (!sheetObj) return;
  const sheetId = sheetObj.properties.sheetId;

  const purple = { red: 0.42, green: 0.18, blue: 0.56 };
  const white = { red: 1, green: 1, blue: 1 };
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sid,
    requestBody: {
      requests: [{
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 11 },
          cell: {
            userEnteredFormat: {
              backgroundColor: purple,
              textFormat: { bold: true, foregroundColor: white, fontSize: 10 },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
      }],
    },
  });
}

module.exports = { getEventInfo, getAgenda, appendRegistration, getRegistrationsByEmail, getAllRegistrations, updateEventImages, markAttended, getRegistrationByToken, initializeSheets, getFormResponses, patchEventInfoHeaders };
