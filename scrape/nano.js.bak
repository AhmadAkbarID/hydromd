const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream');

const headers = {
  'Product-Code': '067003',
  'Product-Serial': 'vj6o8n'
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function createJob(buffer, prompt) {
  const form = new FormData();
  form.append('model_name', 'seedream');
  form.append('edit_type', 'style_transfer');
  form.append('prompt', prompt);
  form.append('target_images', Readable.from(buffer), {
    filename: 'input.jpg',
    contentType: 'image/jpeg'
  });

  const { data } = await axios.post(
    'https://api.photoeditorai.io/pe/photo-editor/create-job',
    form,
    { headers: { ...form.getHeaders(), ...headers } }
  );

  return data.result.job_id;
}

async function getResult(jobId) {
  while (true) {
    const { data } = await axios.get(
      `https://api.photoeditorai.io/pe/photo-editor/get-job/${jobId}`,
      { headers }
    );
    if (data.result.status === 2 && data.result.output?.length) {
      return data.result.output[0];
    }
    await sleep(2500);
  }
}

async function upload(buffer) {
  const form = new FormData();
  form.append('file', Readable.from(buffer), {
    filename: 'result.jpg',
    contentType: 'image/jpeg'
  });

  const { data } = await axios.post(
    'https://server-jees2.vercel.app/upload',
    form,
    { headers: form.getHeaders() }
  );

  return data.url;
}

const nanoEdit = async (buffer, prompt) => {
  const jobId = await createJob(buffer, prompt);
  const resultUrl = await getResult(jobId);

  const imgBuffer = Buffer.from(
    (await axios.get(resultUrl, { responseType: 'arraybuffer' })).data
  );

  const finalUrl = await upload(imgBuffer);
  return finalUrl;
};

module.exports = { nanoEdit };