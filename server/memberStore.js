'use strict';

const { google } = require('googleapis');
const { randomUUID } = require('crypto');

const MEMBERS_TAB = 'members';
// Columns: A=memberId B=memberNumber C=email D=name E=passwordHash F=isActivated G=setPasswordToken H=setPasswordTokenExpiry I=createdAt
const MEMBERS_RANGE = `${MEMBERS_TAB}!A2:I`;

function getClient() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set');
  const credentials = JSON.parse(keyJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

function spreadsheetId() {
  const id = process.env.SPREADSHEET_ID;
  if (!id) throw new Error('SPREADSHEET_ID not set');
  return id;
}

function rowToMember(row) {
  return {
    memberId: row[0] || '',
    memberNumber: row[1] || '',
    email: row[2] || '',
    name: row[3] || '',
    passwordHash: row[4] || null,
    isActivated: row[5] === 'TRUE',
    setPasswordToken: row[6] || null,
    setPasswordTokenExpiry: row[7] || null,
    createdAt: row[8] || '',
  };
}

function memberToRow(m) {
  return [
    m.memberId || '',
    m.memberNumber || '',
    m.email || '',
    m.name || '',
    m.passwordHash || '',
    m.isActivated ? 'TRUE' : 'FALSE',
    m.setPasswordToken || '',
    m.setPasswordTokenExpiry || '',
    m.createdAt || '',
  ];
}

async function ensureMembersSheet(sheets, sid) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sid });
  const exists = meta.data.sheets.some((s) => s.properties.title === MEMBERS_TAB);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sid,
      requestBody: { requests: [{ addSheet: { properties: { title: MEMBERS_TAB } } }] },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: sid,
      range: `${MEMBERS_TAB}!A1:I1`,
      valueInputOption: 'RAW',
      requestBody: { values: [['memberId', 'memberNumber', 'email', 'name', 'passwordHash', 'isActivated', 'setPasswordToken', 'setPasswordTokenExpiry', 'createdAt']] },
    });
  }
}

async function readMembers() {
  const sheets = getClient();
  const sid = spreadsheetId();
  await ensureMembersSheet(sheets, sid);
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sid, range: MEMBERS_RANGE });
  return (res.data.values || []).map(rowToMember);
}

async function findRowIndex(sheets, sid, predicate) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sid, range: MEMBERS_RANGE });
  const rows = res.data.values || [];
  const idx = rows.findIndex(predicate);
  return { rows, idx, sheetRow: idx === -1 ? -1 : idx + 2 };
}

async function updateRow(sheets, sid, sheetRow, member) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: `${MEMBERS_TAB}!A${sheetRow}:I${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [memberToRow(member)] },
  });
}

async function findByEmail(email) {
  const members = await readMembers();
  return members.find((m) => m.email === email) || null;
}

async function findByToken(token) {
  const members = await readMembers();
  return members.find((m) => m.setPasswordToken === token) || null;
}

async function createMember({ email, name }) {
  const sheets = getClient();
  const sid = spreadsheetId();
  await ensureMembersSheet(sheets, sid);
  const members = await readMembers();
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextNumber = (members.length + 1).toString().padStart(3, '0');
  const member = {
    memberId: randomUUID(),
    memberNumber: nextNumber,
    email,
    name,
    passwordHash: null,
    isActivated: false,
    setPasswordToken: randomUUID(),
    setPasswordTokenExpiry: expiry.toISOString(),
    createdAt: now.toISOString(),
  };
  await sheets.spreadsheets.values.append({
    spreadsheetId: sid,
    range: `${MEMBERS_TAB}!A2`,
    valueInputOption: 'RAW',
    requestBody: { values: [memberToRow(member)] },
  });
  return member;
}

async function activateMember(token, passwordHash) {
  const sheets = getClient();
  const sid = spreadsheetId();
  const { rows, idx, sheetRow } = await findRowIndex(sheets, sid, (r) => r[6] === token);
  if (idx === -1) throw new Error('Token not found');
  const member = { ...rowToMember(rows[idx]), passwordHash, isActivated: true, setPasswordToken: null, setPasswordTokenExpiry: null };
  await updateRow(sheets, sid, sheetRow, member);
}

async function setPasswordByEmail(email, passwordHash) {
  const sheets = getClient();
  const sid = spreadsheetId();
  const { rows, idx, sheetRow } = await findRowIndex(sheets, sid, (r) => r[2] === email);
  if (idx === -1) throw new Error('Member not found');
  const member = { ...rowToMember(rows[idx]), passwordHash, isActivated: true, setPasswordToken: null, setPasswordTokenExpiry: null };
  await updateRow(sheets, sid, sheetRow, member);
}

async function generateResetToken(email) {
  const sheets = getClient();
  const sid = spreadsheetId();
  const { rows, idx, sheetRow } = await findRowIndex(sheets, sid, (r) => r[2] === email);
  if (idx === -1) throw new Error('Member not found');
  const token = randomUUID();
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const member = { ...rowToMember(rows[idx]), setPasswordToken: token, setPasswordTokenExpiry: expiry };
  await updateRow(sheets, sid, sheetRow, member);
  return token;
}

async function updateMember(memberId, fields) {
  const sheets = getClient();
  const sid = spreadsheetId();
  const { rows, idx, sheetRow } = await findRowIndex(sheets, sid, (r) => r[0] === memberId);
  if (idx === -1) return null;
  const member = rowToMember(rows[idx]);
  ['name', 'email', 'isActivated'].forEach((key) => {
    if (fields[key] !== undefined) member[key] = fields[key];
  });
  await updateRow(sheets, sid, sheetRow, member);
  const { passwordHash, setPasswordToken, setPasswordTokenExpiry, ...safe } = member;
  return safe;
}

// Keep writeMembers as no-op for test compatibility
async function writeMembers() {}

module.exports = { readMembers, writeMembers, findByEmail, findByToken, createMember, activateMember, setPasswordByEmail, generateResetToken, updateMember };
