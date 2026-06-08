const fs = require('fs');

const antibotPath = './database/antibot.json';
const antibotSettingsPath = './database/antibot-settings.json';

// ─── INIT FILE DATABASE ───────────────────────────────────────────
if (!fs.existsSync(antibotPath)) fs.writeFileSync(antibotPath, JSON.stringify([]));
if (!fs.existsSync(antibotSettingsPath)) fs.writeFileSync(antibotSettingsPath, JSON.stringify({}));

let antibot = JSON.parse(fs.readFileSync(antibotPath));
let antibotSettings = JSON.parse(fs.readFileSync(antibotSettingsPath));

// ─── SAVE FUNCTIONS ───────────────────────────────────────────────
function saveAntibot() {
    fs.writeFileSync(antibotPath, JSON.stringify(antibot, null, 2));
}
function saveAntibotSettings() {
    fs.writeFileSync(antibotSettingsPath, JSON.stringify(antibotSettings, null, 2));
}

// ─── DETEKSI BOT DARI MESSAGE ID ──────────────────────────────────
function detectBot(rawId) {
    const baseId = String(rawId || '').split('-')[0];
    let reasons = [];
    let isBotDetected = false;

    const nonHexChars = baseId.match(/[^0-9A-F]/gi);
    if (nonHexChars) {
        const uniqueChars = [...new Set(nonHexChars)].join('').toUpperCase();
        reasons.push(`Format ID Invalid: Mengandung [ ${uniqueChars} ]`);
        isBotDetected = true;
    }

    if (baseId.length !== 32 && !baseId.startsWith('3EB0') && !baseId.startsWith('3A')) {
        reasons.push(`Panjang ID Tidak Wajar (${baseId.length} digit)`);
        isBotDetected = true;
    }

    if (baseId.startsWith('3EB0')) {
        reasons.push('Terdeteksi ID WhatsApp Web (3EB0)');
        isBotDetected = true;
    }

    if (baseId.startsWith('BAE5')) {
        reasons.push('Terdeteksi ID Baileys Lama (BAE5)');
        isBotDetected = true;
    }

    return { detected: isBotDetected, reasons };
}

// ─── HANDLER ────────────────────────────────────────
/**
 * @param {object} hydro
 * @param {object} m
 * @param {object} opts
 * @param {boolean} opts.isAdmins
 * @param {boolean} opts.isBotAdmins
 * @param {boolean} opts.Ahmad
 * @param {function} opts.sleep
 * @param {function} opts.replyfail   — dari msgHelper
 * @param {function} opts.react       — dari msgHelper
 */
async function handleAntibot(hydro, m, { isAdmins, isBotAdmins, Ahmad, sleep, replyfail, react }) {
    if (!m.isGroup) return;
    if (!antibot.includes(m.chat)) return;
    if (isAdmins || Ahmad || m.key.fromMe) return;

    const rawId  = String(m.key?.id || '');
    const sender = m.sender || m.key.participant || m.key.remoteJid;
    const { detected, reasons } = detectBot(rawId);
    if (!detected) return;

    const actionType = antibotSettings[m.chat] || 'delete';
    const timeNow    = new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });

    const sanksiLabel = {
        delete: 'HAPUS PESAN',
        kick:   'TENDANG MEMBER',
        both:   'HAPUS PESAN & TENDANG',
    }[actionType] || 'HAPUS PESAN';

    const report =
`⚡ *SISTEM KEAMANAN GRUP* ⚡
⏰ *Waktu:* ${timeNow}
👤 *User:* @${sender.split('@')[0]}
🔑 *ID:* ${rawId}

🚫 *Terdeteksi Unauthorized Client/Bot*
${reasons.map(r => `> • ${r}`).join('\n')}

🔨 *Sanksi:* ${sanksiLabel}`;

    // Kirim laporan pakai replyfail 
    await replyfail(report);

    // Hapus pesan
    if (actionType === 'delete' || actionType === 'both') {
        await hydro.sendMessage(m.chat, { delete: m.key });
    }

    // Kick 
    if (actionType === 'kick' || actionType === 'both') {
        if (isBotAdmins) {
            await sleep(2000);
            await hydro.groupParticipantsUpdate(m.chat, [sender], 'remove');
        } else {
            await replyfail('⚠️ Bot bukan admin, tidak bisa melakukan kick.');
        }
    }
}

