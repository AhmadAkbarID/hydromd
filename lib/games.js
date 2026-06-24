const fs = require('fs');
const axios = require('axios');
const { Chess } = require('chess.js');
const { addExp, expToNextLevel, roleFromLevel } = require('./rpg');

global.tebaklagu = global.tebaklagu ? global.tebaklagu : {};
global.tebakkata = global.tebakkata ? global.tebakkata : {};
global.tebakgambar = global.tebakgambar ? global.tebakgambar : {};
global.tekateki = global.tekateki ? global.tekateki : {};
global.asahotak = global.asahotak ? global.asahotak : {};
global.caklontong = global.caklontong ? global.caklontong : {};
global.family100 = global.family100 ? global.family100 : {};
global.siapaaku = global.siapaaku ? global.siapaaku : {};
global.susunkata = global.susunkata ? global.susunkata : {};
global.tebakbendera = global.tebakbendera ? global.tebakbendera : {};
global.tebakkabupaten = global.tebakkabupaten ? global.tebakkabupaten : {};
global.tebakkalimat = global.tebakkalimat ? global.tebakkalimat : {};
global.tebakkimia = global.tebakkimia ? global.tebakkimia : {};
global.tebaklirik = global.tebaklirik ? global.tebaklirik : {};
global.tebaktebakan = global.tebaktebakan ? global.tebaktebakan : {};
global.chess = global.chess ? global.chess : {};
global.tebaktokoh = global.tebaktokoh ? global.tebaktokoh : {};

const gameChess = async (hydro, m, prefix, args, command, { replyfail, replytolak, replyquery, replysuccess } = {}) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.group);

        if (chess[m.chat] && !(chess[m.chat] instanceof Chess)) {
            chess[m.chat] = Object.assign(new Chess(chess[m.chat].fen), chess[m.chat]);
        }

        switch (args[0]) {
            case 'start':
                if (!chess[m.chat]) return replytolak('Tidak Ada Sesi Yang Sedang Berlangsung!');
                if (!chess[m.chat].acc) return replytolak('Pemain Tidak Lengkap!');
                if (chess[m.chat].player1 !== m.sender) return replytolak('Hanya Pemain Utama Yang bisa Memulai!');

                if (chess[m.chat].turn !== m.sender && !chess[m.chat].start) {
                    const encodedFen = encodeURI(chess[m.chat]._fen);
                    let boardUrls = [
                        `https://www.chess.com/dynboard?fen=${encodedFen}&size=3&coordinates=inside`,
                        `https://chessboardimage.com/${encodedFen}.png`,
                        `https://fen2image.chessvision.ai/${encodedFen}`
                    ];
                    for (let url of boardUrls) {
                        try {
                            const { data } = await require('axios').get(url, { responseType: 'arraybuffer' });
                            let { key } = await hydro.sendMessage(m.chat, {
                                image: data,
                                caption: `♟️${command.toUpperCase()} GAME\n\nGiliran: @${m.sender.split('@')[0]}\n\nReply Pesan Ini untuk lanjut bermain!\nExample: b1 c3`,
                                mentions: [m.sender]
                            }, { quoted: m });
                            chess[m.chat].start = true;
                            chess[m.chat].turn = m.sender;
                            chess[m.chat].id = key.id;
                            return;
                        } catch (e) { }
                    }
                    replyfail(`Gagal Memulai Permainan!`);
                }
                break;

            case 'join':
                if (chess[m.chat]) {
                    if (chess[m.chat].player1 !== m.sender) {
                        if (chess[m.chat].acc) return replytolak(`Pemain Sudah Terisi`);
                        chess[m.chat].player2 = m.sender;
                        chess[m.chat].acc = true;
                        replysuccess(`Berhasil Bergabung! Silahkan @${chess[m.chat].player1.split('@')[0]} Untuk Memulai Game (${prefix + command} start)`);
                    } else replytolak(`Kamu Sudah Bergabung!`);
                } else replyfail('Tidak Ada Sesi Yang Sedang Berlangsung!');
                break;

            case 'end': case 'leave':
                if (chess[m.chat]) {
                    if (![chess[m.chat].player1, chess[m.chat].player2].includes(m.sender)) return replytolak('Hanya Pemain yang Bisa Menghentikan Permainan!');
                    delete chess[m.chat];
                    replysuccess('Sukses Menghapus Sesi Game');
                } else replyfail('Tidak Ada Sesi Yang Sedang Berlangsung!');
                break;

            default: {
                let opponent = null;

                if (args[0] === 'duel' && m.quoted && m.quoted.sender) {
                    opponent = m.quoted.sender;
                }
                else if (args[0] === 'duel' && args[1]) {
                    const rawNum = args.slice(1).join('').replace(/[^0-9]/g, '');
                    const normalized = rawNum.startsWith('0') ? '62' + rawNum.slice(1) : rawNum;
                    opponent = normalized + '@s.whatsapp.net';
                }
                else if (m.mentionedJid && m.mentionedJid.length > 0) {
                    opponent = m.mentionedJid[0];
                }

                if (opponent) {
                    if (opponent === m.sender) return replytolak('Tidak bisa duel dengan diri sendiri!');
                    if (chess[m.chat]) return replytolak('Masih Ada Sesi Yang Belum Diselesaikan!');
                    chess[m.chat] = new Chess();
                    chess[m.chat]._fen = chess[m.chat].fen();
                    chess[m.chat].player1 = m.sender;
                    chess[m.chat].player2 = opponent;
                    chess[m.chat].acc = false;
                    replyquery(`♟️${command.toUpperCase()} GAME\n\n@${m.sender.split('@')[0]} Menantang @${opponent.split('@')[0]}\nUntuk Bergabung ketik: ${prefix + command} join`);
                } else {
                    replyquery(`♟️${command.toUpperCase()} GAME\n\nCara menantang lawan:\n- Reply pesan: ${prefix + command} duel\n- Ketik nomor: ${prefix + command} duel 6285xxxxxx\n- Format: ${prefix + command} duel +62 851-xxxx-xxxx\n\nPerintah lain:\n- start | join | leave | end`);
                }
            }
        }
    } catch (e) {
        console.error(e);
        replyfail('Terjadi error pada game catur.');
    }
}

