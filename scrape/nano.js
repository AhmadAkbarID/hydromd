const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const sleep = ms => new Promise(r => setTimeout(r, ms));

function genserial() {
  let s = '';
  for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

async function nanoEditV1(imageBuffer, prompt) {
  const tempPath = path.join(process.cwd(), `temp_v1_${Date.now()}.jpg`);
  fs.writeFileSync(tempPath, imageBuffer);
  try {
    const filename = path.basename(tempPath);
    const form = new FormData();
    form.append('file_name', filename);
    const upRes = await axios.post('https://api.imgupscaler.ai/api/common/upload/upload-image', form, {
      headers: { ...form.getHeaders(), origin: 'https://imgupscaler.ai', referer: 'https://imgupscaler.ai/' }
    });
    const uploadData = upRes.data.result;
    const fileContent = fs.readFileSync(tempPath);
    await axios.put(uploadData.url, fileContent, {
      headers: { 'Content-Type': 'image/jpeg', 'Content-Length': fileContent.length },
      maxBodyLength: Infinity
    });
    const cdnUrl = 'https://cdn.imgupscaler.ai/' + uploadData.object_name;
    const jobForm = new FormData();
    jobForm.append('model_name', 'magiceraser_v4');
    jobForm.append('original_image_url', cdnUrl);
    jobForm.append('prompt', prompt);
    jobForm.append('ratio', 'match_input_image');
    jobForm.append('output_format', 'jpg');
    const jobRes = await axios.post('https://api.magiceraser.org/api/magiceraser/v2/image-editor/create-job', jobForm, {
      headers: {
        ...jobForm.getHeaders(),
        'product-code': 'magiceraser',
        'product-serial': genserial(),
        origin: 'https://imgupscaler.ai',
        referer: 'https://imgupscaler.ai/'
      }
    });
    const jobId = jobRes.data.result.job_id;
    let result;
    while (true) {
      await sleep(3000);
      const checkRes = await axios.get(`https://api.magiceraser.org/api/magiceraser/v1/ai-remove/get-job/${jobId}`, {
        headers: { origin: 'https://imgupscaler.ai', referer: 'https://imgupscaler.ai/' }
      });
      result = checkRes.data;
      if (result.code !== 300006) break;
    }
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return result.result.output_url[0];
  } catch (e) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    throw e;
  }
}

async function nanoEditV2(buffer, prompt) {
  const headers = { 'Product-Code': '067003', 'Product-Serial': 'vj6o8n' };
  const form = new FormData();
  form.append('model_name', 'seedream');
  form.append('edit_type', 'style_transfer');
  form.append('prompt', prompt);
  form.append('target_images', Readable.from(buffer), { filename: 'input.jpg', contentType: 'image/jpeg' });
  const { data } = await axios.post('https://api.photoeditorai.io/pe/photo-editor/create-job', form, {
    headers: { ...form.getHeaders(), ...headers }
  });
  const jobId = data.result.job_id;
  while (true) {
    const { data: statusData } = await axios.get(`https://api.photoeditorai.io/pe/photo-editor/get-job/${jobId}`, { headers });
    if (statusData.result.status === 2 && statusData.result.output?.length) return statusData.result.output[0];
    await sleep(2500);
  }
}

async function nanoEdit(inputBuffer, prompt) {
  try {
    return await nanoEditV1(inputBuffer, prompt);
  } catch (e) {
    try {
      return await nanoEditV2(inputBuffer, prompt);
    } catch (err2) {
      throw new Error("Failed");
    }
  }
}

module.exports = { nanoEdit };