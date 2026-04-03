process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long!!';
process.env.GOOGLE_SERVICE_ACCOUNT_KEY = JSON.stringify({ type: 'service_account' });
process.env.SPREADSHEET_ID = 'test-id';

const path = require('path');
const fs = require('fs');
const os = require('os');
const request = require('supertest');

// Temp members file
const tmpFile = path.join(os.tmpdir(), `members-routes-${Date.now()}.json`);
fs.writeFileSync(tmpFile, '[]');
process.env._TEST_MEMBERS_PATH = tmpFile;

// Mock sheets module
jest.mock('../sheets', () => ({
  getEventInfo: jest.fn(),
  getAgenda: jest.fn(),
  appendRegistration: jest.fn().mockResolvedValue(undefined),
  getRegistrationsByEmail: jest.fn().mockResolvedValue([]),
}));

// Mock mailer
jest.mock('../mailer', () => ({
  sendSetPasswordEmail: jest.fn().mockResolvedValue(undefined),
}));

const app = require('../index');
const memberStore = require('../memberStore');
const { signToken } = require('../auth');

afterAll(() => {
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
});

// --- Auth: set-password ---
describe('POST /api/auth/set-password', () => {
  test('returns 400 for invalid token', async () => {
    const res = await request(app).post('/api/auth/set-password').send({ token: 'bad', newPassword: 'password123' });
    expect(res.status).toBe(400);
  });

  test('activates account with valid token', async () => {
    const m = await memberStore.createMember({ email: 'sp@test.com', name: 'SP' });
    const res = await request(app).post('/api/auth/set-password').send({ token: m.setPasswordToken, newPassword: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const updated = await memberStore.findByEmail('sp@test.com');
    expect(updated.isActivated).toBe(true);
  });

  test('returns 400 for password shorter than 8 chars', async () => {
    const m = await memberStore.createMember({ email: 'short@test.com', name: 'Short' });
    const res = await request(app).post('/api/auth/set-password').send({ token: m.setPasswordToken, newPassword: 'abc' });
    expect(res.status).toBe(400);
  });
});

// --- Auth: login ---
describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    const m = await memberStore.createMember({ email: 'login@test.com', name: 'Login' });
    await memberStore.activateMember(m.setPasswordToken, require('bcryptjs').hashSync('correct-pw', 10));
  });

  test('returns 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('returns token for correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'correct-pw' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.member.email).toBe('login@test.com');
  });

  test('returns 403 for non-activated account', async () => {
    await memberStore.createMember({ email: 'notact@test.com', name: 'NotAct' });
    const res = await request(app).post('/api/auth/login').send({ email: 'notact@test.com', password: 'any' });
    expect(res.status).toBe(403);
  });
});

// --- Member routes ---
describe('GET /api/member/me', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/member/me');
    expect(res.status).toBe(401);
  });

  test('returns profile with valid token', async () => {
    const m = await memberStore.createMember({ email: 'me@test.com', name: 'Me' });
    const token = signToken({ memberId: m.memberId, email: m.email });
    const res = await request(app).get('/api/member/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me@test.com');
  });
});

describe('GET /api/member/registrations', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/member/registrations');
    expect(res.status).toBe(401);
  });

  test('returns array with valid token', async () => {
    const m = await memberStore.createMember({ email: 'reg@test.com', name: 'Reg' });
    const token = signToken({ memberId: m.memberId, email: m.email });
    const res = await request(app).get('/api/member/registrations').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