const checkChess = async (hydro, m, budy, { replyfail, replytolak, replysuccess } = {}) => {
    if (!chess[m.chat]) return;
    if (!chess[m.chat].start) return;
    if (m.quoted?.id !== chess[m.chat].id) return;
    if (![chess[m.chat].player1, chess[m.chat].player2].includes(m.sender)) return;
    if (chess[m.chat].turn !== m.sender) return replytolak('Bukan giliran kamu!');

    const parts = budy.trim().split(/\s+/);
    if (parts.length !== 2) return;

    const [from, to] = parts;
    if (!/^[a-h][1-8]$/.test(from) || !/^[a-h][1-8]$/.test(to)) return;

    try {
        const move = chess[m.chat].move({ from, to, promotion: 'q' });
        if (!move) return replytolak('Gerakan tidak valid!');

        chess[m.chat]._fen = chess[m.chat].fen();

        let status = '';
        if (chess[m.chat].isCheckmate()) {
            status = `♟️ CHECKMATE!\n@${m.sender.split('@')[0]} Menang! 🏆`;
            delete chess[m.chat];
        } else if (chess[m.chat].isDraw()) {
            status = `♟️ DRAW! Permainan berakhir seri.`;
            delete chess[m.chat];
        } else if (chess[m.chat].isCheck()) {
            status = `⚠️ CHECK!`;
        }

        if (!chess[m.chat]) {
            return await hydro.sendMessage(m.chat, {
                text: status,
                mentions: [m.sender]
            }, { quoted: m });
        }

        const nextTurn = m.sender === chess[m.chat].player1
            ? chess[m.chat].player2
            : chess[m.chat].player1;
        chess[m.chat].turn = nextTurn;

        const encodedFen = encodeURI(chess[m.chat]._fen);
        const boardUrls = [
            `https://www.chess.com/dynboard?fen=${encodedFen}&size=3&coordinates=inside`,
            `https://chessboardimage.com/${encodedFen}.png`,
            `https://fen2image.chessvision.ai/${encodedFen}`
        ];

        for (let url of boardUrls) {
            try {
                const { data } = await require('axios').get(url, { responseType: 'arraybuffer' });
                const caption = `♟️ CATUR GAME\n\nGerakan: ${from} → ${to}${status ? '\n' + status : ''}\n\nGiliran: @${nextTurn.split('@')[0]}\n\nReply pesan ini untuk lanjut bermain!\nExample: b1 c3`;
                let { key } = await hydro.sendMessage(m.chat, {
                    image: data,
                    caption,
                    mentions: [nextTurn]
                }, { quoted: m });
                chess[m.chat].id = key.id;
                return;
            } catch (e) { }
        }

        replyfail('Gerakan dicatat, tapi gagal menampilkan papan!');
    } catch (e) {
        console.error(e);
        replyfail('Terjadi error saat memproses gerakan.');
    }
}

const gameTekaTeki = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.tekateki.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/tekateki.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        await hydro.sendMessage(m.chat, {
            text: `🎮 *TEKA-TEKI* 🎮\n\nSoal: ${result.soal}\nWaktu: 60s\nHadiah: 10.000 money`
        }, { quoted: m });

        global.tekateki[m.chat] = result.jawaban.toLowerCase();

        await sleep(60000);

        if (global.tekateki.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}tekateki`
            }, { quoted: m });

            delete global.tekateki[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis tekateki!');
    }
}

const checkTekaTeki = async (hydro, m, budy, db) => {
    global.tekateki = global.tekateki ? global.tekateki : {};

    if (global.tekateki.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.tekateki[m.chat];
        let tebakanUser = budy.toLowerCase().trim();

        if (tebakanUser === jawaban) {
            let user = db.users[m.sender];
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .tekateki`;

            await hydro.sendMessage(m.chat, {
                text: textMenang
            }, { quoted: m });

            delete global.tekateki[m.chat];
        } else {
            const similarity = require('./function').similarity || function () { return 0; };
            if (similarity(tebakanUser, jawaban) >= 0.72) {
                await hydro.sendMessage(m.chat, { text: `*Dikit Lagi!*` }, { quoted: m });
            }
        }
    }
}

const gameTebakTokoh = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.tebaktokoh.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/tebaktokoh.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        // Mengacak urutan soal di database agar yang keluar berbeda-beda
        anu = anu.sort(() => Math.random() - 0.5);

        let success = false;
        let result;

        // Mencoba satu per satu soal yang sudah diacak
        for (let i = 0; i < anu.length; i++) {
            result = anu[i];
            let captionText = `🎮 *TEBAK TOKOH* 🎮\n\nSilahkan Jawab Soal Di Atas Ini\n\nDeskripsi : ${result.keterangan}\nWaktu : 60s\nHadiah : 10.000 money`;

            try {
                // Gunakan Axios untuk mendownload gambar menjadi buffer terlebih dahulu
                // Ini mencegah pemblokiran dari server Wikipedia/Wikimedia
                let imageReq = await axios.get(result.url, {
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
                    }
                });

                // Kirim buffer gambar yang berhasil didownload
                await hydro.sendMessage(m.chat, {
                    image: imageReq.data,
                    caption: captionText
                }, { quoted: m });
                
                success = true;
                break; 
            } catch (err) {
                // Tambahkan pesan error spesifik agar tahu kenapa gagal (misal: 404, 403)
                console.log(`[Tebak Tokoh] Gambar ke-${i+1} gagal dimuat: ${err.message}`);
            }
        }

        if (!success) {
            return replyfail('❌ Maaf, seluruh gambar soal gagal dimuat saat ini. Silakan coba lagi nanti!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        global.tebaktokoh[m.chat] = result.jawaban.toLowerCase();

        await sleep(60000);

        if (global.tebaktokoh.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {}

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}tebaktokoh`
            }, { quoted: m });

            delete global.tebaktokoh[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error sistem saat memuat kuis tebaktokoh!');
    }
}

const checkTebakTokoh = async (hydro, m, budy, db) => {
    global.tebaktokoh = global.tebaktokoh ? global.tebaktokoh : {};

    if (global.tebaktokoh.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.tebaktokoh[m.chat];
        let tebakanUser = budy.toLowerCase().trim();

        if (tebakanUser === jawaban) {
            let user = db.users[m.sender];
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const lvlResult = addExp(user, expWin); 

            const expNeed = expToNextLevel(user.level); 
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult && lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {}

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .tebaktokoh`;

            await hydro.sendMessage(m.chat, {
                text: textMenang
            }, { quoted: m });

            delete global.tebaktokoh[m.chat];
        }
    }
}

