'use strict';

const { messagingApi } = require('@line/bot-sdk');

async function sendLineMulticast(userIds, messages) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;

  const valid = userIds.filter((id) => typeof id === 'string' && id.startsWith('U') && id.length >= 10);
  if (valid.length === 0) return;

  const client = new messagingApi.MessagingApiClient({ channelAccessToken: token });
  const BATCH = 500;
  for (let i = 0; i < valid.length; i += BATCH) {
    const batch = valid.slice(i, i + BATCH);
    try {
      await client.multicast({ to: batch, messages });
    } catch (err) {
      console.error(`sendLineMulticast batch ${Math.floor(i / BATCH) + 1} failed:`, err.message);
    }
  }
}

module.exports = { sendLineMulticast };
