const fs     = require('fs');
const crypto = require('crypto');
const { generateWAMessageFromContent } = require('socketon');

// ─── DATABASE PATHS ───────────────────────────────────────────────
const PATH_RESELLER = './database/reseller.json';
const PATH_CADMIN   = './database/cadmingb.json';

function loadReseller() {
    if (!fs.existsSync(PATH_RESELLER))
        fs.writeFileSync(PATH_RESELLER, JSON.stringify({ reseller: [], resellergb: [] }, null, 2));
    return JSON.parse(fs.readFileSync(PATH_RESELLER));
}
function saveReseller(data) { fs.writeFileSync(PATH_RESELLER, JSON.stringify(data, null, 2)); }
function loadCadmin() {
    if (!fs.existsSync(PATH_CADMIN))
        fs.writeFileSync(PATH_CADMIN, JSON.stringify({ groups: [], users: {} }, null, 2));
    return JSON.parse(fs.readFileSync(PATH_CADMIN));
}
function saveCadmin(data) { fs.writeFileSync(PATH_CADMIN, JSON.stringify(data, null, 2)); }

// ─── PLAN SPEC ────────────────────────────────────────────────────
const PLANS = {
    '1gb':       { ram: '1024',  disk: '5123', cpu: '40'  },
    '2gb':       { ram: '2048',  disk: '5123', cpu: '80'  },
    '3gb':       { ram: '3064',  disk: '5123', cpu: '120' },
    '4gb':       { ram: '4123',  disk: '5123', cpu: '160' },
    '5gb':       { ram: '5123',  disk: '5123', cpu: '200' },
    '6gb':       { ram: '6123',  disk: '5123', cpu: '220' },
    '7gb':       { ram: '7123',  disk: '5123', cpu: '250' },
    '8gb':       { ram: '8123',  disk: '5123', cpu: '280' },
    '9gb':       { ram: '9123',  disk: '5123', cpu: '300' },
    '10gb':      { ram: '10240', disk: '5123', cpu: '400' },
    'unlimited': { ram: '0',     disk: '0',    cpu: '0'   },
    'unli':      { ram: '0',     disk: '0',    cpu: '0'   },
};
const PLAN_KEYS = Object.keys(PLANS);

// ─── API CONFIG GETTER ────────────────────────────────────────────
function getApi(useAdmin) {
    return useAdmin ? {
        domain: global.domain2, apikey: global.apikey2, email: global.email2,
        egg: global.egg2, nestid: global.nestid2, loc: global.loc2, nodeid: global.nodeid2,
    } : {
        domain: global.domain,  apikey: global.apikey,  email: global.email,
        egg: global.egg,        nestid: global.nestid,   loc: global.loc,  nodeid: global.nodeid,
    };
}

// ─── FETCH HELPER ─────────────────────────────────────────────────
async function fetchApi(url, method, apikey, body = null) {
    const opts = {
        method,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apikey }
    };
    if (body) opts.body = JSON.stringify(body);
    return (await fetch(url, opts)).json();
}

// ─── COOLDOWN HELPER ──────────────────────────────────────────────
function checkCooldown(m, isResellerGb, skip) {
    if (skip) return null;
    global.panelCd = global.panelCd || { grup: {}, personal: {} };
    const waktu = 5 * 60 * 1000, now = Date.now();
    const tipe  = isResellerGb ? 'grup' : 'personal';
    const key   = isResellerGb ? m.chat : m.sender;
    if (global.panelCd[tipe][key] && now - global.panelCd[tipe][key] < waktu)
        return Math.ceil((waktu - (now - global.panelCd[tipe][key])) / 60000);
    return null;
}
function setCooldown(m, isResellerGb) {
    global.panelCd = global.panelCd || { grup: {}, personal: {} };
    const tipe = isResellerGb ? 'grup' : 'personal';
    const key  = isResellerGb ? m.chat : m.sender;
    global.panelCd[tipe][key] = Date.now();
}

// ─── SERVER PICKER (interactiveMessage) ───────────────────────────
global._ownerServerPending = global._ownerServerPending || {};

async function sendServerPicker(hydro, m, prefix, pendingKey, pendingData) {
    global._ownerServerPending[m.sender] = {
        key: pendingKey, data: pendingData, chat: m.chat, time: Date.now()
    };

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                interactiveMessage: {
                    body: {
                        text: `🖥️ *Pilih Server Panel*\n\nMau buat di server mana?\n\n1️⃣ *Reseller API*\n2️⃣ *Admin API*`
                    },
                    footer: { text: global.botname },
                    header: { hasMediaAttachment: false },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '1️⃣ Reseller API',
                                    id: 'CPANEL_RESELLER'
                                })
                            },
                            {
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '2️⃣ Admin API',
                                    id: 'CPANEL_ADMIN'
                                })
                            }
                        ]
                    }
                }
            }
        }
    }, { quoted: m }, {});

    await hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
}

