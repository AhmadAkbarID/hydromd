const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const axios = require('axios');
const https = require('https');
const chalk = require('chalk');
const fetch = require('node-fetch');
const { sizeFormatter } = require('human-readable');
const { exec, spawn, execSync } = require('child_process');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia, areJidsSameUser, extractMessageContent, downloadContentFromMessage, getContentType, getDevice } = require('socketon');
const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
const { createClient } = require('@supabase/supabase-js');

const supaurl = 'https://uzyzpgujphlmesbmcwca.supabase.co';
const supakey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eXpwZ3VqcGhsbWVzYm1jd2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNjQwMjcsImV4cCI6MjA3MDY0MDAyN30.SwjgDAcEDLvjmzKzxHPdtHdjLbH1Zsr20MbPI4s6F94';

const supabase = createClient(supaurl, supakey);

const errorCache = {};

const unsafeAgent = new https.Agent({
    rejectUnauthorized: false
});

const axiosss = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: false }),
});

const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

const getBuffer = async (url, options = {}) => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            responseType: 'arraybuffer',
            httpsAgent: unsafeAgent,
            ...options
        })
        return data
    } catch (e) {
        try {
            const res = await fetch(url, { agent: unsafeAgent });
            const anu = await res.buffer()
            return anu
        } catch (e) {
            return e
        }
    }
}

const fetchJson = async (url, options = {}) => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            httpsAgent: unsafeAgent,
            ...options
        })
        return data
    } catch (e) {
        try {
            const res = await fetch(url, { agent: unsafeAgent });
            const anu = await res.json()
            return anu
        } catch (e) {
            return e
        }
    }
}

const runtime = function(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

const clockString = (ms) => {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

const formatDate = (n, locale = 'id') => {
    let d = new Date(n)
    return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    })
}

const formatp = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
});

const generateProfilePicture = async (buffer, size) => {
    let cropped;
    const jimp = await Jimp.read(buffer)
    const w = jimp.getWidth()
    const h = jimp.getHeight()
    if (size) {
        const min = Math.min(w, h)
        const x = (w - min) / 2
        const y = (h - min) / 2
        cropped = jimp.crop(x, y, min, min).resize(size, size)
    } else cropped = jimp.crop(0, 0, w, h)
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
    }
}

const bytesToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const normalize = s => s.replace(/\s+/g, '').split('').sort().join('');

const getSizeMedia = async (path) => {
    return new Promise((resolve, reject) => {
        if (typeof path === 'string' && /http/.test(path)) {
            axios.get(path).then((res) => {
                let length = parseInt(res.headers['content-length'])
                if(!isNaN(length)) resolve(bytesToSize(length, 3))
            })
        } else if (Buffer.isBuffer(path)) {
            let length = Buffer.byteLength(path)
            if(!isNaN(length)) resolve(bytesToSize(length, 3))
        } else {
            reject(0)
        }
    })
}

