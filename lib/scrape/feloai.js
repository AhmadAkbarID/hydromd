'use strict';

const https = require('https');
const crypto = require('crypto');

const BASE_URL = 'https://felo.ai';
const ACCOUNT_URL = 'https://account.felo.ai';
const API_URL = 'https://api.felo.ai';

class FeloError extends Error {
  constructor(message, code = 'UNKNOWN', data = null) {
    super(message);
    this.name = 'FeloError';
    this.code = code;
    this.data = data;
  }
}

function request(method, baseUrl, urlPath, { body, headers: extra = {} } = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(urlPath, baseUrl);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/137.0.0.0 Mobile Safari/537.36',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...extra,
      },
      timeout: 30000,
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let parsed;
        try { parsed = JSON.parse(raw); } catch { return resolve({ raw }); }
        if (res.statusCode >= 400) {
          return reject(new FeloError(
            parsed?.detail?.message || parsed?.message || `HTTP ${res.statusCode}`,
            parsed?.detail?.error_type || `HTTP_${res.statusCode}`,
            parsed
          ));
        }
        resolve(parsed);
      });
      res.on('error', reject);
    });
    req.on('error', err => reject(new FeloError(err.message, err.code)));
    req.on('timeout', () => { req.destroy(); reject(new FeloError('Request timeout', 'TIMEOUT')); });
    if (data) req.write(data);
    req.end();
  });
}

function sseRequest(urlPath, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(urlPath, BASE_URL);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/137.0.0.0 Mobile Safari/537.36',
        'Referer': `${BASE_URL}/`,
        'Origin': BASE_URL,
        ...extraHeaders,
      },
      timeout: 60000,
    }, res => {
      if (res.statusCode >= 400) return reject(new FeloError(`HTTP ${res.statusCode}`, `HTTP_${res.statusCode}`));
      resolve(res);
    });
    req.on('error', err => reject(new FeloError(err.message, err.code)));
    req.on('timeout', () => { req.destroy(); reject(new FeloError('Request timeout', 'TIMEOUT')); });
    req.write(data);
    req.end();
  });
}

function parseSSEStream(stream) {
  return new Promise((resolve, reject) => {
    let buf = '';
    let answer = '';
    let prev = '';
    let sources = [];

    function processLine(line) {
      if (!line.startsWith('data:')) return;
      const raw = line.slice(5).trim();
      if (!raw || raw === '[DONE]') return;
      try {
        const ev = JSON.parse(raw);

        if (ev?.type === 'answer' && ev?.data?.text) {
          const full = ev.data.text;
          answer = full;
          prev = full;
        }

        if (ev?.type === 'search_result' && Array.isArray(ev?.data?.results)) {
          sources = ev.data.results.map(r => ({ title: r.title, url: r.url }));
        }
      } catch {}
    }

    stream.on('data', chunk => {
      buf += chunk.toString('utf8');
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) processLine(line.trim());
    });

    stream.on('end', () => {
      if (buf.trim()) processLine(buf.trim());
      resolve({ answer, sources });
    });

    stream.on('error', err => reject(new FeloError(err.message, 'STREAM_ERROR')));
  });
}

class FeloClient {
  constructor() {
    this._token = null;
    this._deviceId = crypto.randomBytes(16).toString('hex');
    this._visitor = crypto.randomUUID();
  }

  async login(email, password) {
    const res = await request('POST', ACCOUNT_URL, '/api/user/sign.in', {
      body: { email, password, app_id: 'glaritySearch', client_type: 'WEB', device_id: this._deviceId, invitation_code: '' }
    });
    if (res?.status !== 200) throw new FeloError('Login gagal: ' + JSON.stringify(res), 'AUTH_FAILED');
    this._token = res.data.token.token_value;
    return { ok: true, token: this._token };
  }

  async logout() {
    if (!this._token) return;
    await request('POST', ACCOUNT_URL, '/api/user/sign.out', {
      headers: { Authorization: this._token }
    }).catch(() => {});
    this._token = null;
  }

  async search(query, { lang = 'id', mode = 'concise', onChunk } = {}) {
    const authHeaders = this._token
      ? { Authorization: `Bearer ${this._token}` }
      : { Cookie: `visitor=${this._visitor}` };

    const stream = await sseRequest('/api/search/threads', {
      query,
      search_uuid: crypto.randomUUID(),
      visitor: this._visitor,
      lang: '',
      agent_lang: lang,
      search_options: { langcode: lang },
      search_video: true,
      mode,
    }, authHeaders);

    let prev = '';
    const result = await new Promise((resolve, reject) => {
      let buf = '';
      let answer = '';
      let sources = [];

      function processLine(line) {
        if (!line.startsWith('data:')) return;
        const raw = line.slice(5).trim();
        if (!raw || raw === '[DONE]') return;
        try {
          const ev = JSON.parse(raw);
          if (ev?.type === 'answer' && ev?.data?.text) {
            const full = ev.data.text;
            const chunk = full.slice(prev.length);
            if (chunk && onChunk) onChunk(chunk);
            prev = full;
            answer = full;
          }
          if (ev?.type === 'search_result' && Array.isArray(ev?.data?.results)) {
            sources = ev.data.results.map(r => ({ title: r.title, url: r.url }));
          }
        } catch {}
      }

      stream.on('data', chunk => {
        buf += chunk.toString('utf8');
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) processLine(line.trim());
      });
      stream.on('end', () => {
        if (buf.trim()) processLine(buf.trim());
        resolve({ answer, sources });
      });
      stream.on('error', err => reject(new FeloError(err.message, 'STREAM_ERROR')));
    });

    return result;
  }
}

module.exports = { FeloClient, FeloError };