const gameTebakGambar = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.tebakgambar.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/tebakgambar.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        await hydro.sendMessage(m.chat, {
            image: { url: result.img },
            caption: `🎮 *TEBAK GAMBAR* 🎮\n\nSilahkan Jawab Soal Di Atas Ini\n\nDeskripsi : ${result.deskripsi}\nWaktu : 60s\nHadiah : 10.000 money`
        }, { quoted: m });

        global.tebakgambar[m.chat] = result.jawaban.toLowerCase();

        await sleep(60000);

        if (global.tebakgambar.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}tebakgambar`
            }, { quoted: m });

            delete global.tebakgambar[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis tebakgambar!');
    }
}

const checkTebakGambar = async (hydro, m, budy, db) => {
    global.tebakgambar = global.tebakgambar ? global.tebakgambar : {};

    if (global.tebakgambar.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.tebakgambar[m.chat];
        let tebakanUser = budy.toLowerCase().trim();

        if (tebakanUser === jawaban) {
            let user = db.users[m.sender];
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .tebakgambar`;

            await hydro.sendMessage(m.chat, {
                text: textMenang
            }, { quoted: m });

            delete global.tebakgambar[m.chat];
        }
    }
}

const gameTebakLagu = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let senderNum = m.sender.split('@')[0];
        let user = db.users[m.sender];

        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.tebaklagu.hasOwnProperty(senderNum)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/tebaklagu.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        let msg = await hydro.sendMessage(m.chat, {
            audio: { url: result.link_song },
            mimetype: 'audio/mpeg'
        }, { quoted: m });

        await hydro.sendMessage(m.chat, {
            text: `🎵 *Lagu Tersebut Adalah Lagu dari?*\n\n🎤 Artist : ${result.artist}\n⏱️ Waktu : 60s`
        }, { quoted: msg });

        global.tebaklagu[senderNum] = result.jawaban.toLowerCase();

        await sleep(60000);

        if (global.tebaklagu.hasOwnProperty(senderNum)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                image: { url: 'https://telegra.ph/file/96bb6ca28d6ef7fea479f.jpg' },
                caption: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}tebaklagu`
            }, { quoted: m });

            delete global.tebaklagu[senderNum];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis tebak lagu!');
    }
}

const checkTebakLagu = async (hydro, m, budy, db) => {
    global.tebaklagu = global.tebaklagu ? global.tebaklagu : {};
    let senderNum = m.sender.split('@')[0];

    if (global.tebaklagu.hasOwnProperty(senderNum) && budy) {
        let jawaban = global.tebaklagu[senderNum];
        let tebakanUser = budy.toLowerCase().trim();

        if (tebakanUser === jawaban) {
            let user = db.users[m.sender];
            if (!user) return;

            let moneyWin = 1500;
            let expWin = 50;

            user.money += moneyWin;
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .tebaklagu`;

            await hydro.sendMessage(m.chat, {
                image: { url: 'https://telegra.ph/file/14744917bea0185b52fb1.jpg' },
                caption: textMenang
            }, { quoted: m });

            delete global.tebaklagu[senderNum];
        }
    }
}

const gameTebakKata = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.tebakkata.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/tebakkata.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        await hydro.sendMessage(m.chat, {
            text: `🎮 *TEBAK KATA* 🎮\n\nSilahkan Jawab Pertanyaan Berikut\n\nSoal : ${result.soal}\nWaktu : 60s\nHadiah : 10.000 money`
        }, { quoted: m });

        global.tebakkata[m.chat] = result.jawaban.toLowerCase();

        await sleep(60000);

        if (global.tebakkata.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}tebakkata`
            }, { quoted: m });

            delete global.tebakkata[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis tebakkata!');
    }
}

const checkTebakKata = async (hydro, m, budy, db) => {
    global.tebakkata = global.tebakkata ? global.tebakkata : {};

    if (global.tebakkata.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.tebakkata[m.chat];
        let tebakanUser = budy.toLowerCase().trim();

        if (tebakanUser === jawaban) {
            let user = db.users[m.sender];
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .tebakkata`;

            await hydro.sendMessage(m.chat, {
                text: textMenang
            }, { quoted: m });

            delete global.tebakkata[m.chat];
        }
    }
}

