const fs = require('fs');

const antibotPath         = './database/antibot.json';
const antibotSettingsPath = './database/antibot-settings.json';
const antibotWarnPath     = './database/antibot-warn.json';

if (!fs.existsSync(antibotPath))         fs.writeFileSync(antibotPath, JSON.stringify([]));
if (!fs.existsSync(antibotSettingsPath)) fs.writeFileSync(antibotSettingsPath, JSON.stringify({}));
if (!fs.existsSync(antibotWarnPath))     fs.writeFileSync(antibotWarnPath, JSON.stringify({}));

let antibot         = JSON.parse(fs.readFileSync(antibotPath));
let antibotSettings = JSON.parse(fs.readFileSync(antibotSettingsPath));
let antibotWarn     = JSON.parse(fs.readFileSync(antibotWarnPath));

function saveAntibot()         { fs.writeFileSync(antibotPath, JSON.stringify(antibot, null, 2)); }
function saveAntibotSettings() { fs.writeFileSync(antibotSettingsPath, JSON.stringify(antibotSettings, null, 2)); }
function saveAntibotWarn()     { fs.writeFileSync(antibotWarnPath, JSON.stringify(antibotWarn, null, 2)); }

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

async function handleAntibot(hydro, m, { isAdmins, isBotAdmins, Ahmad, sleep, replyfail, replywarn, react }) {
    if (!m.isGroup) return;
    if (!antibot.includes(m.chat)) return;
    if (isAdmins || Ahmad || m.key.fromMe) return;

    const rawId  = String(m.key?.id || '');
    const sender = m.sender || m.key.participant || m.key.remoteJid;
    const { detected, reasons } = detectBot(rawId);
    if (!detected) return;

    const cfg        = antibotSettings[m.chat] || {};
    const actionType = cfg.mode || 'delete';
    const warnLimit  = cfg.warnLimit || 3;
    const timeNow    = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: true });
    const msgType    = (m.mtype || 'unknown').replace('Message', '').toLowerCase();

    if (actionType === 'warn') {
        if (!antibotWarn[m.chat]) antibotWarn[m.chat] = {};
        if (!antibotWarn[m.chat][sender]) antibotWarn[m.chat][sender] = 0;

        antibotWarn[m.chat][sender]++;
        const warnNow = antibotWarn[m.chat][sender];
        saveAntibotWarn();

        await hydro.sendMessage(m.chat, { delete: m.key });

        if (warnNow >= warnLimit) {
            const report =
`⚡ *${global.botname} Security* ⚡

👤 *User:* @${sender.split('@')[0]}
- Detected Client/Bot at ${timeNow}
- Message ID: ${rawId}
- Message Type: ${msgType}

🚫 *Reason Detected:*
${reasons.map(r => `> • ${r}`).join('\n')}

⚠️ *Warn:* ${warnNow}/${warnLimit}
🔨 *Punishment:* Kick from group`;

            await replywarn(report);

            antibotWarn[m.chat][sender] = 0;
            saveAntibotWarn();

            if (isBotAdmins) {
                await sleep(2000);
                await hydro.groupParticipantsUpdate(m.chat, [sender], 'remove');
            } else {
                await replyfail('⚠️ Bot bukan admin, tidak bisa melakukan kick.');
            }
        } else {
            const report =
`⚡ *${global.botname} Security* ⚡

👤 *User:* @${sender.split('@')[0]}
- Detected Client/Bot at ${timeNow}
- Message ID: ${rawId}
- Message Type: ${msgType}

🚫 *Reason Detected:*
${reasons.map(r => `> • ${r}`).join('\n')}

⚠️ *Warn:* ${warnNow}/${warnLimit}
🔨 *Punishment:* Message Deleted
> Will be kicked after ${warnLimit}x warnings!`;

            await replywarn(report);
        }

        return;
    }

    const sanksiLabel = {
        delete: 'Message Deleted',
        kick:   'Kick from group',
        both:   'Message Deleted & Kick from group',
    }[actionType] || 'Message Deleted';

    const report =
`⚡ *${global.botname} Security* ⚡

👤 *User:* @${sender.split('@')[0]}
- Detected Client/Bot at ${timeNow}
- Message ID: ${rawId}
- Message Type: ${msgType}

🚫 *Reason Detected:*
${reasons.map(r => `> • ${r}`).join('\n')}

🔨 *Punishment:* ${sanksiLabel}`;

    await replywarn(report);

    if (actionType === 'delete' || actionType === 'both') {
        await hydro.sendMessage(m.chat, { delete: m.key });
    }

    if (actionType === 'kick' || actionType === 'both') {
        if (isBotAdmins) {
            await sleep(2000);
            await hydro.groupParticipantsUpdate(m.chat, [sender], 'remove');
        } else {
            await replyfail('⚠️ Bot bukan admin, tidak bisa melakukan kick.');
        }
    }
}

