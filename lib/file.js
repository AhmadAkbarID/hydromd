const fs = require('fs');
const path = require('path');
const axios = require('axios');

if (!fs.existsSync('./media')) fs.mkdirSync('./media', { recursive: true });
if (!fs.existsSync('./media/font')) fs.mkdirSync('./media/font', { recursive: true });

async function autoDownload(url, dest) {
    const exists = fs.existsSync(dest);
    const size   = exists ? fs.statSync(dest).size : 0;
    if (exists && size > 0) return;
    try {
        const response = await axios({ method: 'get', url: url, responseType: 'stream' });
        const writer = fs.createWriteStream(dest);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (err) {
    }
}

async function downloadAllAssets() {
    const assets = [
        { url: 'https://docs.google.com/uc?export=download&id=18FU1XK9NhrRXWMIpz3XT8tdeDqFAX-fX', dest: './media/font/NotoColorEmoji.ttf' },
        { url: 'https://raw.githubusercontent.com/AhmadAkbarID/media/refs/heads/main/ba-font1.otf', dest: './media/font/ba-font1.otf' },
        { url: 'https://raw.githubusercontent.com/AhmadAkbarID/media/refs/heads/main/ba-font2.otf', dest: './media/font/ba-font2.otf' },
        { url: 'https://raw.githubusercontent.com/AhmadAkbarID/media/refs/heads/main/ba-img1.png', dest: './media/ba-img1.png' },
        { url: 'https://raw.githubusercontent.com/AhmadAkbarID/media/refs/heads/main/ba-img2.png', dest: './media/ba-img2.png' },
        { url: 'https://github.com/AhmadAkbarID/media/raw/refs/heads/main/menuvid.mp4', dest: './media/menuvid.mp4' },
        { url: 'https://github.com/AhmadAkbarID/media/raw/refs/heads/main/menu.jpg', dest: './media/menu.jpg' },
        { url: 'https://github.com/AhmadAkbarID/media/raw/refs/heads/main/menu.mp3', dest: './media/menu.mp3' },
    ];

    await Promise.all(assets.map(asset => autoDownload(asset.url, asset.dest)));
}

module.exports = { downloadAllAssets };