const gameCasinoSolo = async (hydro, m, prefix, db, args) => {
    try {
        if (!db.users[m.sender]) return replytolak('❌ Data kamu tidak ditemukan.')

        const user = db.users[m.sender]

        if (global.db.settings?.registrationRequired === true && user.registered !== true) {
            return replytolak(`❌ Kamu belum mendaftar!\n\nKetik *.daftar nama umur* untuk mendaftar\n\nContoh: *.daftar Budi 25*`)
        }

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0)
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!')

        const botNumber = await hydro.decodeJid(hydro.user.id)
        if (!db.set) db.set = {}
        if (!db.set[botNumber]) db.set[botNumber] = { money: 0 }

        const MIN_BET = 1000
        const countRaw = args[0]

        if (!countRaw) {
            return replyquery(`🎰 *Cara pakai:*\n${prefix}casino <jumlah>\n${prefix}casino all\n\n📌 Minimal taruhan: *1.000* koin\nContoh: ${prefix}casino 1000`)
        }

        if (countRaw !== 'all' && isNaN(countRaw)) {
            return replytolak(`❌ Masukkan jumlah yang valid!\nContoh: ${prefix}casino 1000`)
        }

        let count = countRaw === 'all' ? user.money : parseInt(countRaw)

        if (count < MIN_BET) {
            return replytolak(`❌ Taruhan minimal adalah *${MIN_BET.toLocaleString('id-ID')}* koin!`)
        }

        if (user.money < count) {
            return replytolak(`❌ Uang kamu tidak cukup!\n💰 Saldo: *${user.money.toLocaleString('id-ID')}* koin`)
        }

        const computerPoint = Math.floor(Math.random() * 101)
        const playerPoint = Math.floor(Math.random() * 81)

        if (user.limitfree > 0) user.limitfree -= 1
        else if (user.limitprem > 0) user.limitprem -= 1
        else user.limitbuy -= 1

        user.money -= count
        db.set[botNumber].money += count

        let resultText, resultEmoji, expGained

        if (computerPoint > playerPoint) {
            resultEmoji = '📉'
            resultText = `*YOU LOSE* 😔\nKamu kehilangan *${count.toLocaleString('id-ID')}* koin`
            expGained = 5
        } else if (computerPoint < playerPoint) {
            user.money += count * 2
            db.set[botNumber].money -= count
            resultEmoji = '📈'
            resultText = `*YOU WIN!* 🎉\nKamu mendapatkan *${(count * 2).toLocaleString('id-ID')}* koin`
            expGained = 30
        } else {
            user.money += count
            db.set[botNumber].money -= count
            resultEmoji = '🤝'
            resultText = `*SERI!* 😐\nUangmu dikembalikan *${count.toLocaleString('id-ID')}* koin`
            expGained = 10
        }

        const lvlResult = addExp(user, expGained)

        const expNeed = expToNextLevel(user.level)
        const expBarFull = 10
        const expFilled = Math.round((user.exp / expNeed) * expBarFull)
        const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled)

        let levelUpText = ''
        if (lvlResult.levelUps > 0) {
            levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`
            if (lvlResult.tierChanged) {
                levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`
            }
        }

        try {
            require('fs').writeFileSync('./database/database.json', JSON.stringify(db, null, 2))
        } catch (e) {
        }

        return success(`💰 *────── CASINO ──────* 💰\n\n👤 *Kamu     :* ${playerPoint} Point\n🤖 *Computer :* ${computerPoint} Point\n\n${resultEmoji} ${resultText}\n✨ *EXP      :* +${expGained} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n💰 *────────────────────* 💰`)

    } catch (e) {
        return replyfail('❌ Terjadi error saat bermain casino!')
    }
}

const gameAsahOtak = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.asahotak.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/asahotak.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        await hydro.sendMessage(m.chat, {
            text: `🎮 *ASAH OTAK* 🎮\n\nSilahkan Jawab Pertanyaan Berikut\n\nSoal : ${result.soal}\nWaktu : 60s\nHadiah : 10.000 money\n\n_Ketik *nyerah* jika tidak bisa menjawab_`
        }, { quoted: m });

        global.asahotak[m.chat] = result.jawaban.toLowerCase();

        await sleep(60000);

        if (global.asahotak.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}asahotak`
            }, { quoted: m });

            delete global.asahotak[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis asahotak!');
    }
}

const checkAsahOtak = async (hydro, m, budy, db) => {
    global.asahotak = global.asahotak ? global.asahotak : {};

    if (global.asahotak.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.asahotak[m.chat];
        let tebakanUser = budy.toLowerCase().trim();
        let user = db.users[m.sender];

        if (tebakanUser === 'nyerah') {
            if (!user) return;
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;
            user.money -= penalty;

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `🏳️ *KAMU MENYERAH!*\n\nJawaban yang benar adalah: *${jawaban}*\nKamu kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin`
            }, { quoted: m });

            delete global.asahotak[m.chat];

        } else if (tebakanUser === jawaban) {
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .asahotak`;

            await hydro.sendMessage(m.chat, {
                text: textMenang
            }, { quoted: m });

            delete global.asahotak[m.chat];
        }
    }
}

const gameCakLontong = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.caklontong.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/caklontong.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        await hydro.sendMessage(m.chat, {
            text: `🎮 *CAK LONTONG* 🎮\n\n*Jawablah Pertanyaan Berikut :*\n${result.soal}\n\nWaktu : 60s\nHadiah : 10.000 money\n\n_Ketik *nyerah* jika tidak bisa menjawab_`
        }, { quoted: m });

        global.caklontong[m.chat] = {
            jawaban: result.jawaban.toLowerCase(),
            deskripsi: result.deskripsi
        };

        await sleep(60000);

        if (global.caklontong.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                image: { url: 'https://telegra.ph/file/96bb6ca28d6ef7fea479f.jpg' },
                caption: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nDeskripsi: ${result.deskripsi}\n\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}caklontong`
            }, { quoted: m });

            delete global.caklontong[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis caklontong!');
    }
}

const checkCakLontong = async (hydro, m, budy, db) => {
    global.caklontong = global.caklontong ? global.caklontong : {};

    if (global.caklontong.hasOwnProperty(m.chat) && budy) {
        let data = global.caklontong[m.chat];
        let jawaban = data.jawaban;
        let deskripsi = data.deskripsi;
        let tebakanUser = budy.toLowerCase().trim();
        let user = db.users[m.sender];

        if (tebakanUser === 'nyerah') {
            if (!user) return;
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;
            user.money -= penalty;

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                image: { url: 'https://telegra.ph/file/96bb6ca28d6ef7fea479f.jpg' },
                caption: `🏳️ *KAMU MENYERAH!*\n\nJawaban yang benar adalah: *${jawaban}*\nDeskripsi: ${deskripsi}\n\nKamu kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin`
            }, { quoted: m });

            delete global.caklontong[m.chat];

        } else if (tebakanUser === jawaban) {
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\n*Deskripsi:* ${deskripsi}\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .caklontong`;

            await hydro.sendMessage(m.chat, {
                image: { url: 'https://telegra.ph/file/14744917bea0185b52fb1.jpg' },
                caption: textMenang
            }, { quoted: m });

            delete global.caklontong[m.chat];
        }
    }
}

