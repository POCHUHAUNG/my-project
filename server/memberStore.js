'use strict';

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_PATH = process.env._TEST_MEMBERS_PATH
  || path.join(__dirname, 'data', 'members.json');

// Concurrency guard — serialise all writes
let writing = false;
const writeQueue = [];

async function readMembers() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, '[]');
    return [];
  }
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeMembers(members) {
  return new Promise((resolve, reject) => {
    writeQueue.push({ members, resolve, reject });
    if (!writing) processQueue();
  });
}

function processQueue() {
  if (writeQueue.length === 0) { writing = false; return; }
  writing = true;
  const { members, resolve, reject } = writeQueue.shift();
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(members, null, 2));
    resolve();
  } catch (err) {
    reject(err);
  }
  processQueue();
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
  const members = await readMembers();
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h
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
  members.push(member);
  await writeMembers(members);
  return member;
}

async function activateMember(token, passwordHash) {
  const members = await readMembers();
  const idx = members.findIndex((m) => m.setPasswordToken === token);
  if (idx === -1) throw new Error('Token not found');
  members[idx].passwordHash = passwordHash;
  members[idx].isActivated = true;
  members[idx].setPasswordToken = null;
  members[idx].setPasswordTokenExpiry = null;
  await writeMembers(members);
}

async function setPasswordByEmail(email, passwordHash) {
  const members = await readMembers();
  const idx = members.findIndex((m) => m.email === email);
  if (idx === -1) throw new Error('Member not found');
  members[idx].passwordHash = passwordHash;
  members[idx].isActivated = true;
  members[idx].setPasswordToken = null;
  members[idx].setPasswordTokenExpiry = null;
  await writeMembers(members);
}

async function generateResetToken(email) {
  const members = await readMembers();
  const idx = members.findIndex((m) => m.email === email);
  if (idx === -1) throw new Error('Member not found');
  const token = randomUUID();
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  members[idx].setPasswordToken = token;
  members[idx].setPasswordTokenExpiry = expiry;
  await writeMembers(members);
  return token;
}

async function updateMember(memberId, fields) {
  const members = await readMembers();
  const idx = members.findIndex((m) => m.memberId === memberId);
  if (idx === -1) return null;
  const allowed = ['name', 'email', 'isActivated'];
  allowed.forEach((key) => {
    if (fields[key] !== undefined) members[idx][key] = fields[key];
  });
  await writeMembers(members);
  const { passwordHash, setPasswordToken, setPasswordTokenExpiry, ...safe } = members[idx];
  return safe;
}

module.exports = { readMembers, writeMembers, findByEmail, findByToken, createMember, activateMember, setPasswordByEmail, generateResetToken, updateMember };