async function updateSettings({ filePath, owner, author, apikey, botname, packname }) {
  return new Promise((resolve, reject) => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      if (owner) content = content.replace(/global\.owner\s*=\s*\[[^\]]*\]/, `global.owner = ${JSON.stringify(owner)}`);
      if (author) content = content.replace(/global\.author\s*=\s*['"`].*?['"`]/, `global.author = '${author}'`);
      if (apikey) content = content.replace(/(global\.APIKeys\s*=\s*\{[\s\S]*?'\https:\/\/api\.naze\.biz\.id'\s*:\s*')[^']*(')/, `$1${apikey}$2`);
      if (botname) content = content.replace(/global\.botname\s*=\s*['"`].*?['"`]/, `global.botname = '${botname}'`);
      if (packname) content = content.replace(/global\.packname\s*=\s*['"`].*?['"`]/, `global.packname = '${packname}'`);
      fs.writeFileSync(filePath, content);
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

const parseMention = (text = '') => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

function fixBytes(obj) {
    if (obj instanceof Uint8Array || Buffer.isBuffer(obj)) return obj
    if (typeof obj !== 'object') return obj
    return Uint8Array.from(Object.values(obj))
}

function levenshtein(a, b) {
    const m = a.length, n = b.length
    if (m === 0) return n
    if (n === 0) return m
    let dp = Array.from({ length: m+1 }, () => Array(n+1).fill(0))
    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            let cost = a[i - 1] === b[j - 1] ? 0 : 1
            dp[i][j] = Math.min(dp[i - 1][j]+1, dp[i][j - 1]+1, dp[i - 1][j - 1]+cost)
        }
    }
    return dp[m][n]
}

function similarity(a, b) {
    let m_length = Math.max(a.length, b.length)
    if (m_length === 0) return 1
    return (m_length - levenshtein(a, b)) / m_length
}

function assertInstalled(cmd, name, code) {
    try {
        execSync(cmd, { stdio: 'ignore' });
    } catch (e) {
        console.error(chalk.redBright(`❌  ${name} is not installed or not in PATH.`) +`\nPlease install it first and run the script again.\n`);
        process.exit(code);
    }
}

function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())]
}

function tarBackup(source, output) {
    return new Promise((resolve, reject) => {
        exec(`tar -czf ${output} --exclude=${output} --exclude='./node_modules' ${source}`, (err, stdout, stderr) => {
            if (err) return reject(err);
            resolve(output);
        })
    })
}

async function listbut2(hydro, m, teks, listnye) {
    let isVideo = false;
    let thumbPath = global.thumbnail || 'https://telegra.ph/file/default.jpg';
    
    if (thumbPath.match(/\.(mp4|gif)$/i)) {
        isVideo = true;
    }

    let mediaObj;
    try {
        if (thumbPath.startsWith('http')) {
            mediaObj = isVideo ? { video: { url: thumbPath }, gifPlayback: true } : { image: { url: thumbPath } };
        } else {
            let fileBuffer = fs.readFileSync(thumbPath);
            mediaObj = isVideo ? { video: fileBuffer, gifPlayback: true } : { image: fileBuffer };
        }
    } catch (e) {
        let fallbackUrl = isVideo ? 'https://raw.githubusercontent.com/AhmadAkbarID/media/refs/heads/main/menuvid.mp4' : 'https://telegra.ph/file/default.jpg';
        mediaObj = isVideo ? { video: { url: fallbackUrl }, gifPlayback: true } : { image: { url: fallbackUrl } };
    }

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                "messageContextInfo": {
                    "deviceListMetadata": {},
                    "deviceListMetadataVersion": 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 99,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.channel || '',
                            newsletterName: global.channeln || '',
                            serverMessageId: 1
                        }
                    },
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: teks
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: `By ${global.ownername}`
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: ``,
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia(
                            mediaObj, 
                            { upload: hydro.waUploadToServer }
                        )),
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            "name": "single_select",
                            "buttonParamsJson": JSON.stringify(listnye)
                        }],
                    }), 
                })
            }
        }
    }, { quoted: m });

    await hydro.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id
    });
}