const gameFamily100 = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        let id = m.chat;
        if (global.family100.hasOwnProperty(id)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            const axios = require('axios');
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/family100.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let json = anu[Math.floor(Math.random() * anu.length)];
        let winScore = 2000;

        let hasil = `╭┈┈⬡「 🎲 *FAMILY 100* 」\n┃ 🧩 Soal:\n┃ ${json.soal}\n┃\n┃ 🎁 Hadiah: *Rp ${winScore.toLocaleString('id-ID')}* / jawaban\n┃ 📌 Total Jawaban: *${json.jawaban.length}*\n┃ ${json.jawaban.find(v => v.includes(' ')) ? `📝 Catatan: *Ada jawaban spasi*` : `📝 Catatan: *Tidak ada spasi*`}\n┃\n┃ ⛔ Ketik: *nyerah* untuk menyerah\n╰┈┈┈┈┈┈┈┈⬡`.trim();

        let msg = await hydro.sendMessage(m.chat, { text: hasil }, { quoted: m });

        global.family100[id] = {
            id,
            msg,
            ...json,
            terjawab: Array.from(json.jawaban, () => false),
            winScore
        };

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis family100!');
    }
}

const checkFamily100 = async (hydro, m, budy, db) => {
    global.family100 = global.family100 ? global.family100 : {};
    let id = m.chat;

    if (global.family100.hasOwnProperty(id) && budy && !m.key.fromMe) {
        let similarity = require('./function').similarity || function () { return 0; };
        let threshold = 0.72;
        let users = db.users[m.sender];
        if (!users) return;

        let room = global.family100[id];
        let text = budy.toLowerCase().replace(/[^\w\s\-]+/g, '').trim();
        let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(budy);

        if (!isSurrender) {
            let index = room.jawaban.map(v => String(v).toLowerCase()).indexOf(text);

            if (index < 0) {
                let left = room.jawaban.filter((_, idx) => !room.terjawab[idx]).map(v => String(v).toLowerCase());
                if (left.length) {
                    let sim = Math.max(...left.map(j => similarity(j, text)));
                    if (sim >= threshold) return hydro.sendMessage(m.chat, { text: 'Dikit lagi!' }, { quoted: m });
                }
                return;
            }

            if (room.terjawab[index]) return;

            users.money += Number(room.winScore || 0);
            room.terjawab[index] = m.sender;

            const { addExp } = require('./rpg');
            addExp(users, 50);

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) { }
        }

        let isWin = room.terjawab.length === room.terjawab.filter(v => v).length;

        const answeredLines = room.jawaban.map((jawaban, idx) => {
            if (!isSurrender && !room.terjawab[idx]) return `┃ ${String(idx + 1).padStart(2, '0')}. ❓ *________*`;
            const by = room.terjawab[idx];
            const byNum = by ? by.split('@')[0] : '';
            return `┃ ${String(idx + 1).padStart(2, '0')}. ✅ *${jawaban}*${by ? `  —  @${byNum}` : ''}`;
        }).join('\n');

        const mentions = room.terjawab.filter(v => typeof v === 'string' && v.endsWith('@s.whatsapp.net'));

        let caption = `╭┈┈⬡「 🎲 *FAMILY 100* 」\n┃ 🧩 Soal:\n┃ ${room.soal}\n┃\n┃ ${isWin ? '🏁 Status: *SEMUA TERJAWAB ✅*' : isSurrender ? '🏳️ Status: *MENYERAH ❌*' : `🎁 Hadiah: *Rp ${Number(room.winScore || 0).toLocaleString('id-ID')}* / jawaban`}\n╰┈┈┈┈┈┈┈┈⬡\n\n╭┈┈⬡「 📋 *JAWABAN* 」\n${answeredLines}\n╰┈┈┈┈┈┈┈┈⬡`.trim();

        await hydro.sendMessage(m.chat, { text: caption, mentions }, { quoted: m });

        if (isWin || isSurrender) {
            delete global.family100[id];
        }
    }
}

const gameSiapaAku = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.siapaaku.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            const axios = require('axios');
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/siapakahaku.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        await hydro.sendMessage(m.chat, {
            text: `🎮 *SIAPAKAH AKU* 🎮\n\nSoal: ${result.soal}\n\nWaktu: 60s\nHadiah: 10.000 money`
        }, { quoted: m });

        global.siapaaku[m.chat] = result.jawaban.toLowerCase();

        await sleep(60000);

        if (global.siapaaku.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}siapaaku`
            }, { quoted: m });

            delete global.siapaaku[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis siapaaku!');
    }
}

const checkSiapaAku = async (hydro, m, budy, db) => {
    global.siapaaku = global.siapaaku ? global.siapaaku : {};

    if (global.siapaaku.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.siapaaku[m.chat];
        let tebakanUser = budy.toLowerCase().trim();

        if (tebakanUser === jawaban) {
            let user = db.users[m.sender];
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const { addExp, expToNextLevel, roleFromLevel } = require('./rpg');
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .siapaaku`;

            await hydro.sendMessage(m.chat, {
                text: textMenang
            }, { quoted: m });

            delete global.siapaaku[m.chat];
        } else {
            const similarity = require('./function').similarity || function () { return 0; };
            if (similarity(tebakanUser, jawaban) >= 0.72) {
                await hydro.sendMessage(m.chat, { text: `*Dikit Lagi!*` }, { quoted: m });
            }
        }
    }
}

const gameSusunKata = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.susunkata.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            const axios = require('axios');
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/susunkata.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        await hydro.sendMessage(m.chat, {
            text: `🎮 *SUSUN KATA* 🎮\n\nSoal: ${result.soal}\nTipe: ${result.tipe}\n\nWaktu: 60s\nHadiah: 10.000 money`
        }, { quoted: m });

        global.susunkata[m.chat] = result.jawaban.toLowerCase();

        await sleep(60000);

        if (global.susunkata.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}susunkata`
            }, { quoted: m });

            delete global.susunkata[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis susunkata!');
    }
}

const checkSusunKata = async (hydro, m, budy, db) => {
    global.susunkata = global.susunkata ? global.susunkata : {};

    if (global.susunkata.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.susunkata[m.chat];
        let tebakanUser = budy.toLowerCase().trim();

        if (tebakanUser === jawaban) {
            let user = db.users[m.sender];
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const { addExp, expToNextLevel, roleFromLevel } = require('./rpg');
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .susunkata`;

            await hydro.sendMessage(m.chat, {
                text: textMenang
            }, { quoted: m });

            delete global.susunkata[m.chat];
        } else {
            const similarity = require('./function').similarity || function () { return 0; };
            if (similarity(tebakanUser, jawaban) >= 0.72) {
                await hydro.sendMessage(m.chat, { text: `*Dikit Lagi!*` }, { quoted: m });
            }
        }
    }
}

