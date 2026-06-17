'use strict';

const axios = require('axios');
const https = require('https');
const crypto = require('crypto');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class Jar {
  constructor() { this._m = new Map(); }
  ingest(raw) {
    for (const r of [].concat(raw)) {
      if (!r) continue;
      const [nv] = r.split(';');
      const i = nv.indexOf('=');
      if (i < 0) continue;
      this._m.set(nv.slice(0, i).trim(), nv.slice(i + 1).trim());
    }
  }
  str() { return [...this._m].map(([k, v]) => `${k}=${v}`).join('; '); }
}

function baseHeaders(jar, extra = {}) {
  return {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://chat.chatex.ai/en',
    'Origin': 'https://chat.chatex.ai',
    'Cookie': jar.str(),
    'sentry-trace': `${crypto.randomBytes(16).toString('hex')}-${crypto.randomBytes(8).toString('hex')}-0`,
    ...extra,
  };
}

function ssePost(jar, body) {
  return new Promise((resolve, reject) => {
    const events = [];
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: 'chat.chatex.ai',
      path: '/api/chat',
      method: 'POST',
      headers: {
        ...baseHeaders(jar),
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    }, res => {
      let buf = '';
      res.on('data', chunk => {
        buf += chunk.toString();
        const lines = buf.split('\n'); buf = lines.pop();
        for (const l of lines) {
          if (!l.startsWith('data: ')) continue;
          const p = l.slice(6).trim();
          if (p === '[DONE]') continue;
          try { events.push(JSON.parse(p)); } catch (_) {}
        }
      });
      res.on('end', () => resolve({ headers: res.headers, events }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(60000, () => req.destroy(new Error('SSE timeout')));
    req.write(payload);
    req.end();
  });
}

function parseSSE(events) {
  let text = '', model = null, usage = null, finishReason = null;
  for (const ev of events) {
    if (ev.type === 'text-delta') text += ev.delta;
    if (ev.type === 'data-usage') { usage = ev.data; model = ev.data?.modelId; }
    if (ev.type === 'finish') finishReason = ev.finishReason;
  }
  return { text, model, usage, finishReason };
}

async function chatex(message, model = 'openai/gpt-5.4') {
  const jar = new Jar();
  const chatId = crypto.randomUUID();
  const messageId = crypto.randomUUID();

  const init = await axios.get('https://chat.chatex.ai/en', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', Accept: 'text/html' },
    validateStatus: () => true,
  });
  if (init.headers['set-cookie']) jar.ingest(init.headers['set-cookie']);
  await sleep(200);

  await axios.post('https://chat.chatex.ai/api/v/fingerprint', {
    fpid: crypto.randomBytes(16).toString('hex'),
    confidence: 0.4,
    version: '5.0.1',
  }, {
    headers: baseHeaders(jar),
    validateStatus: () => true,
  }).then(r => { if (r.headers['set-cookie']) jar.ingest(r.headers['set-cookie']); });
  await sleep(300);

  const chatRes = await ssePost(jar, {
    id: chatId,
    message: { role: 'user', parts: [{ type: 'text', text: message }], id: messageId },
    selectedChatModel: model,
    selectedVisibilityType: 'private',
    webSearchEnabled: false,
    imageGenerationEnabled: false,
    isExistingChat: false,
  });
  if (chatRes.headers['set-cookie']) jar.ingest(chatRes.headers['set-cookie']);

  return parseSSE(chatRes.events);
}

module.exports = { chatex };