const getMenuList = (prefix) => {
    let p = prefix || ''; 

    return {
        title: "ʟɪsᴛ ᴍᴇɴᴜ",
        sections: [
            {
                title: `List menu yang sering dipakai`, 
                highlight_label: `Populer`,
                rows: [
                    { title: "sᴇᴍᴜᴀ ғɪᴛᴜʀ", description: "📌 ᴍᴇᴍᴜɴᴄᴜʟᴋᴀɴ sᴇᴍᴜᴀ ғɪᴛᴜʀ ʏᴀɴɢ ᴛᴇʀsᴇᴅɪᴀ", id: `${p}allmenu` }
                ]
            },
            {
                title: `ᴍᴇɴᴜ ʏᴀɴɢ ᴅɪᴘɪsᴀʜᴋᴀɴ`, 
                highlight_label: ``,
                rows: [
                    { title: "ғɪᴛᴜʀ ᴘᴇᴍɪʟɪᴋ", description: "👑 ᴍᴇᴍᴜɴᴄᴜʟᴋᴀɴ ғɪᴛᴜʀ ᴘᴇᴍɪʟɪᴋ", id: `${p}ownermenu` },
                    { title: "ғɪᴛᴜʀ ɢʀᴏᴜᴘ", description: "👥 ᴍᴇᴍᴜɴᴄᴜʟᴋᴀɴ ғɪᴛᴜʀ ɢʀᴏᴜᴘ", id: `${p}groupmenu` },
                    { title: "ғɪᴛᴜʀ ꜱᴇᴀʀᴄʜ", description: "🔍 ᴍᴇᴍᴜɴᴄᴜʟᴋᴀɴ ғɪᴛᴜʀ ᴘᴇɴᴄᴀʀɪᴀɴ", id: `${p}searchmenu` },
                    { title: "ғɪᴛᴜʀ ᴜᴛɪʟɪᴛʏ", description: "⚙️ ᴍᴇᴍᴜɴᴄᴜʟᴋᴀɴ ғɪᴛᴜʀ ᴜᴛɪʟɪᴛʏ", id: `${p}utilitymenu` },
                    { title: "ғɪᴛᴜʀ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ", description: "📥 ᴍᴇᴍᴜɴᴄᴜʟᴋᴀɴ ғɪᴛᴜʀ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ", id: `${p}downloadmenu` },
                    { title: "ғɪᴛᴜʀ ᴍᴀᴋᴇʀ", description: "⚒️ ᴍᴇᴍᴜɴᴄᴜʟᴋᴀɴ ғɪᴛᴜʀ ᴍᴀᴋᴇʀ", id: `${p}makermenu` },
                    { title: "ғɪᴛᴜʀ ᴄᴏɴᴠᴇʀᴛ", description: "🪄 ᴍᴇᴍᴜɴᴄᴜʟᴋᴀɴ ғɪᴛᴜʀ ᴄᴏɴᴠᴇʀᴛ", id: `${p}convertmenu` },
                    { title: "ғɪᴛᴜʀ ᴀɪ", description: "🤖 ᴍᴇᴍᴜɴᴄ𝕦ʟᴋᴀɴ ғɪᴛᴜʀ ᴀɪ", id: `${p}aimenu` },
                    { title: "ғɪᴛᴜʀ ʟᴀɪɴɴʏᴀ", description: "ℹ️ ᴍᴇᴍᴜɴᴄ𝕦ʟᴋᴀɴ ғɪᴛᴜʀ ʟᴀɪɴɴʏᴀ", id: `${p}othermenu` }
                ]
            },
            {
                title: `ʟᴀɪɴɴʏᴀ`, 
                highlight_label: ``,
                rows: [
                    { title: "sᴄʀɪᴘᴛ", description: "💳 sᴜᴍʙᴇʀ sᴄʀɪᴘᴛ", id: `${p}script` },
                    { title: "ʀᴀᴛɪɴɢ", description: "🌟 ʀᴀᴛɪɴɢ ʙᴏᴛ ɪɴɪ", id: `${p}rating` },
                    { title: "ɪɴғᴏ ʙᴏᴛ", description: "📋 ᴍᴇᴍᴜɴᴄᴜʟᴋᴀɴ ɪɴғᴏʀᴍᴀsɪ ʙᴏᴛ", id: `${p}infobot` }
                ]
            }
        ]
    };
};