const gameTebakBendera = async (hydro, m, prefix, sleep, db, { replyfail, replyquery, replytolak, replysuccess }) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.tebakbendera.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        const axios = require('axios');
        try {
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/tebakbendera.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            console.error('[tebakbendera] gagal fetch json soal:', err.message);
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (!Array.isArray(anu) || anu.length === 0) {
            console.error('[tebakbendera] data soal kosong/invalid:', anu);
            return replyfail('❌ Data soal tidak valid!');
        }

        let result, sent = false, attempts = 0;
        const maxAttempts = 5;
        let lastErr;

        while (!sent && attempts < maxAttempts) {
            result = anu[Math.floor(Math.random() * anu.length)];
            try {
                const imgRes = await axios.get(result.img, {
                    responseType: 'arraybuffer',
                    maxRedirects: 5,
                    headers: {
                        'User-Agent': 'HydroBot-TebakBendera/1.0 (https://github.com/BochilTeam; contact-via-github) Node-axios'
                    },
                    timeout: 15000
                });
                const imgBuffer = Buffer.from(imgRes.data);

                await hydro.sendMessage(m.chat, {
                    image: imgBuffer,
                    caption: `🎮 *TEBAK BENDERA* 🎮\n\nSilahkan Jawab Gambar Berikut\n\nClue : ${result.flag}\nWaktu : 60s\nHadiah : 10.000 money\n\n_Ketik *nyerah* jika tidak bisa menjawab_`
                }, { quoted: m });
                sent = true;
            } catch (err) {
                lastErr = err;
                console.error(`[tebakbendera] gagal kirim gambar (attempt ${attempts + 1}) url=${result?.img}:`, err.message);
                attempts++;
            }
        }

        if (!sent) {
            console.error('[tebakbendera] semua attempt gagal kirim gambar. lastErr:', lastErr);
            return replyfail('❌ Gagal memuat gambar soal (sumber gambar mungkin sedang down). Coba lagi nanti!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        global.tebakbendera[m.chat] = result.name.toLowerCase();

        await sleep(60000);

        if (global.tebakbendera.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
                console.error('[tebakbendera] gagal simpan database (timeout):', e.message);
            }

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.name}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}tebakbendera`
            }, { quoted: m });

            delete global.tebakbendera[m.chat];
        }

    } catch (e) {
        console.error('[tebakbendera] unhandled error:', e);
        return replyfail('❌ Terjadi error saat memuat kuis tebakbendera!');
    }
}

const checkTebakBendera = async (hydro, m, budy, db) => {
    global.tebakbendera = global.tebakbendera ? global.tebakbendera : {};

    if (global.tebakbendera.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.tebakbendera[m.chat];
        let tebakanUser = budy.toLowerCase().trim();
        let user = db.users[m.sender];

        if (tebakanUser === 'nyerah') {
            if (!user) return;
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;
            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `🏳️ *KAMU MENYERAH!*\n\nJawaban yang benar adalah: *${jawaban}*\nKamu kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin`
            }, { quoted: m });

            delete global.tebakbendera[m.chat];

        } else if (tebakanUser === jawaban) {
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const { addExp, expToNextLevel, roleFromLevel } = require('./rpg');
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .tebakbendera`;

            await hydro.sendMessage(m.chat, {
                text: textMenang
            }, { quoted: m });

            delete global.tebakbendera[m.chat];
        }
    }
}

const gameTebakKabupaten = async (hydro, m, prefix, sleep, db, { replyfail, replyquery,replytolak, replysuccess }) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.tebakkabupaten.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        const axios = require('axios');
        try {
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/tebakkabupaten.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            console.error('[tebakkabupaten] gagal fetch json soal:', err.message);
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (!Array.isArray(anu) || anu.length === 0) {
            console.error('[tebakkabupaten] data soal kosong/invalid:', anu);
            return replyfail('❌ Data soal tidak valid!');
        }

        let result, sent = false, attempts = 0;
        const maxAttempts = 5;
        let lastErr;

        while (!sent && attempts < maxAttempts) {
            result = anu[Math.floor(Math.random() * anu.length)];
            try {
                const imgRes = await axios.get(result.url, {
                    responseType: 'arraybuffer',
                    maxRedirects: 5,
                    headers: {
                        'User-Agent': 'HydroBot-TebakKabupaten/1.0 (https://github.com/AhmadAkbarID; contact-via-github) Node-axios'
                    },
                    timeout: 15000
                });
                const imgBuffer = Buffer.from(imgRes.data);

                await hydro.sendMessage(m.chat, {
                    image: imgBuffer,
                    caption: `🎮 *TEBAK KABUPATEN* 🎮\n\nSilahkan Jawab Gambar Berikut\n\nWaktu : 60s\nHadiah : 10.000 money\n\n_Ketik *nyerah* jika tidak bisa menjawab_`
                }, { quoted: m });
                sent = true;
            } catch (err) {
                lastErr = err;
                console.error(`[tebakkabupaten] gagal kirim gambar (attempt ${attempts + 1}) url=${result?.url}:`, err.message);
                attempts++;
            }
        }

        if (!sent) {
            console.error('[tebakkabupaten] semua attempt gagal kirim gambar. lastErr:', lastErr);
            return replyfail('❌ Gagal memuat gambar soal (sumber gambar mungkin sedang down). Coba lagi nanti!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        global.tebakkabupaten[m.chat] = result.title.toLowerCase();

        await sleep(60000);

        if (global.tebakkabupaten.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
                console.error('[tebakkabupaten] gagal simpan database (timeout):', e.message);
            }

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.title}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}tebakkabupaten`
            }, { quoted: m });

            delete global.tebakkabupaten[m.chat];
        }

    } catch (e) {
        console.error('[tebakkabupaten] unhandled error:', e);
        return replyfail('❌ Terjadi error saat memuat kuis tebakkabupaten!');
    }
}

const checkTebakKabupaten = async (hydro, m, budy, db) => {
    global.tebakkabupaten = global.tebakkabupaten ? global.tebakkabupaten : {};

    if (global.tebakkabupaten.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.tebakkabupaten[m.chat];
        let tebakanUser = budy.toLowerCase().trim();
        let user = db.users[m.sender];

        if (tebakanUser === 'nyerah') {
            if (!user) return;
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;
            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `🏳️ *KAMU MENYERAH!*\n\nJawaban yang benar adalah: *${jawaban}*\nKamu kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin`
            }, { quoted: m });

            delete global.tebakkabupaten[m.chat];

        } else if (tebakanUser === jawaban) {
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const { addExp, expToNextLevel, roleFromLevel } = require('./rpg');
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .tebakkabupaten`;

            await hydro.sendMessage(m.chat, {
                text: textMenang
            }, { quoted: m });

            delete global.tebakkabupaten[m.chat];
        }
    }
}

