'use strict';

const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendSetPasswordEmail(toEmail, token) {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const link = `${clientOrigin}/set-password?token=${token}`;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"活動報名系統" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '設定您的會員密碼',
    html: `
      <h2>歡迎加入！</h2>
      <p>您的報名已成功，同時已為您建立會員帳號。</p>
      <p>請點擊以下連結設定密碼（24 小時內有效）：</p>
      <p><a href="${link}" style="color:#4f46e5;font-weight:bold;">設定密碼</a></p>
      <p style="color:#9ca3af;font-size:12px;">若非本人操作，請忽略此信件。</p>
    `,
  });
}

async function sendResetPasswordEmail(toEmail, token) {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const link = `${clientOrigin}/set-password?token=${token}`;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"活動報名系統" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '重設您的會員密碼',
    html: `
      <h2>密碼重設申請</h2>
      <p>我們收到您的密碼重設請求。</p>
      <p>請點擊以下連結重設密碼（24 小時內有效）：</p>
      <p><a href="${link}" style="color:#4f46e5;font-weight:bold;">重設密碼</a></p>
      <p style="color:#9ca3af;font-size:12px;">若非本人操作，請忽略此信件，您的密碼不會有任何變動。</p>
    `,
  });
}

async function sendRegistrationConfirmationEmail(toEmail, { name, eventTitle, eventDate, eventLocation, company, memberNumber }) {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"活動報名系統" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `【報名成功】${eventTitle || '活動'} 報名確認通知`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#4f46e5;margin-bottom:0.5rem;">報名成功！</h2>
        <p style="color:#374151;">親愛的 <strong>${name}</strong>，感謝您的報名，以下是您的報名資訊：</p>
        <table style="width:100%;border-collapse:collapse;margin:1rem 0;">
          <tr><td style="padding:0.4rem 0.6rem;color:#6b7280;width:35%;">活動名稱</td><td style="padding:0.4rem 0.6rem;font-weight:600;">${eventTitle || '—'}</td></tr>
          ${eventDate ? `<tr><td style="padding:0.4rem 0.6rem;color:#6b7280;">活動日期</td><td style="padding:0.4rem 0.6rem;">${eventDate}</td></tr>` : ''}
          ${eventLocation ? `<tr><td style="padding:0.4rem 0.6rem;color:#6b7280;">活動地點</td><td style="padding:0.4rem 0.6rem;">${eventLocation}</td></tr>` : ''}
          ${company ? `<tr><td style="padding:0.4rem 0.6rem;color:#6b7280;">公司 / 單位</td><td style="padding:0.4rem 0.6rem;">${company}</td></tr>` : ''}
          <tr><td style="padding:0.4rem 0.6rem;color:#6b7280;">會員編號</td><td style="padding:0.4rem 0.6rem;font-weight:600;color:#4f46e5;">${memberNumber || '—'}</td></tr>
        </table>
        <p style="color:#374151;">您可登入會員頁面查看報到 QR Code：</p>
        <p><a href="${clientOrigin}/member" style="display:inline-block;padding:0.6rem 1.4rem;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">前往會員頁面</a></p>
        <p style="color:#9ca3af;font-size:12px;margin-top:1.5rem;">若有任何問題請聯絡主辦單位。</p>
      </div>
    `,
  });
}

async function sendOrganizerNotificationEmail({ name, email, phone, company, lineId, memberNumber, eventTitle }) {
  const organizerEmail = process.env.ORGANIZER_EMAIL;
  if (!organizerEmail) return;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"活動報名系統" <${process.env.EMAIL_USER}>`,
    to: organizerEmail,
    subject: `【新報名通知】${name} 已完成報名`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#4f46e5;margin-bottom:0.5rem;">有新會員完成報名</h2>
        <p style="color:#374151;">活動：<strong>${eventTitle || '—'}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin:1rem 0;">
          <tr style="background:#f5f3ff;"><td style="padding:0.4rem 0.6rem;color:#6b7280;width:35%;">姓名</td><td style="padding:0.4rem 0.6rem;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:0.4rem 0.6rem;color:#6b7280;">Email</td><td style="padding:0.4rem 0.6rem;">${email}</td></tr>
          <tr style="background:#f5f3ff;"><td style="padding:0.4rem 0.6rem;color:#6b7280;">電話</td><td style="padding:0.4rem 0.6rem;">${phone}</td></tr>
          ${company ? `<tr><td style="padding:0.4rem 0.6rem;color:#6b7280;">公司 / 單位</td><td style="padding:0.4rem 0.6rem;">${company}</td></tr>` : ''}
          ${lineId ? `<tr style="background:#f5f3ff;"><td style="padding:0.4rem 0.6rem;color:#6b7280;">LINE ID</td><td style="padding:0.4rem 0.6rem;">${lineId}</td></tr>` : ''}
          <tr><td style="padding:0.4rem 0.6rem;color:#6b7280;">會員編號</td><td style="padding:0.4rem 0.6rem;font-weight:600;color:#4f46e5;">${memberNumber || '—'}</td></tr>
        </table>
        <p style="color:#9ca3af;font-size:12px;">此信件由報名系統自動發送。</p>
      </div>
    `,
  });
}

async function sendEventCancelNotificationEmail(toEmail, { eventTitle, message }) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"活動報名系統" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `【活動取消通知】${eventTitle || '活動'}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem;border:1px solid #fca5a5;border-radius:12px;">
        <h2 style="color:#dc2626;margin-bottom:0.5rem;">活動取消通知</h2>
        <p style="color:#374151;">感謝您報名參加 <strong>${eventTitle || '本次活動'}</strong>。</p>
        <div style="margin:1rem 0;padding:1rem;background:#fff5f5;border-left:4px solid #dc2626;border-radius:6px;">
          <p style="color:#374151;margin:0;line-height:1.7;">${message}</p>
        </div>
        <p style="color:#6b7280;font-size:0.85rem;">如有任何疑問，請聯絡主辦單位。</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:1.5rem;">此信件由報名系統自動發送。</p>
      </div>
    `,
  });
}

async function sendEventChangeNotificationEmail(toEmail, { eventTitle, message }) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"活動報名系統" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `【活動資訊更新】${eventTitle || '活動'}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem;border:1px solid #fde68a;border-radius:12px;">
        <h2 style="color:#d97706;margin-bottom:0.5rem;">活動資訊更新通知</h2>
        <p style="color:#374151;">您報名的 <strong>${eventTitle || '活動'}</strong> 有以下資訊更新：</p>
        <div style="margin:1rem 0;padding:1rem;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:6px;">
          <p style="color:#374151;margin:0;line-height:1.7;">${message}</p>
        </div>
        <p style="color:#6b7280;font-size:0.85rem;">如有任何疑問，請聯絡主辦單位。</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:1.5rem;">此信件由報名系統自動發送。</p>
      </div>
    `,
  });
}

module.exports = { sendSetPasswordEmail, sendResetPasswordEmail, sendRegistrationConfirmationEmail, sendOrganizerNotificationEmail, sendEventCancelNotificationEmail, sendEventChangeNotificationEmail };