// ─── CEK PENDING PICKER ────────────────────────────────────────────
async function checkOwnerPending(hydro, m, { Ahmad, prefix, reply, replyfail, react }) {
    if (!Ahmad) return false;
    const pending = global._ownerServerPending?.[m.sender];
    if (!pending) return false;
    if (Date.now() - pending.time > 2 * 60 * 1000) {
        delete global._ownerServerPending[m.sender];
        return false;
    }

    // Baca button ID dari berbagai kemungkinan struktur message
    let buttonId = '';
    if (m.message?.buttonsResponseMessage?.selectedButtonId) {
        buttonId = m.message.buttonsResponseMessage.selectedButtonId;
    } else if (m.message?.interactiveResponseMessage) {
        try {
            buttonId = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id;
        } catch {}
    } else {
        buttonId = (m.body || '');
    }
    buttonId = buttonId.trim().toUpperCase();

    const isReseller = buttonId === 'CPANEL_RESELLER';
    const isAdmin    = buttonId === 'CPANEL_ADMIN';
    if (!isReseller && !isAdmin) return false;

    delete global._ownerServerPending[m.sender];
    const useAdmin = isAdmin;
    const { key, data } = pending;

    await react('⏱️');
    if      (key === 'cserver') await execCserver(hydro, m, data, useAdmin, { reply, replyfail });
    else if (key === 'spec')    await execSpec(hydro, m, data, useAdmin, { reply, replyfail });
    else if (key === 'cuser')   await execCuser(hydro, m, data, useAdmin, { reply, replyfail });
    else if (key === 'cadmin')  await execCadmin(hydro, m, data, useAdmin, { reply, replyfail });

    return true;
}

// ─── EXEC CSERVER ─────────────────────────────────────────────────
async function execCserver(hydro, m, { planInput, email, namaServer }, useAdmin, { reply, replyfail }) {
    const api  = getApi(useAdmin);
    const plan = PLANS[planInput.toLowerCase().trim()];
    if (!plan) return replyfail('Plan tidak valid!');

    const searchUser = await fetchApi(`${api.domain}/api/application/users?filter[email]=${email.trim()}`, 'GET', api.apikey);
    if (!searchUser.data?.length) return replyfail('User tidak ditemukan! Pastikan email sudah terdaftar.');
    const userId = searchUser.data[0].attributes.id;

    const eggData = await fetchApi(`${api.domain}/api/application/nests/${api.nestid}/eggs/${api.egg}`, 'GET', api.apikey);
    if (eggData.errors || !eggData.attributes) return replyfail('Gagal ambil data Egg! Cek Nest ID & Egg ID di settings.js');

    const srvRes = await fetchApi(`${api.domain}/api/application/servers`, 'POST', api.apikey, {
        name: namaServer.trim(), user: userId,
        egg: parseInt(api.egg), nodes: api.nodeid,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_21', startup: eggData.attributes.startup,
        environment: { INST: 'npm', USER_UPLOAD: '0', AUTO_UPDATE: '0', CMD_RUN: 'npm start' },
        limits: { memory: plan.ram, swap: 0, disk: plan.disk, io: 500, cpu: plan.cpu },
        feature_limits: { databases: 5, backups: 5, allocations: 5 },
        deploy: { locations: [parseInt(api.loc)], dedicated_ip: false, port_range: [] }
    });
    if (srvRes.errors) return replyfail(`Gagal buat server:\n${srvRes.errors[0].detail}`);

    reply(
`✅ *Server Berhasil Dibuat!*

*Server ID:* ${srvRes.attributes.id}
*Nama:* ${namaServer.trim()}
*Plan:* ${planInput.toUpperCase()}
*RAM:* ${plan.ram === '0' ? 'Unlimited' : plan.ram + ' MB'}
*CPU:* ${plan.cpu === '0' ? 'Unlimited' : plan.cpu + '%'}
*Disk:* ${plan.disk === '0' ? 'Unlimited' : plan.disk + ' MB'}
*Server:* ${useAdmin ? 'Admin API' : 'Reseller API'} — ${api.domain}`
    );
}