const gameTebakKalimat = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.tebakkalimat.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            const axios = require('axios');
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/tebakkalimat.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        await hydro.sendMessage(m.chat, {
            text: `🎮 *TEBAK KALIMAT* 🎮\n\nSilahkan Jawab Pertanyaan Berikut\n\n${result.soal}\n\nWaktu : 60s\nHadiah : 10.000 money\n\n_Ketik *nyerah* jika tidak bisa menjawab_`
        }, { quoted: m });

        global.tebakkalimat[m.chat] = result.jawaban.toLowerCase();

        await sleep(60000);

        if (global.tebakkalimat.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                image: { url: 'https://telegra.ph/file/96bb6ca28d6ef7fea479f.jpg' },
                caption: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}tebakkalimat`
            }, { quoted: m });

            delete global.tebakkalimat[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis tebakkalimat!');
    }
}

const checkTebakKalimat = async (hydro, m, budy, db) => {
    global.tebakkalimat = global.tebakkalimat ? global.tebakkalimat : {};

    if (global.tebakkalimat.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.tebakkalimat[m.chat];
        let tebakanUser = budy.toLowerCase().trim();
        let user = db.users[m.sender];

        if (tebakanUser === 'nyerah') {
            if (!user) return;
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;
            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                image: { url: 'https://telegra.ph/file/96bb6ca28d6ef7fea479f.jpg' },
                caption: `🏳️ *KAMU MENYERAH!*\n\nJawaban yang benar adalah: *${jawaban}*\nKamu kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin`
            }, { quoted: m });

            delete global.tebakkalimat[m.chat];

        } else if (tebakanUser === jawaban) {
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const { addExp, expToNextLevel, roleFromLevel } = require('./rpg');
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .tebakkalimat`;

            await hydro.sendMessage(m.chat, {
                image: { url: 'https://telegra.ph/file/14744917bea0185b52fb1.jpg' },
                caption: textMenang
            }, { quoted: m });

            delete global.tebakkalimat[m.chat];
        }
    }
}

const gameTebakKimia = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.tebakkimia.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            const axios = require('axios');
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/tebakkimia.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        await hydro.sendMessage(m.chat, {
            text: `🎮 *TEBAK KIMIA* 🎮\n\nSilahkan Jawab Pertanyaan Berikut\n\nUnsur : ${result.unsur}\nWaktu : 60s\nHadiah : 10.000 money\n\n_Ketik *nyerah* jika tidak bisa menjawab_`
        }, { quoted: m });

        global.tebakkimia[m.chat] = result.lambang.toLowerCase();

        await sleep(60000);

        if (global.tebakkimia.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.lambang}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}tebakkimia`
            }, { quoted: m });

            delete global.tebakkimia[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis tebakkimia!');
    }
}

const checkTebakKimia = async (hydro, m, budy, db) => {
    global.tebakkimia = global.tebakkimia ? global.tebakkimia : {};

    if (global.tebakkimia.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.tebakkimia[m.chat];
        let tebakanUser = budy.toLowerCase().trim();
        let user = db.users[m.sender];

        if (tebakanUser === 'nyerah') {
            if (!user) return;
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;
            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `🏳️ *KAMU MENYERAH!*\n\nJawaban yang benar adalah: *${jawaban}*\nKamu kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin`
            }, { quoted: m });

            delete global.tebakkimia[m.chat];

        } else if (tebakanUser === jawaban) {
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const { addExp, expToNextLevel, roleFromLevel } = require('./rpg');
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .tebakkimia`;

            await hydro.sendMessage(m.chat, {
                text: textMenang
            }, { quoted: m });

            delete global.tebakkimia[m.chat];
        }
    }
}

const gameTebakLirik = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.tebaklirik.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            const axios = require('axios');
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/tebaklirik.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        await hydro.sendMessage(m.chat, {
            text: `🎮 *TEBAK LIRIK* 🎮\n\nSoal: ${result.soal}\n\nWaktu: 60s\nHadiah: 10.000 money`
        }, { quoted: m });

        global.tebaklirik[m.chat] = result.jawaban.toLowerCase();

        await sleep(60000);

        if (global.tebaklirik.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}tebaklirik`
            }, { quoted: m });

            delete global.tebaklirik[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis tebaklirik!');
    }
}

const checkTebakLirik = async (hydro, m, budy, db) => {
    global.tebaklirik = global.tebaklirik ? global.tebaklirik : {};

    if (global.tebaklirik.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.tebaklirik[m.chat];
        let tebakanUser = budy.toLowerCase().trim();

        if (tebakanUser === jawaban) {
            let user = db.users[m.sender];
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const { addExp, expToNextLevel, roleFromLevel } = require('./rpg');
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .tebaklirik`;

            await hydro.sendMessage(m.chat, {
                text: textMenang
            }, { quoted: m });

            delete global.tebaklirik[m.chat];
        } else {
            const similarity = require('./function').similarity || function () { return 0; };
            if (similarity(tebakanUser, jawaban) >= 0.72) {
                await hydro.sendMessage(m.chat, { text: `*Dikit Lagi!*` }, { quoted: m });
            }
        }
    }
}