async function commandAntibot(hydro, m, {
    isAdmins, Ahmad, args, text, prefix,
    reply, replytolak, replysuccess, replyfail, react
}) {
    const mess = global.mess || {};

    if (!m.isGroup)          return replytolak(mess.only?.group || 'Eh, Kak! Fitur ini bisanya buat grup nihh 🫂');
    if (!isAdmins && !Ahmad) return replytolak(mess.only?.admin || 'Fitur ini cuman bisa dipake admin grup yah! 🥳');

    const cfg           = antibotSettings[m.chat] || {};
    const isAktif       = antibot.includes(m.chat);
    const currentMode   = cfg.mode      || 'delete';
    const currentLimit  = cfg.warnLimit || 3;

    if (!text) {
        return reply(
`🛡️ *SETTINGS ANTIBOT*

Status: *${isAktif ? 'AKTIF ✅' : 'MATI ❌'}*
Mode Sanksi: *${currentMode.toUpperCase()}*${currentMode === 'warn' ? `\nBatas Warn: *${currentLimit}x*` : ''}

*Cara Setting:*
• ${prefix}antibot on
• ${prefix}antibot off
• ${prefix}antibot set delete       — Hapus pesan saja
• ${prefix}antibot set kick         — Tendang saja
• ${prefix}antibot set both         — Hapus & tendang
• ${prefix}antibot set warn <angka> — Peringatan sebelum kick
• ${prefix}antibot resetwarn        — Reset warn semua member
• ${prefix}antibot resetwarn <no>   — Reset warn 1 member`
        );
    }

    if (args[0] === 'on') {
        if (isAktif) return replyfail('Fitur AntiBot sudah aktif sebelumnya.');
        antibot.push(m.chat);
        saveAntibot();
        await react('✅');
        return replysuccess(`✅ *AntiBot* berhasil *diaktifkan*.`);
    }

    if (args[0] === 'off') {
        if (!isAktif) return replyfail('Fitur AntiBot sudah mati sebelumnya.');
        antibot.splice(antibot.indexOf(m.chat), 1);
        saveAntibot();
        await react('🔴');
        return replysuccess(`🔴 *AntiBot* berhasil *dimatikan*.`);
    }

    if (args[0] === 'resetwarn') {
        if (!antibotWarn[m.chat]) return replyfail('Belum ada data warn di grup ini.');

        const target = m.quoted?.sender
            ? m.quoted.sender
            : args[1]
            ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            : null;

        if (target) {
            if (!antibotWarn[m.chat]?.[target]) return replyfail(`Tidak ada data warn untuk @${target.split('@')[0]}.`);
            antibotWarn[m.chat][target] = 0;
            saveAntibotWarn();
            await react('✅');
            return replysuccess(`✅ Warn *@${target.split('@')[0]}* berhasil direset.`);
        } else {
            antibotWarn[m.chat] = {};
            saveAntibotWarn();
            await react('✅');
            return replysuccess('✅ Semua data warn di grup ini berhasil direset.');
        }
    }

    if (args[0] === 'set') {
        const mode = args[1];

        if (mode === 'delete') {
            antibotSettings[m.chat] = { ...cfg, mode: 'delete' };
            saveAntibotSettings();
            await react('✅');
            return replysuccess('⚙️ Mode diubah: *Hanya Hapus Pesan*\n\n> Bot akan menghapus pesan yang terdeteksi sebagai bot.');
        }
        if (mode === 'kick') {
            antibotSettings[m.chat] = { ...cfg, mode: 'kick' };
            saveAntibotSettings();
            await react('✅');
            return replysuccess('⚙️ Mode diubah: *Tendang Member*\n\n> Bot akan menendang member yang terdeteksi sebagai bot.');
        }
        if (mode === 'both') {
            antibotSettings[m.chat] = { ...cfg, mode: 'both' };
            saveAntibotSettings();
            await react('✅');
            return replysuccess('⚙️ Mode diubah: *Hapus Pesan & Tendang*\n\n> Bot akan menghapus pesan sekaligus menendang member yang terdeteksi sebagai bot.');
        }
        if (mode === 'warn') {
            const limit = parseInt(args[2]);
            if (!args[2] || isNaN(limit) || limit < 1)
                return replyfail(`⚠️ Masukkan jumlah peringatan!\nContoh: *${prefix}antibot set warn 3*`);

            antibotSettings[m.chat] = { ...cfg, mode: 'warn', warnLimit: limit };
            saveAntibotSettings();
            await react('✅');
            return replysuccess(`⚙️ Mode diubah: *Peringatan (Warn)*\n\n> Member yang terdeteksi bot akan mendapat peringatan.\n> Setelah *${limit}x* peringatan, akan ditendang.`);
        }

        return replyfail(
`⚠️ Opsi salah!\n\nPilih salah satu:\n• *delete* — Hapus pesan\n• *kick* — Tendang member\n• *both* — Hapus pesan & tendang\n• *warn <angka>* — Peringatan sebelum kick`
        );
    }

    return replyfail(`Perintah tidak dikenal. Kirim *${prefix}antibot* untuk melihat cara penggunaan.`);
}

module.exports = {
    antibot,
    antibotSettings,
    antibotWarn,
    saveAntibot,
    saveAntibotSettings,
    saveAntibotWarn,
    detectBot,
    handleAntibot,
    commandAntibot,
};