// ─── EXEC SPEC (1gb - unli) ───────────────────────────────────────
async function execSpec(hydro, m, { command, usernem, nomor, plan }, useAdmin, { reply, replyfail }) {
    const api      = getApi(useAdmin);
    const password = usernem + crypto.randomBytes(3).toString('hex');
    const email    = usernem + api.email;

    const userData = await fetchApi(`${api.domain}/api/application/users`, 'POST', api.apikey, {
        email, username: usernem, first_name: usernem, last_name: 'Server', language: 'en', password
    });
    if (userData.errors) return replyfail(`Error Pterodactyl:\n${userData.errors[0].detail}`);

    const eggData = await fetchApi(`${api.domain}/api/application/nests/${api.nestid}/eggs/${api.egg}`, 'GET', api.apikey);
    if (eggData.errors || !eggData.attributes) return replyfail('Gagal ambil data Egg! Cek Nest ID & Egg ID di settings.js');

    const srvRes = await fetchApi(`${api.domain}/api/application/servers`, 'POST', api.apikey, {
        name: usernem + ' Server', user: userData.attributes.id,
        egg: parseInt(api.egg), nodes: api.nodeid,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_21', startup: eggData.attributes.startup,
        environment: { INST: 'npm', USER_UPLOAD: '0', AUTO_UPDATE: '0', CMD_RUN: 'npm start' },
        limits: { memory: plan.ram, swap: 0, disk: plan.disk, io: 500, cpu: plan.cpu },
        feature_limits: { databases: 5, backups: 5, allocations: 5 },
        deploy: { locations: [parseInt(api.loc)], dedicated_ip: false, port_range: [] }
    });
    if (srvRes.errors) return replyfail(`Error Create Server:\n${srvRes.errors[0].detail}`);

    const server = srvRes.attributes;
    const teks =
`*Berikut Detail Akun Panel Kamu 📦*

*📡 ID Server:* ${server.id}
*👤 Username:* ${userData.attributes.username}
*🔐 Password:* ${password}
*🗓️ Dibuat:* ${new Date().toLocaleDateString('id-ID')}

*🌐 Spesifikasi Server*
• RAM: *${plan.ram === '0' ? 'Unlimited' : (parseInt(plan.ram)/1024).toFixed(0) + ' GB'}*
• Disk: *${plan.disk === '0' ? 'Unlimited' : plan.disk + ' MB'}*
• CPU: *${plan.cpu === '0' ? 'Unlimited' : plan.cpu + '%'}*
• Login: *${api.domain}*
• Server: *${useAdmin ? 'Admin API' : 'Reseller API'}*

_Syarat & Ketentuan:_
• Expired panel 1 bulan
• Simpan data ini baik-baik
• Jangan lupa ganti password`;

    if (nomor === m.chat) {
        reply(teks);
    } else {
        await hydro.sendMessage(nomor, { text: teks });
        reply(`Akun panel *${usernem}* berhasil dibuat! ✅\nData login dikirim ke WhatsApp target.`);
    }
}

// ─── EXEC CUSER ───────────────────────────────────────────────────
async function execCuser(hydro, m, { nama, email, pw }, useAdmin, { reply, replyfail }) {
    const api      = getApi(useAdmin);
    const username = nama.toLowerCase().replace(/[^a-z0-9]/g, '');
    const finalEmail  = email?.trim() || username + api.email;
    const password    = pw?.trim()    || username + crypto.randomBytes(3).toString('hex');

    const data = await fetchApi(`${api.domain}/api/application/users`, 'POST', api.apikey, {
        email: finalEmail, username, first_name: nama.trim(), last_name: 'User', language: 'en', password
    });
    if (data.errors) return replyfail(`Gagal: ${data.errors[0].detail}`);

    const teks =
`*User Berhasil Dibuat! (${useAdmin ? 'Admin API' : 'Reseller API'})*

*ID:* ${data.attributes.id}
*Username:* ${username}
*Email:* ${finalEmail}
*Password:* ${password}
*Login:* ${api.domain}`;

    const target = m.isGroup ? m.sender : m.chat;
    if (target === m.chat) { reply(teks); }
    else { await hydro.sendMessage(target, { text: teks }); reply('✅ Data login dikirim ke DM kamu.'); }
}

// ─── EXEC CADMIN ──────────────────────────────────────────────────
async function execCadmin(hydro, m, { nama, target }, useAdmin, { reply, replyfail }) {
    const api      = getApi(useAdmin);
    const username = nama.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email    = username + api.email;
    const password = username + crypto.randomBytes(4).toString('hex');

    const data = await fetchApi(`${api.domain}/api/application/users`, 'POST', api.apikey, {
        email, username, first_name: nama.trim(), last_name: 'Admin',
        language: 'en', root_admin: true, password
    });
    if (data.errors) return replyfail(`Gagal buat admin:\n${data.errors[0].detail}`);

    const msg =
`*AKUN ADMIN PANEL BERHASIL DIBUAT! ✅*

*Username:* ${username}
*Email:* ${email}
*Password:* ${password}
*Login:* ${api.domain}
*Server:* ${useAdmin ? 'Admin API' : 'Reseller API'}

_Mohon simpan data ini baik-baik._`;

    if (target === m.chat) { reply(msg); }
    else { await hydro.sendMessage(target, { text: msg }); reply(`Akun Admin *${username}* berhasil dibuat! ✅\nData dikirim ke WhatsApp target.`); }
}

module.exports = {
    loadReseller, saveReseller, loadCadmin, saveCadmin,
    PLANS, PLAN_KEYS, getApi,
    sendServerPicker, checkOwnerPending,
    execCserver, execSpec, execCuser, execCadmin,
    checkCooldown, setCooldown,
};