const gameTebakTebakan = async (hydro, m, prefix, sleep, db) => {
    try {
        if (!m.isGroup) return replytolak(global.mess.only.group);

        let user = db.users[m.sender];
        if (!user) return replyfail('❌ Data kamu tidak ditemukan.');

        const totalLimit = (user.limitfree || 0) + (user.limitprem || 0) + (user.limitbuy || 0);
        if (totalLimit < 1) return replytolak(global.mess?.limit || '❌ Limit kamu habis!');

        if (global.tebaktebakan.hasOwnProperty(m.chat)) {
            return replytolak("Masih Ada Sesi Yang Belum Diselesaikan!");
        }

        let anu;
        try {
            const axios = require('axios');
            let res = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/database/refs/heads/main/games/tebaktebakan.json');
            anu = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        } catch (err) {
            return replyfail('❌ Gagal mengambil data soal dari server!');
        }

        if (user.limitfree > 0) user.limitfree -= 1;
        else if (user.limitprem > 0) user.limitprem -= 1;
        else user.limitbuy -= 1;

        let result = anu[Math.floor(Math.random() * anu.length)];

        await hydro.sendMessage(m.chat, {
            text: `🎮 *TEBAK TEBAKAN* 🎮\n\nJawablah Pertanyaan Berikut : *${result.soal}*\n\nWaktu : 60s\nHadiah : 10.000 money\n\n_Ketik *nyerah* jika tidak bisa menjawab_`
        }, { quoted: m });

        global.tebaktebakan[m.chat] = result.jawaban.toLowerCase();

        await sleep(60000);

        if (global.tebaktebakan.hasOwnProperty(m.chat)) {
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;

            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `⏳ *WAKTU HABIS!* ⏳\n\nJawaban yang benar adalah: *${result.jawaban}*\nKamu gagal menebak dan kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain? Ketik ${prefix}tebaktebakan`
            }, { quoted: m });

            delete global.tebaktebakan[m.chat];
        }

    } catch (e) {
        return replyfail('❌ Terjadi error saat memuat kuis tebaktebakan!');
    }
}

const checkTebakTebakan = async (hydro, m, budy, db) => {
    global.tebaktebakan = global.tebaktebakan ? global.tebaktebakan : {};

    if (global.tebaktebakan.hasOwnProperty(m.chat) && budy) {
        let jawaban = global.tebaktebakan[m.chat];
        let tebakanUser = budy.toLowerCase().trim();
        let user = db.users[m.sender];

        if (tebakanUser === 'nyerah') {
            if (!user) return;
            let penalty = 200;
            if (user.money < penalty) penalty = user.money;
            user.money -= penalty;

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            await hydro.sendMessage(m.chat, {
                text: `🏳️ *KAMU MENYERAH!*\n\nJawaban yang benar adalah: *${jawaban}*\nKamu kehilangan *${penalty.toLocaleString('id-ID')}* koin 😔\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin`
            }, { quoted: m });

            delete global.tebaktebakan[m.chat];

        } else if (tebakanUser === jawaban) {
            if (!user) return;

            let moneyWin = 2000;
            let expWin = 50;

            user.money += moneyWin;
            const { addExp, expToNextLevel, roleFromLevel } = require('./rpg');
            const lvlResult = addExp(user, expWin);

            const expNeed = expToNextLevel(user.level);
            const expBarFull = 10;
            const expFilled = Math.round((user.exp / expNeed) * expBarFull);
            const expBar = '█'.repeat(expFilled) + '░'.repeat(expBarFull - expFilled);

            let levelUpText = '';
            if (lvlResult.levelUps > 0) {
                levelUpText = `\n🎊 *LEVEL UP!* ${lvlResult.oldLevel} → *${lvlResult.newLevel}*\n`;
                if (lvlResult.tierChanged) {
                    levelUpText += `🏅 *TIER NAIK!* ${lvlResult.oldRole} → *${lvlResult.newRole}*\n`;
                }
            }

            try {
                const fs = require('fs');
                fs.writeFileSync('./database/database.json', JSON.stringify(db, null, 2));
            } catch (e) {
            }

            let textMenang = `🎉 *JAWABAN BENAR!* 🎉\n\nKamu mendapatkan *${moneyWin.toLocaleString('id-ID')}* koin\n✨ *EXP      :* +${expWin} exp\n${levelUpText}\n📊 *${roleFromLevel(user.level)}* Lv.${user.level}\n[${expBar}] ${user.exp}/${expNeed}\n\n💰 *Saldo:* ${user.money.toLocaleString('id-ID')} koin\n\nIngin bermain lagi? Ketik .tebaktebakan`;

            await hydro.sendMessage(m.chat, {
                image: { url: 'https://telegra.ph/file/14744917bea0185b52fb1.jpg' },
                caption: textMenang
            }, { quoted: m });

            delete global.tebaktebakan[m.chat];
        } else {
            const similarity = require('./function').similarity || function () { return 0; };
            if (similarity(tebakanUser, jawaban) >= 0.72) {
                await hydro.sendMessage(m.chat, { text: `*Dikit Lagi!*` }, { quoted: m });
            }
        }
    }
}

module.exports = {
    gameCasinoSolo,
    gameTebakLagu,
    checkTebakLagu,
    gameTebakKata,
    checkTebakKata,
    gameTebakGambar,
    checkTebakGambar,
    gameTebakTokoh,
    checkTebakTokoh,
    gameTekaTeki,
    checkTekaTeki,
    gameAsahOtak,
    checkAsahOtak,
    gameCakLontong,
    checkCakLontong,
    gameFamily100,
    checkFamily100,
    gameSiapaAku,
    checkSiapaAku,
    gameSusunKata,
    checkSusunKata,
    gameTebakBendera,
    checkTebakBendera,
    gameTebakKabupaten,
    checkTebakKabupaten,
    gameTebakKalimat,
    checkTebakKalimat,
    gameTebakKimia,
    checkTebakKimia,
    gameTebakLirik,
    checkTebakLirik,
    gameTebakTebakan,
    checkTebakTebakan,
    gameChess,
    checkChess
};