const HydroFitur = () => {
    try {
        const fileContent = fs.readFileSync('./hydro.js', 'utf8');
        return (fileContent.match(/case '/g) || []).length;
    } catch (e) {
        return 0;
    }
}

function startSewaChecker(hydro) {
    if (!global.db.sewa) global.db.sewa = {};

    let lastFetchTime = 0;

    setInterval(async () => {
        let now = Date.now();
        let shouldFetchGroups = (now - lastFetchTime) >= 10000;
        let activeGroups = null;

        let hasPending = Object.values(global.db.sewa).some(s => s.status === 'pending');
        
        if (shouldFetchGroups && hasPending) {
            try {
                activeGroups = await hydro.groupFetchAllParticipating();
                lastFetchTime = now;
            } catch (e) {
                activeGroups = null;
            }
        }

        for (let jid in global.db.sewa) {
            let sewa = global.db.sewa[jid];
            
            if (sewa.status === 'active') {
                if (sewa.expired - now <= 86400000 && sewa.expired - now > 0 && !sewa.notified) {
                    try {
                        await hydro.sendMessage(jid, { text: `⚠️ *PEMBERITAHUAN SEWA*\n\nWaktu sewa bot di grup ini akan habis dalam waktu kurang dari 24 jam. Segera hubungi owner untuk memperpanjang sewa agar bot tidak keluar secara otomatis.` });
                        global.db.sewa[jid].notified = true;
                        fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                    } catch (e) {}
                }

                if (now >= sewa.expired) {
                    try {
                        await hydro.sendMessage(jid, { text: `⏰ *WAKTU SEWA HABIS*\n\nTerima kasih telah menyewa bot. Waktu sewa telah berakhir, bot akan keluar dari grup sekarang. Sampai jumpa! 👋` });
                        await hydro.groupLeave(jid);
                    } catch (e) {}
                    delete global.db.sewa[jid];
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                }
            } 
            else if (sewa.status === 'pending') {
                if (activeGroups && activeGroups[jid]) {
                    global.db.sewa[jid].status = 'active';
                    global.db.sewa[jid].expired = Date.now() + global.db.sewa[jid].duration;
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                    
                    try {
                        await hydro.sendMessage(jid, { text: `✅ *BERHASIL BERGABUNG*\n\nAdmin grup telah menyetujui bot. Waktu sewa selama *${sewa.timeStr || '-'}* resmi dimulai dari sekarang.` });
                    } catch (e) {}
                }
                else {
                    if (!sewa.requestTime) {
                        global.db.sewa[jid].requestTime = now;
                        fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                    } 
                    else if (now - sewa.requestTime >= 86400000) { 
                        try {
                            let ownerJid = global.ownernomer + '@s.whatsapp.net';
                            await hydro.sendMessage(ownerJid, { text: `❌ *SEWA DIBATALKAN / DITOLAK*\n\nPermintaan bergabung bot ke grup *${sewa.name}* telah ditolak atau diabaikan oleh admin selama lebih dari 24 jam.\n\nData sewa untuk grup ini telah dihapus otomatis.` });
                        } catch (e) {}
                        
                        delete global.db.sewa[jid];
                        fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                    }
                }
            }
        }
    }, 1000); 
}

function startAutoSholat(hydro) {
    setInterval(async () => {
        if (!global.db || !global.db.groups) return;
        
        const moment = require('moment-timezone');
        const axios = require('axios');
        const fs = require('fs');
        
        let today = new Date();
        let day = today.getDate();
        let month = today.getMonth() + 1;
        let year = today.getFullYear();
        let dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        for (let jid in global.db.groups) {
            let gc = global.db.groups[jid];
            
            let isAutoSholat = gc.autosholat !== undefined ? gc.autosholat : global.autosholat;
            
            if (isAutoSholat) {
                let prov = (gc.jadwalsholat && gc.jadwalsholat.provinsi) ? gc.jadwalsholat.provinsi : 'DKI Jakarta';
                let kota = (gc.jadwalsholat && gc.jadwalsholat.kota) ? gc.jadwalsholat.kota : 'Kota Jakarta Pusat';
                
                let tz = 'Asia/Jakarta';
                let pLower = prov.toLowerCase();
                
                if (pLower.includes('bali') || pLower.includes('nusa') || pLower.includes('kalimantan selatan') || pLower.includes('kalimantan timur') || pLower.includes('kalimantan utara') || pLower.includes('sulawesi')) tz = 'Asia/Makassar';
                if (pLower.includes('maluku') || pLower.includes('papua')) tz = 'Asia/Jayapura';

                let currentTime = moment().tz(tz).format('HH:mm');

                if (!gc.jadwalsholatData || gc.jadwalsholatData.date !== dateStr || gc.jadwalsholatData.kota !== kota) {
                    try {
                        const { data } = await axios.post('https://equran.id/api/v2/shalat', {
                            provinsi: prov,
                            kabkota: kota,
                            bulan: month,
                            tahun: year
                        });

                        if (data && data.code === 200) {
                            let jadwalHariIni = data.data.jadwal.find(j => j.tanggal === day);
                            if (jadwalHariIni) {
                                gc.jadwalsholatData = {
                                    date: dateStr,
                                    kota: kota,
                                    data: jadwalHariIni,
                                    notified: []
                                };
                                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                            }
                        }
                    } catch (e) {
                        continue;
                    }
                }

                if (gc.jadwalsholatData && gc.jadwalsholatData.date === dateStr) {
                    let jadwal = gc.jadwalsholatData.data;
                    let notified = gc.jadwalsholatData.notified || [];
                    
                    let sholatTimes = [
                        { name: 'Subuh', time: jadwal.subuh },
                        { name: 'Terbit', time: jadwal.terbit },
                        { name: 'Dhuha', time: jadwal.dhuha },
                        { name: 'Dzuhur', time: jadwal.dzuhur },
                        { name: 'Ashar', time: jadwal.ashar },
                        { name: 'Maghrib', time: jadwal.maghrib },
                        { name: 'Isya', time: jadwal.isya }
                    ];

                    for (let s of sholatTimes) {
                        if (currentTime === s.time && !notified.includes(s.name)) {
                            try {
                                let thumb;
                                if (fs.existsSync('./data/jdw.png')) {
                                    thumb = { thumbnail: fs.readFileSync('./data/jdw.png') };
                                } else {
                                    thumb = { thumbnailUrl: 'https://raw.githubusercontent.com/AhmadAkbarID/media/main/jdw.png' };
                                }

                                // Mengirim notifikasi sebagai pesan biasa dengan thumbnail (Tanpa Tag-All)
                                await hydro.sendMessage(jid, {
                                    audio: {
                                        url: 'https://media.vocaroo.com/mp3/1ofLT2YUJAjQ'
                                    },
                                    mimetype: 'audio/mp4',
                                    ptt: true,
                                    contextInfo: {
                                        externalAdReply: {
                                            showAdAttribution: false,
                                            mediaType: 1,
                                            title: `Selamat menunaikan Ibadah Sholat ${s.name}`,
                                            body: `📍 ${kota} | 🕑 ${s.time} ${tz === 'Asia/Jakarta' ? 'WIB' : tz === 'Asia/Makassar' ? 'WITA' : 'WIT'}`,
                                            sourceUrl: '',
                                            ...thumb,
                                            renderLargerThumbnail: true
                                        }
                                    }
                                });
                                
                                if (!gc.jadwalsholatData.notified) gc.jadwalsholatData.notified = [];
                                gc.jadwalsholatData.notified.push(s.name);
                                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                }
            }
        }
    }, 60000); 
}

module.exports = {
    getSizeMedia,
    axiosss,
	getMenuList,
	HydroFitur,
    assertInstalled,
    getRandom,
    getBuffer,
    listbut2,
    fetchJson,
    runtime,
    clockString,
    sleep,
    isUrl,
    startAutoSholat,
    formatDate,
    formatp,
    generateProfilePicture,
    errorCache,
    normalize,
    startSewaChecker,
    updateSettings,
    parseMention,
    fixBytes,
    similarity,
    levenshtein,
    pickRandom,
    unsafeAgent,
	supabase,
    tarBackup
};