// ─── COMMAND HANDLER ───────────────────────────────────
/**
 * @param {object} hydro
 * @param {object} m
 * @param {object} opts
 * @param {boolean}  opts.isAdmins
 * @param {boolean}  opts.Ahmad
 * @param {string[]} opts.args
 * @param {string}   opts.text
 * @param {string}   opts.prefix
 * @param {function} opts.reply        — dari msgHelper
 * @param {function} opts.replytolak   — dari msgHelper
 * @param {function} opts.replysuccess — dari msgHelper
 * @param {function} opts.replyfail    — dari msgHelper
 * @param {function} opts.react        — dari msgHelper
 */
async function commandAntibot(hydro, m, {
    isAdmins, Ahmad, args, text, prefix,
    reply, replytolak, replysuccess, replyfail, react
}) {
    const mess = global.mess || {};

    if (!m.isGroup)              return replytolak(mess.only?.group  || 'Eh, Kak! Fitur ini bisanya buat grup nihh 🫂');
    if (!isAdmins && !Ahmad)     return replytolak(mess.only?.admin  || 'Fitur ini cuman bisa dipake admin grup yah! 🥳');

    const isAktif       = antibot.includes(m.chat);
    const currentAction = antibotSettings[m.chat] || 'delete';

    // Tidak ada argumen → tampilkan info
    if (!text) {
        return reply(
`🛡️ *SETTINGS ANTIBOT*

Status: *${isAktif ? 'AKTIF ✅' : 'MATI ❌'}*
Mode Sanksi: *${currentAction.toUpperCase()}*

*Cara Setting:*
• ${prefix}antibot on
• ${prefix}antibot off
• ${prefix}antibot set delete  — Hapus pesan saja
• ${prefix}antibot set kick    — Tendang saja
• ${prefix}antibot set both    — Hapus pesan & tendang`
        );
    }

    // ON
    if (args[0] === 'on') {
        if (isAktif) return replyfail('AntiBot sudah aktif sebelumnya.');
        antibot.push(m.chat);
        saveAntibot();
        await react('✅');
        return replysuccess(`✅ *AntiBot* berhasil *diaktifkan*.`);
    }

    // OFF
    if (args[0] === 'off') {
        if (!isAktif) return replyfail('AntiBot sudah mati sebelumnya.');
        const index = antibot.indexOf(m.chat);
        if (index !== -1) {
            antibot.splice(index, 1);
            saveAntibot();
        }
        await react('🔴');
        return replysuccess(`🔴 *AntiBot* berhasil *dimatikan*.`);
    }

    // SET MODE
    if (args[0] === 'set') {
        const mode = args[1];
        if (mode === 'delete') {
            antibotSettings[m.chat] = 'delete';
            saveAntibotSettings();
            await react('✅');
            return replysuccess('⚙️ Mode diubah: *Hanya Hapus Pesan*\n\n> Bot akan menghapus pesan yang terdeteksi sebagai bot.');
        }
        if (mode === 'kick') {
            antibotSettings[m.chat] = 'kick';
            saveAntibotSettings();
            await react('✅');
            return replysuccess('⚙️ Mode diubah: *Tendang Member*\n\n> Bot akan menendang member yang terdeteksi sebagai bot.');
        }
        if (mode === 'both') {
            antibotSettings[m.chat] = 'both';
            saveAntibotSettings();
            await react('✅');
            return replysuccess('⚙️ Mode diubah: *Hapus Pesan & Tendang*\n\n> Bot akan menghapus pesan sekaligus menendang member yang terdeteksi sebagai bot.');
        }
        return replyfail(
`⚠️ Opsi salah!\n\nPilih salah satu:\n• *delete* — Hapus pesan\n• *kick* — Tendang member\n• *both* — Hapus pesan & tendang`
        );
    }

    return replyfail(`Perintah tidak dikenal. Kirim *${prefix}antibot* untuk melihat cara penggunaan.`);
}

module.exports = {
    antibot,
    antibotSettings,
    saveAntibot,
    saveAntibotSettings,
    detectBot,
    handleAntibot,
    commandAntibot,
};