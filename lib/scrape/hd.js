const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const crypto = require('crypto');

async function getToken() {
    try {
        const html = await axios.get('https://www.iloveimg.com/upscale-image');
        const $ = cheerio.load(html.data);
        const script = $('script')
            .filter((i, el) => $(el).html().includes('ilovepdfConfig ='))
            .html();
        const jsonS = script.split('ilovepdfConfig = ')[1].split(';')[0];
        const json = JSON.parse(jsonS);
        const csrf = $('meta[name="csrf-token"]').attr('content');
        return { token: json.token, csrf };
    } catch (err) {
        throw new Error('Error: ' + err.message);
    }
}

async function uploadImage(server, headers, buffer, task) {
    const form = new FormData();
    form.append('name', 'image.jpg');
    form.append('chunk', '0');
    form.append('chunks', '1');
    form.append('task', task);
    form.append('preview', '1');
    form.append('file', buffer, 'image.jpg');

    const res = await axios.post(`https://${server}.iloveimg.com/v1/upload`, form, {
        headers: {
            ...headers,
            ...form.getHeaders(),
        },
    });

    return res.data;
}

async function hdr(buffer, scale = 4) {
    const { token, csrf } = await getToken();
    const servers = [
        'api1g', 'api2g', 'api3g', 'api8g', 'api9g', 'api10g', 'api11g', 'api12g',
        'api13g', 'api14g', 'api15g', 'api16g', 'api17g', 'api18g', 'api19g',
        'api20g', 'api21g', 'api22g', 'api24g', 'api25g'
    ];
    const server = servers[Math.floor(Math.random() * servers.length)];

    const task = 'r68zl88mq72xq94j2d5p66bn2z9lrbx20njsbw2qsAvgmzr11lvfhAx9kl87pp6yqgx7c8vg7sfbqnrr42qb16v0gj8jl5s0kq1kgp26mdyjjspd8c5A2wk8b4Adbm6vf5tpwbqlqdr8A9tfn7vbqvy28ylphlxdl379psxpd8r70nzs3sk1';

    const headers = {
        'Authorization': 'Bearer ' + token,
        'Origin': 'https://www.iloveimg.com/',
        'Cookie': '_csrf=' + csrf,
        'User-Agent': 'Mozilla/5.0',
    };

    const upload = await uploadImage(server, headers, buffer, task);

    const form = new FormData();
    form.append('task', task);
    form.append('server_filename', upload.server_filename);
    form.append('scale', scale);

    const res = await axios.post(`https://${server}.iloveimg.com/v1/upscale`, form, {
        headers: {
            ...headers,
            ...form.getHeaders(),
        },
        responseType: 'arraybuffer',
    });

    return res.data;
}
async function hdvideo(buffer) {
  try {
    const baseApi = 'https://api.unblurimage.ai';
    const productSerial = crypto.randomUUID().replace(/-/g, '');

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    async function jsonFetch(url, options = {}) {
      const res = await fetch(url, options);
      const text = await res.text();
      let json;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        return { __httpError: true, status: res.status, raw: text };
      }
      if (!res.ok) return { __httpError: true, status: res.status, raw: json };
      return json;
    }

    const uploadForm = new global.FormData();
    uploadForm.set('video_file_name', `cli-${Date.now()}.mp4`);

    const uploadResp = await jsonFetch(`${baseApi}/api/upscaler/v1/ai-video-enhancer/upload-video`, {
      method: 'POST',
      body: uploadForm
    });

    if (uploadResp.__httpError || uploadResp.code !== 100000) throw new Error('Upload gagal');

    const { url: uploadUrl, object_name } = uploadResp.result || {};
    if (!uploadUrl || !object_name) throw new Error('Upload invalid');

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'content-type': 'video/mp4' },
      body: buffer
    });

    if (!putRes.ok) throw new Error('Upload video gagal');

    const cdnUrl = `https://cdn.unblurimage.ai/${object_name}`;

    const jobForm = new global.FormData();
    jobForm.set('original_video_file', cdnUrl);
    jobForm.set('resolution', '2k');
    jobForm.set('is_preview', 'false');

    const createJobResp = await jsonFetch(`${baseApi}/api/upscaler/v2/ai-video-enhancer/create-job`, {
      method: 'POST',
      body: jobForm,
      headers: {
        'product-serial': productSerial,
        authorization: ''
      }
    });

    if (createJobResp.__httpError || createJobResp.code !== 100000) throw new Error('Create job gagal');

    const { job_id } = createJobResp.result || {};
    if (!job_id) throw new Error('Job tidak valid');

    const startTime = Date.now();
    let attempt = 0;
    let result;

    while (true) {
      attempt++;
      const jobResp = await jsonFetch(`${baseApi}/api/upscaler/v2/ai-video-enhancer/get-job/${job_id}`, {
        method: 'GET',
        headers: {
          'product-serial': productSerial,
          authorization: ''
        }
      });

      if (jobResp.__httpError) throw new Error('Get job gagal');

      if (jobResp.code === 100000) {
        result = jobResp.result || {};
        if (result.output_url) break;
      }

      if (Date.now() - startTime > 600000) throw new Error('Timeout proses (Lebih dari 10 Menit)'); 
      await sleep(attempt === 1 ? 20000 : 10000);
    }

    return result.output_url;
  } catch (e) {
    throw e;
  }
}

module.exports = { hdr, hdvideo };