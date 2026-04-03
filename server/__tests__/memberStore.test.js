const path = require('path');
const fs = require('fs');
const os = require('os');

// Use a temp file for each test run
let tmpFile;
let store;

beforeEach(() => {
  tmpFile = path.join(os.tmpdir(), `members-test-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, '[]');
  jest.resetModules();
  // Override DATA_PATH before requiring the module
  process.env._TEST_MEMBERS_PATH = tmpFile;
  store = require('../memberStore');
});

afterEach(() => {
  delete process.env._TEST_MEMBERS_PATH;
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
});

test('readMembers returns empty array on empty file', async () => {
  const members = await store.readMembers();
  expect(members).toEqual([]);
});

test('createMember creates a member with expected fields', async () => {
  const m = await store.createMember({ email: 'a@b.com', name: 'Alice' });
  expect(m.email).toBe('a@b.com');
  expect(m.name).toBe('Alice');
  expect(m.memberId).toBeTruthy();
  expect(m.isActivated).toBe(false);
  expect(m.passwordHash).toBeNull();
  expect(m.setPasswordToken).toBeTruthy();
  expect(new Date(m.setPasswordTokenExpiry) > new Date()).toBe(true);
});

test('findByEmail returns member after creation', async () => {
  await store.createMember({ email: 'find@test.com', name: 'Bob' });
  const found = await store.findByEmail('find@test.com');
  expect(found.email).toBe('find@test.com');
});

test('findByEmail returns null when not found', async () => {
  const found = await store.findByEmail('nothere@test.com');
  expect(found).toBeNull();
});

test('findByToken returns member matching token', async () => {
  const m = await store.createMember({ email: 'tok@test.com', name: 'Carol' });
  const found = await store.findByToken(m.setPasswordToken);
  expect(found.email).toBe('tok@test.com');
});

test('activateMember sets isActivated and passwordHash', async () => {
  const m = await store.createMember({ email: 'act@test.com', name: 'Dave' });
  await store.activateMember(m.setPasswordToken, 'hashed-pw');
  const updated = await store.findByEmail('act@test.com');
  expect(updated.isActivated).toBe(true);
  expect(updated.passwordHash).toBe('hashed-pw');
  expect(updated.setPasswordToken).toBeNull();
});
