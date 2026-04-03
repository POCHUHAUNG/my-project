'use strict';
/**
 * Admin tool: reset a member's password
 * Usage: node reset-password.js <email>
 * Example: node reset-password.js someone@example.com
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const memberStore = require('./memberStore');

const email = process.argv[2];
if (!email) {
  console.error('用法：node reset-password.js <email>');
  process.exit(1);
}

const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const lower = 'abcdefghjkmnpqrstuvwxyz';
const digits = '23456789';
const all = upper + lower + digits;

function generateTempPassword() {
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

async function main() {
  const member = await memberStore.findByEmail(email);
  if (!member) {
    console.error(`找不到會員：${email}`);
    process.exit(1);
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  await memberStore.setPasswordByEmail(email, passwordHash);

  console.log('');
  console.log('✅ 密碼已重設');
  console.log('─────────────────────────────');
  console.log(`會員：${member.name} (${email})`);
  console.log(`臨時密碼：${tempPassword}`);
  console.log('─────────────────────────────');
  console.log('請將此臨時密碼告知會員，登入後可自行更改。');
  console.log('');
}

main().catch((err) => { console.error(err.message); process.exit(1); });
