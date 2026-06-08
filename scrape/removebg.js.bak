const axios = require('axios');
const FormData = require('form-data');

async function removeBg(buffer) {
    try {
        const form = new FormData();
        form.append('file', buffer, {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });

        const { data } = await axios.post(
            'https://removebg.one/api/predict/v2',
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10)',
                    accept: 'application/json, text/plain, */*',
                    'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
                    platform: 'PC',
                    'sec-ch-ua-platform': '"Android"',
                    origin: 'https://removebg.one',
                    referer: 'https://removebg.one/upload'
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            }
        );

        return data?.data?.cutoutUrl || null;
    } catch {
        return null;
    }
}

module.exports = { removeBg };