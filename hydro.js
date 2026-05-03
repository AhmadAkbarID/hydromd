/*
• SCRIPT INI GRATIS 100%
• BEBAS RECODE 
• JANGAN DI JUAL
*/

require('./settings');
require('./lib/listmenu');

// ====== REQUIRE AREA & LIB START ======

const { 
    modul 
} = require('./lib/module');
const {
    runtime,
    formatp,
    getSizeMedia,
    sleep,
    axiosss,
    getMenuList,
    assertInstalled,
    listbut2,
    supabase,
    HydroFitur,
    getRandom,
    getBuffer
} = require('./lib/function');
const { 
    initDatabase,
    getLimitCost,
    checkLimit,
    useLimit
} = require('./lib/database');
const {
    makeBrat,
    makeBratVid,
    toSticker,
    makeQC,
    addExif,
    BALogo,
    makeStoryIG
} = require('./lib/maker');
const { 
    searchDaerah 
} = require('./lib/jadwalsholat');
const { 
    antilinkDetector 
} = require('./lib/protect');

// ====== LIB END & CONST START ======

const { 
    axios,
    baileys, 
    util,
    exec,
    performance,
    os, 
    moment,
    crypto,
    fs,
    yts,
    path,
    chalk,
    QuickChart  
} = modul;
const { 
    BufferJSON, 
    WA_DEFAULT_EPHEMERAL, 
    generateWAMessageFromContent, 
    downloadContentFromMessage, 
    extractImageThumb,
    proto, 
    generateWAMessageContent, 
    generateWAMessage, 
    prepareWAMessageMedia, 
    areJidsSameUser, 
    getContentType, 
    generateForwardMessageContent 
} = baileys;

// ====== MODULE END & SCRAPE START ======

const { 
    tiktokDl 
} = require('./lib/scrape/tiktok.js')
const {
    igdl 
} = require('./lib/scrape/instagram.js');
const {
    mathgpt
} = require('./lib/scrape/mathgpt.js');  
const { 
    FeloClient 
} = require('./lib/scrape/feloai.js');
const { 
    chatex 
} = require('./lib/scrape/chatexai.js');
const ReactChannel 
  = require('./lib/scrape/reactch.js');
const { 
    searchPinterestAPI 
} = require('./lib/scrape/pin-search.js')
const {
    searchDafont
} = require('./lib/scrape/dafont.js')
const { 
    searchSpotify 
} = require('./lib/scrape/naze.js');
const {
    ytmp3, 
    ytmp4
} = require('./lib/scrape/youtube.js');
const { 
    spotifyScrape 
} = require("./lib/scrape/spotify.js");

// ====== SCRAPE END & REQUIRE AREA ======

if (!global.db) {
    if (fs.existsSync('./database/database.json')) {
        global.db = JSON.parse(fs.readFileSync('./database/database.json', 'utf-8'))
    } else {
        global.db = { users: {}, groups: {}, chats: {}, settings: {}, others: {} }
    }
}
if (!global.db.settings) global.db.settings = {}

// ==========================================================

module.exports = hydro = async (hydro, m, chatUpdate, store) => {
try {
    if (!m || !m.message) return;

    m.chat = m.key.remoteJid || '';
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = m.key.fromMe ? (hydro.user.id.split(':')[0]+'@s.whatsapp.net' || hydro.user.id) : (m.key.participant || m.key.remoteJid || '');
    m.pushName = m.pushName || "Misterius";
    
    m.mtype = getContentType(m.message);
    if (m.mtype === 'ephemeralMessage' || m.mtype === 'viewOnceMessage' || m.mtype === 'viewOnceMessageV2') {
        m.message = m.message[m.mtype].message;
        m.mtype = getContentType(m.message);
    }
    
    // ----------------------------------------------------
    
    m.mtype = getContentType(m.message);
    if (m.mtype === 'ephemeralMessage' || m.mtype === 'viewOnceMessage' || m.mtype === 'viewOnceMessageV2') {
        m.message = m.message[m.mtype].message;
        m.mtype = getContentType(m.message);
    }
    
    // ----------------------------------------------------
    
    const msgHelper = require('./lib/src/message')(hydro, m, chatUpdate, store);
    m = msgHelper.m;
    const { reply, replytolak, replyquery, replysuccess, replyfail, replywait, appenTextMessage, react, replylimit } = msgHelper;
    const rawContext = m.message?.[m.mtype]?.contextInfo;
    
    if (rawContext && rawContext.quotedMessage) {
        let qMsg = rawContext.quotedMessage;
        
        if (qMsg.viewOnceMessageV2) qMsg = qMsg.viewOnceMessageV2.message;
        else if (qMsg.viewOnceMessage) qMsg = qMsg.viewOnceMessage.message;
        else if (qMsg.viewOnceMessageV2Extension) qMsg = qMsg.viewOnceMessageV2Extension.message;

        let qType = getContentType(qMsg) || Object.keys(qMsg)[0];
        
        m.quoted = {
            key: {
                remoteJid: m.chat,
                fromMe: rawContext.participant === hydro.user.id.split(':')[0] + '@s.whatsapp.net',
                id: rawContext.stanzaId,
                participant: rawContext.participant
            },
            message: qMsg,
            mtype: qType,
            msg: qMsg[qType],
            sender: rawContext.participant,
            text: qMsg.conversation || qMsg[qType]?.text || qMsg[qType]?.caption || '',
            fakeObj: {
                key: {
                    remoteJid: m.chat,
                    fromMe: rawContext.participant === hydro.user.id.split(':')[0] + '@s.whatsapp.net',
                    id: rawContext.stanzaId,
                    participant: rawContext.participant
                },
                message: qMsg
            },
            download: async () => {
                let mediaType = qType.replace('Message', '');
                let stream = await downloadContentFromMessage(qMsg[qType], mediaType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                return buffer;
            }
        };
    }

    m.download = async () => {
        let mediaType = m.mtype.replace('Message', '');
        let stream = await downloadContentFromMessage(m.message[m.mtype], mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };
    
    // ----------------------------------------------------

    const type = m.mtype;
    
    let body = '';
    if (m.mtype === 'interactiveResponseMessage' || m.message?.interactiveResponseMessage) {
        try {
            let interMsg = m.message.interactiveResponseMessage || m.message[m.mtype];
            body = JSON.parse(interMsg.nativeFlowResponseMessage.paramsJson).id;
        } catch (e) {
            body = '';
        }
    } else {
        body = (m.mtype === 'conversation') ? m.message.conversation : 
             (m.mtype === 'imageMessage') ? m.message.imageMessage?.caption : 
             (m.mtype === 'videoMessage') ? m.message.videoMessage?.caption : 
             (m.mtype === 'extendedTextMessage') ? m.message.extendedTextMessage?.text : 
             (m.mtype === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage?.selectedButtonId : 
             (m.mtype === 'listResponseMessage') ? m.message.listResponseMessage?.singleSelectReply?.selectedRowId : 
             (m.mtype === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage?.selectedId : 
             m.text || '';
    }

    body = (typeof body === 'string') ? body : '';

    let budy = m.message.conversation || (m.message.extendedTextMessage && m.message.extendedTextMessage.text) || '';
    
    let groupSettings = m.isGroup ? global.db.groups[m.chat] : null;
    let activePrefixes = (groupSettings && groupSettings.prefix) ? groupSettings.prefix : 
                         (global.db.settings.prefix ? global.db.settings.prefix : global.prefix);
                         
    if (!Array.isArray(activePrefixes)) activePrefixes = [activePrefixes];

    let matchedPrefix = activePrefixes.slice().sort((a, b) => b.length - a.length).find(p => body.startsWith(p));
    const prefix = matchedPrefix !== undefined ? matchedPrefix : activePrefixes[0];
    
    const isCmd = body.startsWith(prefix)
    const from = m.chat
    const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : ""
    const args = body.trim().split(/ +/).slice(1)
    
    const pushname = m.pushName
    const botNumber = await hydro.decodeJid(hydro.user.id)
    const Ahmad = [...(global.owner || []), global.ownernomer, global.botnumber]
        .map(v => v ? v.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '')
        .includes(m.sender);
    
    if (typeof global.db.settings.public === 'undefined') global.db.settings.public = true;
    if (typeof global.db.settings.onlygc === 'undefined') global.db.settings.onlygc = false;
    if (typeof global.db.settings.onlypc === 'undefined') global.db.settings.onlypc = false;
    if (typeof global.db.settings.whitelistMode === 'undefined') global.db.settings.whitelistMode = false;
    if (!Array.isArray(global.db.settings.whitelist)) global.db.settings.whitelist = [];

    const rawId = String(m.key.id || '');
    const baseId = rawId.split('-')[0];

    const isStatusMsg = (m.mtype === 'groupStatusMentionMessage' || m.mtype === 'groupStatusMessageV2');

    if (!isStatusMsg) {
        if (baseId.startsWith('BAE5') || baseId.length === 16) return;

        let isOtherBot = false;
        if (baseId.match(/[^0-9A-F]/gi)) isOtherBot = true;
        if (baseId.length !== 32 && !baseId.startsWith('3EB0') && !baseId.startsWith('3A')) isOtherBot = true;
        if (isOtherBot && !Ahmad && !m.key.fromMe) return;
    }

    if (!global.db.settings.public) {
        if (!Ahmad && !m.key.fromMe) return;
    }

    if (global.db.settings.onlygc && !m.isGroup && !Ahmad) return;
    if (global.db.settings.onlypc && m.isGroup && !Ahmad) return;
    if (m.isGroup) {
        if (!global.db.sewa) global.db.sewa = {};
        if (global.db.sewa[m.chat] && global.db.sewa[m.chat].status === 'pending') {
            global.db.sewa[m.chat].status = 'active';
            global.db.sewa[m.chat].expired = Date.now() + global.db.sewa[m.chat].duration;
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            hydro.sendMessage(m.chat, { text: `✅ Berhasil bergabung!\n\nWaktu sewa selama *${global.db.sewa[m.chat].hari} hari* resmi dimulai dari sekarang.` });
        }
    }

    if (global.db.settings.whitelistMode && m.isGroup && !Ahmad) {
        let isSewa = global.db.sewa && global.db.sewa[m.chat] && global.db.sewa[m.chat].status === 'active';
        if (!global.db.settings.whitelist.includes(m.chat) && !isSewa) return;
    }
    
    const text = args.join(" ")
    const q = text
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ''
    
    // Media Checks
    const isMedia = /image|video|sticker|audio/.test(mime)
    const isImage = (type == 'imageMessage')
    const isVideo = (type == 'videoMessage')
    const isAudio = (type == 'audioMessage')
    const isSticker = (type == 'stickerMessage')

    store.groupMetadata = store.groupMetadata || {};
        const invalidMembers = [];

        if (m.isGroup) {
            for (const [gid, meta] of Object.entries(store.groupMetadata || {})) {
                if (!meta.participants) continue;
                const missing = meta.participants.filter(p => !p.jid && !p.lid && p.id);
                if (missing.length) {
                    invalidMembers.push({
                        groupId: gid,
                        groupName: meta.subject || "Tanpa Nama",
                        members: missing
                    });
                }
            }

            if (Object.keys(store.groupMetadata).length === 0 || invalidMembers.length >= 1) {
                store.groupMetadata = await hydro.groupFetchAllParticipating();
            }
        }

        const groupMetadata = m.isGroup
            ? store.groupMetadata[m.chat]
            || (store.groupMetadata[m.chat] = await hydro.groupMetadata(m.chat).catch(e => {}))
            : '';

        const groupName = m.isGroup ? groupMetadata.subject : ''
    const participants = m.isGroup ? await groupMetadata.participants : ''

    if (m.isGroup && m.sender.endsWith("@lid")) {
        m.sender = participants.find(p => p.lid === m.sender)?.jid || m.sender;
    }

    const groupAdmins = m.isGroup ? participants.filter((v) => v.admin !== null).map((i) => i.jid || i.id) : [];
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
    const isGroupAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false

    if (m.isGroup && isCmd) {
        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {}
        if (global.db.groups[m.chat].mute && !isGroupAdmins && !Ahmad) {
            return
        }
    }
    
    const sender = m.sender
    const senderNumber = sender ? sender.split('@')[0] : ''

    const mentionUser = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
    const mentionByTag = type == 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo != null ? m.message.extendedTextMessage.contextInfo.mentionedJid : []
    const mentionByReply = type == 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo != null ? m.message.extendedTextMessage.contextInfo.participant || '' : ''
    
    const isChannel = m.chat.endsWith('@newsletter');

    if (fs.existsSync('./database/owner.json')) {
    let extraOwner = JSON.parse(fs.readFileSync('./database/owner.json'));
    extraOwner.forEach(num => {
        if (!global.owner.includes(num)) global.owner.push(num);
    });
}
    
    if (m.message && !m.key.fromMe) { 
        const timeLog = chalk.green(new Date().toISOString().slice(0, 19).replace('T', ' '));
        const msgLog = chalk.blue(budy || m.mtype);
        

        if (isChannel) {
            console.log(`
┌───────── [ CHANNEL CHAT LOG ] ─────────┐
│ 🕒 Time      : ${timeLog}
│ 📝 Message   : ${msgLog}
│ 📢 Channel   : ${chalk.magenta(pushname || 'Saluran')} (${chalk.cyan(m.chat)})
└────────────────────────────────────────┘
            `);
        } else if (m.isGroup) {
            console.log(`
┌────────── [ GROUP CHAT LOG ] ──────────┐
│ 🕒 Time      : ${timeLog}
│ 📝 Message   : ${msgLog}
│ 👤 Sender    : ${chalk.magenta(pushname)} (${chalk.cyan(m.sender)})
│ 🏠 Group     : ${chalk.yellow(groupName)} (${chalk.cyan(m.chat)})
└────────────────────────────────────────┘
            `);
        } else {
            console.log(`
┌───────── [ PRIVATE CHAT LOG ] ─────────┐
│ 🕒 Time      : ${timeLog}
│ 📝 Message   : ${msgLog}
│ 👤 Sender    : ${chalk.magenta(pushname)} (${chalk.cyan(m.sender)})
└────────────────────────────────────────┘
            `);
        }
    }
    
// ====== FUNCTION AREA ======

initDatabase(m, isChannel);
await antilinkDetector(hydro, m, { budy, type, isAdmins, Ahmad, isBotAdmins, sender, senderNumber });



// ====== FUNCTION AREA ======
    // ==============================================
    
switch (command) {
    
    case 'menu': { 
        if (args[0] === 'owner') return reply(global.ownermenu(prefix));
        if (args[0] === 'group') return reply(global.groupmenu(prefix));
        if (args[0] === 'downloader') return reply(global.downloadermenu(prefix));
        if (args[0] === 'other' || args[0] === 'others') return reply(global.othermenu(prefix));
        if (args[0] === 'maker') return reply(global.makermenu(prefix));
        if (args[0] === 'convert') return reply(global.convertmenu(prefix));
        if (args[0] === 'ai') return reply(global.aimenu(prefix));
        if (args[0] === 'all') return reply(global.allmenu(prefix));

        let rata2 = '5.0';
        let totalRating = 0;
        
        try {
            if (typeof supabase !== 'undefined') {
                let { data, error } = await supabase.from('ratings').select('nilai'); 
                if (data) {
                    let semuaRating = data.map(r => r.nilai);
                    rata2 = (semuaRating.reduce((a, b) => a + b, 0) / semuaRating.length).toFixed(1);
                    totalRating = semuaRating.length;
                }
            }
        } catch (e) {}

        const fileContent = fs.readFileSync(__filename, 'utf8');
        const totalFitur = (fileContent.match(/case '/g) || []).length;

        await react('🌊');
        
        let teks = (`✨━━━〔 🏞️ *𝐌𝐞𝐧𝐮 𝐔𝐭𝐚𝐦𝐚* 〕━━━✨

➤ 👤 Usᴇʀ : *${pushname}*
➤ 👑 Rᴀɴᴋ : *${Ahmad ? 'Pemilik 👨‍💻' : 'Free User'}*
➤ 👥 Tᴏᴛᴀʟ Pᴇɴɢɢᴜɴᴀ : *${Object.keys(global.db.users).length}*
➤ ⭐ Rᴀᴛɪɴɢ : *${rata2}* dari *${totalRating}* pengguna
➤ ⚒️ Tᴏᴛᴀʟ Fɪᴛᴜʀ : *${HydroFitur()} ғɪᴛᴜʀ*

✨━━━〔 📱 *𝐒𝐨𝐬𝐢𝐚𝐥 𝐌𝐞𝐝𝐢𝐚* 〕━━━✨

➤ 🪀 Wʜᴀᴛsᴀᴘᴘ : *wa.me/${global.ownernomer}*
➤ 🌐 ʙᴜʏ ᴘᴀɴᴇʟ ᴅɪ : store.hydrohost.web.id
➤ 📨 Tᴇʟᴇɢʀᴀᴍ : *t.me/${global.tele}*
➤ 📸 ɪɴsᴛᴀɢʀᴀᴍ : *www.instagram.com/${global.ig}*

✨━━━〔 🤖 *𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐬𝐢 𝐁𝐨𝐭* 〕━━━✨

➤ 🤖 Nᴀᴍᴀ Bᴏᴛ : *${global.botname}*
➤ ⏱️ Aᴋᴛɪғ Sᴇʟᴀᴍᴀ : *${runtime(process.uptime())}*

✨━━━〔 🎉 *𝐓𝐞𝐧𝐭𝐚𝐧𝐠 𝐊𝐚𝐦𝐢* 〕━━━✨

ʀᴇsᴘᴏɴ ᴄᴇᴘᴀᴛ <1 ᴅᴇᴛɪᴋ!
ʀᴜᴛɪɴ ᴘᴇɴɢᴇᴄᴇᴋᴀɴ
sᴜᴘᴘᴏʀᴛ ᴠᴘs/ᴘᴀɴᴇʟ

╭─〔 💡 *𝐊𝐚𝐭𝐚 𝐏𝐞𝐧𝐠𝐞𝐦𝐛𝐚𝐧𝐠* 〕─╮
│ _"Kami terus berinovasi_  
│ _untuk memberikan pengalaman_  
│ _terbaik dalam setiap interaksi."_
╰────────────────────╯

🚀 *Pᴏᴡᴇʀᴇᴅ Bʏ ${global.botname}*`)

        const bet = getMenuList(prefix);
        await listbut2(hydro, m, teks, bet)
        
        if (global.music && typeof global.music === 'string' && global.music.trim() !== '') {
            let audioSource;
            let isAudioValid = false;
            
            if (global.music.startsWith('http')) {
                audioSource = { url: global.music };
                isAudioValid = true;
            } else if (fs.existsSync(global.music)) {
                audioSource = fs.readFileSync(global.music);
                isAudioValid = true;
            }

            if (isAudioValid) {
                try {
                    await hydro.sendMessage(m.chat, { audio: audioSource, mimetype: 'audio/mp4', ptt: true }, { quoted: m });
                } catch (e) {
                }
            }
        }
    }
            break
    case 'ownermenu':
    case 'menuowner': {
        let teks = global.ownermenu(prefix);
        let bet = getMenuList(prefix);
        await listbut2(hydro, m, teks, bet);
    }
            break
    case 'downloadmenu':
    case 'downloadermenu':
    case 'menudownloader': {
        let teks = global.downloadermenu(prefix);
        let bet = getMenuList(prefix);
        await listbut2(hydro, m, teks, bet);
    }
            break
    case 'groupmenu':
    case 'menugroup': {
        let teks = global.groupmenu(prefix);
        let bet = getMenuList(prefix);
        await listbut2(hydro, m, teks, bet);
    }
            break
        
    case 'othermenu':
    case 'othersmenu':
    case 'menuother': {
        let teks = global.othermenu(prefix);
        let bet = getMenuList(prefix);
        await listbut2(hydro, m, teks, bet);
    }
            break
    case 'allmenu':
    case 'menuall': {
        let teks = global.allmenu(prefix);
        let bet = getMenuList(prefix);
        await listbut2(hydro, m, teks, bet);
    }
            break
    case 'makermenu': 
    case 'menumaker': {
        let teks = global.makermenu(prefix);
        let bet = getMenuList(prefix);
        await listbut2(hydro, m, teks, bet);
    }
            break
    case 'convertmenu': 
    case 'menuconvert': {
        let teks = global.convertmenu(prefix);
        let bet = getMenuList(prefix);
        await listbut2(hydro, m, teks, bet);
    }
            break
    case 'aimenu':
    case 'menuai': {
        let teks = global.aimenu(prefix);
        let bet = getMenuList(prefix);
        await listbut2(hydro, m, teks, bet);
    }
            break

// ====== OWNER FEATURE ======

    case 'addowner': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            
            let num;
            if (m.quoted) num = m.quoted.sender.split('@')[0]
            else if (m.mentionedJid && m.mentionedJid[0]) num = m.mentionedJid[0].split('@')[0]
            else if (args[0]) num = args[0].replace(/[^0-9]/g, '')
            else return replyquery('reply pesannya, atau ketik nomornya!\nContoh: *.addowner 628xx*')
            
            let targetJid = num + '@s.whatsapp.net'

            if (global.owner.includes(num)) return replyfail(`Gagal, @${num} sudah ada di dalam daftar owner!`)
            
            global.owner.push(num)
            
            let extraOwner = fs.existsSync('./database/owner.json') ? JSON.parse(fs.readFileSync('./database/owner.json')) : []
            if (!extraOwner.includes(num)) extraOwner.push(num)
            fs.writeFileSync('./database/owner.json', JSON.stringify(extraOwner, null, 2))
            
            replysuccess(`👑 Berhasil menambahkan @${num} sebagai Owner!`)
        }
        break
    case 'delowner': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            
            let num;
            if (m.quoted) num = m.quoted.sender.split('@')[0]
            else if (m.mentionedJid && m.mentionedJid[0]) num = m.mentionedJid[0].split('@')[0]
            else if (args[0]) num = args[0].replace(/[^0-9]/g, '')
            else return replyquery('reply pesannya, atau ketik nomornya!\nContoh: *.delowner 628xx*')
            
            let targetJid = num + '@s.whatsapp.net'

            if (!global.owner.includes(num)) return replyfail(`@${num} memang bukan owner dari awal!`)
            
            let extraOwner = fs.existsSync('./database/owner.json') ? JSON.parse(fs.readFileSync('./database/owner.json')) : []
            
            if (!extraOwner.includes(num)) return replytolak('❌ Wahaha, Kamu dilarang menghapus nomor bawaan!')
            
            let index = global.owner.indexOf(num)
            if (index > -1) global.owner.splice(index, 1)
            
            let extraIndex = extraOwner.indexOf(num)
            if (extraIndex > -1) {
                extraOwner.splice(extraIndex, 1)
                fs.writeFileSync('./database/owner.json', JSON.stringify(extraOwner, null, 2))
            }
            
            replysuccess(`🗑️ Berhasil menghapus akses Owner sang @${num}!`)
        }
        break
    case 'public': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            if (global.db.settings.public) return replyquery('Bot sudah dalam mode Public!')
            global.db.settings.public = true
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
            replysuccess('Berhasil mengubah mode ke *Public*')
        }
        break
    case 'self': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            if (!global.db.settings.public) return replyquery('Bot sudah dalam mode Self!')
            global.db.settings.public = false
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
            replysuccess('Berhasil mengubah mode ke *Self*')
        }
        break
    case 'onlygc': case 'onlygroup': case 'onlygb': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            if (args[0] === 'on') {
                if (global.db.settings.onlygc) return replyquery('Bot sudah dalam mode Only Group!')
                global.db.settings.onlygc = true
                global.db.settings.onlypc = false
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
                replysuccess('Berhasil mengubah mode ke *Only Group*')
            } else if (args[0] === 'off') {
                if (!global.db.settings.onlygc) return replyquery('Mode Only Group memang sudah mati!')
                global.db.settings.onlygc = false
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
                replysuccess('Berhasil mematikan mode *Only Group*')
            } else {
                replyquery('Pilih on atau off!\nContoh: *.onlygc on*')
            }
        }
        break
    case 'onlypc': case 'onlyprivate': case 'onlypm': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            if (args[0] === 'on') {
                if (global.db.settings.onlypc) return replyquery('Bot sudah dalam mode Only Private Chat!')
                global.db.settings.onlypc = true
                global.db.settings.onlygc = false
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
                replysuccess('Berhasil mengubah mode ke *Only Private Chat*')
            } else if (args[0] === 'off') {
                if (!global.db.settings.onlypc) return replyquery('Mode Only Private Chat memang sudah mati!')
                global.db.settings.onlypc = false
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
                replysuccess('Berhasil mematikan mode *Only Private Chat*')
            } else {
                replyquery('Pilih on atau off!\nContoh: *.onlypc on*')
            }
        }
        break
    case 'towl': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            if (args[0] === 'on') {
                if (global.db.settings.whitelistMode) return replyquery('Mode Whitelist sudah aktif!')
                global.db.settings.whitelistMode = true
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
                replysuccess(global.mess.on)
            } else if (args[0] === 'off') {
                if (!global.db.settings.whitelistMode) return replyquery('Mode Whitelist memang sudah mati!')
                global.db.settings.whitelistMode = false
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
                replysuccess(global.mess.off)
            } else {
                replyquery(`${global.mess.query.text}\n\nPilih on atau off!\nContoh: *.towl on*`)
            }
        }
        break
    case 'addwl': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            let target = m.isGroup ? m.chat : (args[0] ? args[0] + '@g.us' : null)
            
            if (!target) return replyquery(`${global.mess.query.text}\n\nGunakan perintah ini di dalam grup, atau ketik ID Grupnya!\nContoh: *.addwl*`)
            
            if (global.db.settings.whitelist.includes(target)) return replyquery("⚠️ Grup ini sudah ada di *whitelist*.")
            
            global.db.settings.whitelist.push(target)
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
            replysuccess("✅ Grup ini berhasil ditambahkan ke *whitelist*.")
        }
        break
    case 'delwl': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            let wl = global.db.settings.whitelist || []

            if (!m.isGroup && !args[0]) {
                if (wl.length === 0) return replyquery('Daftar Whitelist saat ini kosong!')

                let caption = wl.map((jid, i) => {
                    let meta = store.groupMetadata[jid]
                    let namaGc = meta ? meta.subject : '-'
                    return {
                        header: "",
                        title: `${i + 1}. ${namaGc}`,
                        description: `ID: ${jid}`,
                        id: `.delwl ${jid}`
                    }
                })

                let msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: {
                                body: {
                                    text: `List Group`,
                                },
                                footer: {
                                    text: `${global.botname}`
                                },
                                header: {
                                    title: "Daftar Whitelist Grup",
                                    subtitle: "",
                                    hasMediaAttachment: false,
                                },
                                nativeFlowMessage: {
                                    buttons: [
                                        {
                                            name: "single_select",
                                            buttonParamsJson: JSON.stringify({
                                                title: "PILIH GRUP",
                                                sections: [
                                                    {
                                                        title: "Daftar Grup Whitelist",
                                                        rows: caption
                                                    }
                                                ]
                                            })
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }, { quoted: m }, {});
                
                return await hydro.relayMessage(msg.key.remoteJid, msg.message, {
                    messageId: msg.key.id
                });
            }

            let target = m.isGroup ? m.chat : (args[0] ? (args[0].includes('@g.us') ? args[0] : args[0] + '@g.us') : null)
            
            if (!target) return replyquery(`${global.mess.query.text}\n\nGunakan perintah ini di dalam grup, atau ketik ID Grupnya!`)
            
            let index = wl.indexOf(target)
            if (index === -1) return replyquery("⚠️ Grup ini tidak ada di *whitelist*.")
            
            wl.splice(index, 1)
            global.db.settings.whitelist = wl
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
            
            let meta = store.groupMetadata[target]
            let namaGc = meta ? meta.subject : target

            replysuccess(`Berhasil menghapus *${namaGc}* dari daftar Whitelist! 🗑️`)
        }
        break
    case 'listwl': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            let wl = global.db.settings.whitelist
            if (wl.length === 0) return replyquery('Daftar Whitelist saat ini kosong!')
            
            let teksWl = `*📜 Daftar Grup Whitelist:*\n\n`
            for (let i = 0; i < wl.length; i++) {
                let meta = store.groupMetadata[wl[i]]
                let namaGc = meta ? meta.subject : '-i'
                teksWl += `*${i + 1}.* ${namaGc}\n└ 🆔: ${wl[i]}\n\n`
            }
            teksWl += `📊 *Total:* ${wl.length} Grup`
            
            reply(teksWl)
        }
        break
    case 'resetwl': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            if (global.db.settings.whitelist.length === 0) return replyquery('Daftar Whitelist sudah kosong dari awal!')
            
            global.db.settings.whitelist = []
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
            replysuccess(`${global.mess.success}\n\nSemua grup telah dihapus dari daftar Whitelist. 💥`)
        }
        break
    case 'join': {
    if (!Ahmad) return replytolak(mess.only.owner)
    if (!text) return replyquery(`Contoh penggunaan:\n${prefix + command} https://chat.whatsapp.com/xxx`)

    const isUrl = (url) => url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)

    if (!isUrl(args[0]) && !args[0].includes('whatsapp.com')) return replytolak('Link Invalid!')

    let result = args[0].split('https://chat.whatsapp.com/')[1]
    if (!result) return replytolak('Link Invalid ❗')

    replywait(mess.wait)

    await hydro.groupAcceptInvite(result)
        .then((res) => {
            replysuccess('*[ Done ]* Berhasil join ke grup!')
        })
        .catch((err) => {
            let errorStr = String(err)
            if (errorStr.includes('400')) return replyfail('Grup Tidak Di Temukan❗')
            if (errorStr.includes('401')) return replyfail('Bot Di Kick Dari Grup Tersebut❗')
            if (errorStr.includes('409')) return replyfail('Bot Sudah Join Di Grup Tersebut❗')
            if (errorStr.includes('410')) return replyfail('Url Grup Telah Di Setel Ulang❗')
            if (errorStr.includes('500')) return replyfail('Grup Penuh❗')
            replyfail('Gagal Join, pastikan link benar dan valid.')
        })
        }
        break 
    case 'setprefix': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            if (!q) return replyquery(`Masukkan prefix barunya!\nGunakan | untuk memisahkan prefix, dan ketik *noprefix* untuk tanpa prefix.\n\nContoh: *${prefix}setprefix !|#|noprefix*`)
            
            let newPrefixes = q.split('|').map(p => p.trim().toLowerCase() === 'noprefix' ? '' : p.trim())
            
            global.db.settings.prefix = newPrefixes
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
            
            let listPrefix = newPrefixes.map(p => p === '' ? '[No Prefix]' : `[ ${p} ]`).join(', ')
            replysuccess(`✅ Berhasil mengubah prefix *Global* bot menjadi:\n${listPrefix}`)
        }
        break
    case 'addsewa': {
        if (!Ahmad) return replytolak(global.mess.only.owner)
        let link = args[0]
        let timeInput = args[1]
        
        if (!link) return replyquery(`Format salah!\nContoh: *${prefix}addsewa <link> <waktu>*\n*${prefix}addsewa https://chat.whatsapp.com/xxx 30d*`)
        
        let rawLink = link.split('?')[0]
        const grupRegex = /chat\.whatsapp\.com\/([A-Za-z0-9]+)/i
        if (!grupRegex.test(rawLink)) return replytolak('Link grup tidak valid!')
        
        if (!timeInput) {
            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                        interactiveMessage: {
                            body: { text: `⏳ *PILIH DURASI SEWA*\n\nAnda belum memasukkan durasi waktu.\n${rawLink}` },
                            footer: { text: global.botname },
                            header: { hasMediaAttachment: false },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "1 Hari",
                                            id: `${prefix}addsewa ${rawLink} 1d`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "3 Hari",
                                            id: `${prefix}addsewa ${rawLink} 3d`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "7 Hari",
                                            id: `${prefix}addsewa ${rawLink} 7d`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "30 Hari",
                                            id: `${prefix}addsewa ${rawLink} 30d`
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { quoted: m }, {});

            return await hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
        }

        let inviteCode = rawLink.match(grupRegex)[1]

        const matchTime = timeInput.match(/^(\d+)([smhd])$/i)
        if (!matchTime) return replytolak('Format waktu salah!\nGunakan angka yang diikuti huruf s/m/h/d (contoh: 30d, 12h, 60m)')
        
        let valTime = parseInt(matchTime[1])
        let unitTime = matchTime[2].toLowerCase()
        let duration = 0
        
        if (unitTime === 's') duration = valTime * 1000
        if (unitTime === 'm') duration = valTime * 60000
        if (unitTime === 'h') duration = valTime * 3600000
        if (unitTime === 'd') duration = valTime * 86400000

        replywait(global.mess.wait)
        
        try {
            const g = await hydro.groupGetInviteInfo(inviteCode)
            const groupId = g.id
            const groupName = g.subject || '-'
            
            if (!global.db.sewa) global.db.sewa = {}
            
            if (global.db.sewa[groupId]) {
                if (global.db.sewa[groupId].status === 'active') {
                    global.db.sewa[groupId].expired += duration
                } else {
                    global.db.sewa[groupId].duration += duration
                }
                global.db.sewa[groupId].notified = false
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
                return replysuccess(`✅ Berhasil memperpanjang waktu sewa untuk grup *${groupName}* sebanyak ${timeInput}.`)
            }
            
            try {
                await hydro.groupAcceptInvite(inviteCode)
            } catch (err) {
                let errorStr = String(err)
                if (errorStr.includes('409')) {
                } else {
                    if (errorStr.includes('401')) return replyfail('❌ Gagal! Bot pernah di-kick dari grup tersebut.')
                    if (errorStr.includes('410')) return replyfail('❌ Gagal! Link grup telah direset oleh admin.')
                    if (errorStr.includes('500')) return replyfail('❌ Gagal! Grup sudah penuh.')
                    return replyfail(`❌ Gagal bergabung! Error: ${errorStr}`)
                }
            }

            if (g.joinApprovalMode) {
                global.db.sewa[groupId] = {
                    name: groupName,
                    status: 'pending',
                    duration: duration,
                    timeStr: timeInput,
                    notified: false
                }
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
                replysuccess(`⏳ Grup *${groupName}* menggunakan persetujuan admin.\n\nPermintaan bergabung telah dikirim!`)
            } else {
                global.db.sewa[groupId] = {
                    name: groupName,
                    status: 'active',
                    expired: Date.now() + duration,
                    timeStr: timeInput,
                    notified: false
                }
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
                replysuccess(`✅ Berhasil masuk ke grup *${groupName}*!\n\nSewa selama ${timeInput} telah dimulai.`)
            }

        } catch (e) {
            console.log(chalk.redBright("[ ERROR ADDSEWA ]"), e)
            replyfail(`❌ Gagal mendapatkan informasi grup.\nPastikan link valid dan belum direset!\n\nDetail Error: ${e.message || e}`)
        }
    }
        break
    case 'delsewa': {
        if (!Ahmad) return replytolak(global.mess.only.owner)
        if (!global.db.sewa) global.db.sewa = {}

        let targetId = m.isGroup ? m.chat : (args[0] ? (args[0].includes('@g.us') ? args[0] : args[0] + '@g.us') : null)

        if (targetId) {
            if (!global.db.sewa[targetId]) return replytolak("❌ Grup tidak ditemukan di database sewa!")

            try {
                await hydro.groupLeave(targetId)
            } catch (e) {}

            delete global.db.sewa[targetId]
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))

            return replysuccess(`✅ Sukses menghapus sewa & keluar dari grup.\nID: ${targetId}`)
        }

        let sewaKeys = Object.keys(global.db.sewa)
        if (sewaKeys.length === 0) return replytolak("❌ Tidak ada sewa aktif saat ini.")

        let listGrupSewa = []
        for (let id of sewaKeys) {
            let s = global.db.sewa[id]
            let sisaWaktu = s.status === 'pending' ? 'Pending ACC' : runtime((s.expired - Date.now()) / 1000)

            listGrupSewa.push({
                header: "",
                title: s.name,
                description: `ID: ${id}\nSisa: ${sisaWaktu}`,
                id: `.delsewa ${id}`
            })
        }

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: {
                        body: { text: `📜 *DAFTAR GRUP SEWA*\nTotal: ${sewaKeys.length} Grup\n\nSilakan pilih grup yang ingin dihentikan sewanya.` },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "PILIH GRUP",
                                        sections: [
                                            { title: "List Sewa", rows: listGrupSewa }
                                        ]
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }, { quoted: m }, {});

        await hydro.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id
        });
    }
        break
    case 'listsewa': {
        if (!Ahmad) return replytolak(global.mess.only.owner)
        if (!global.db.sewa || Object.keys(global.db.sewa).length === 0) return replyquery("📭 Belum ada data sewa.")

        let teks = `📋 *Daftar Sewa Aktif*\n\n`
        
        for (let jid in global.db.sewa) {
            let sewa = global.db.sewa[jid]
            
            let expiredText = sewa.status === 'pending' 
                ? "Pending" 
                : (sewa.expired === "PERMANENT" ? "PERMANENT" : runtime((sewa.expired - Date.now()) / 1000))
                
            teks += `🏷️ Nama : *${sewa.name}*\n`
            teks += `🆔 ID   : ${jid}\n`
            teks += `⏳ Expired : ${expiredText}\n\n`
        }

        reply(teks)
    }
        break
    case 'creategc':
    case 'creategroup': {
        if (!Ahmad) return replytolak(global.mess.only.owner)
        if (!text) return replyquery(`Masukkan nama grup!\nContoh: *${prefix}creategc Namagrup*`)
        
        replywait(global.mess.wait)
        try {
            let group = await hydro.groupCreate(text, [])
            let code = await hydro.groupInviteCode(group.id)
            
            let creationDate = moment(group.creation * 1000).tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm:ss")
            
            let teks = `「 *Create Group* 」\n\n`
            teks += `▸ *Name* : ${group.subject}\n`
            teks += `▸ *Status* : Hanya Bot (Privat)\n`
            teks += `▸ *Creation* : ${creationDate} WIB\n\n`
            teks += `Silakan masuk melalui link di bawah ini:\n`
            teks += `https://chat.whatsapp.com/${code}`

            replysuccess(teks)

        } catch (e) {
            replyfail(`❌ Gagal membuat grup!\nDetail: ${e.message || e}`)
        }
    }
        break
    case 'caselimit': {
        if (!Ahmad) return replytolak(global.mess.only.owner);
        if (!args[0] || !args[1]) return replyquery(`Format salah!\nContoh: *${prefix}caselimit tiktok 3*\n\n> Ketik angka 0 untuk menjadikannya tanpa limit.`);
        
        let cmdName = args[0].toLowerCase();
        let limitCost = parseInt(args[1]);
        
        if (isNaN(limitCost) || limitCost < 0) return replyquery(`❌ Masukkan angka limit yang valid!`);
        
        const fileContent = fs.readFileSync(__filename, 'utf8');
        const availableFeatures = [...fileContent.matchAll(/case\s+'([^']+)'/g)].map(m => m[1]);
        
        if (!availableFeatures.includes(cmdName)) {
            return replyquery(`❌ Gagal! Fitur *${cmdName}* tidak ditemukan di dalam sistem bot.`);
        }
        // ==========================================
        
        if (!global.db.settings.cmdLimit) global.db.settings.cmdLimit = {};
        
        global.db.settings.cmdLimit[cmdName] = limitCost;
        fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
        
        if (limitCost === 0) {
            replysuccess(`✅ Fitur *${cmdName}* sekarang di-set menjadi *NO LIMIT*`);
        } else {
            replysuccess(`✅ Berhasil mengatur biaya limit untuk fitur *${cmdName}* menjadi *${limitCost} limit* per penggunaan.`);
        }
    }
        break


// ====== GROUP FEATURE ======

    case 'setprefixgc': {
            if (!m.isGroup) return replytolak(global.mess.only.group)
            if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin)
            if (!q) return replyquery(`Masukkan prefix baru untuk grup ini!\nGunakan | untuk memisahkan prefix, ketik *noprefix* untuk tanpa prefix, atau ketik *reset* untuk kembali ke prefix global.\n\nContoh: *${prefix}setprefixgc !|#|noprefix*`)
            
            if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {}
            
            if (q.toLowerCase() === 'reset') {
                delete global.db.groups[m.chat].prefix
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
                return replysuccess('🔄 Prefix grup berhasil direset!')
            }

            let newPrefixes = q.split('|').map(p => p.trim().toLowerCase() === 'noprefix' ? '' : p.trim())
            
            global.db.groups[m.chat].prefix = newPrefixes
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
            
            let listPrefix = newPrefixes.map(p => p === '' ? '[No Prefix]' : `[ ${p} ]`).join(', ')
            replysuccess(`✅ Berhasil mengatur prefix khusus menjadi:\n${listPrefix}`)
        }
        break
    case 'ceksewa': {
        if (!m.isGroup) return replytolak(global.mess.only.group)
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin)
        
        if (!global.db.sewa || !global.db.sewa[m.chat]) {
            return replyquery("❌ Grup ini belum menyewa bot.")
        }

        let sewa = global.db.sewa[m.chat]
        let expiredText = sewa.status === 'pending' 
            ? "Pending" 
            : runtime((sewa.expired - Date.now()) / 1000)

        let teks = `⬣ *CEK SEWA GRUP*\n\n`
        teks += `🏷️ Nama : *${sewa.name}*\n`
        teks += `🆔 ID   : *${m.chat}*\n`
        teks += `⏱️ Durasi Awal : *${sewa.timeStr || '-'}*\n`
        teks += `⏳ Expired : *${expiredText}*\n`
        
        reply(teks)
    }
        break
    case 'jadwalsholat': {
        if (!m.isGroup) return replytolak(global.mess.only.group);
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin);
        
        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};
        let gc = global.db.groups[m.chat];

        if (args[0] === 'on') {
            gc.autosholat = true;
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            return replysuccess('✅ Autosholat berhasil diaktifkan di grup ini!');
        } else if (args[0] === 'off') {
            gc.autosholat = false;
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            return replysuccess('❌ Autosholat berhasil dimatikan di grup ini!');
        } else {
            let text = q;
            if (!text) return replyquery(`❌ Masukkan nama Kota atau Kabupaten!\n\nContoh: \n*${prefix}jadwalsholat Metro*\n*${prefix}jadwalsholat on/off*`);
            
            replywait(global.mess.wait);
            try {
                let matches = await searchDaerah(text);

                if (matches.length === 0) {
                    return replyfail(`❌ Kota/Kabupaten "${text}" tidak ditemukan.`);
                }

                if (matches.length > 1) {
                    let txt = `🔍 Ditemukan beberapa kota yang mirip dengan "${text}".\n\n`;
                    
                    let limitSaran = matches.slice(0, 15);
                    limitSaran.forEach((m, i) => {
                        txt += `*- ${m.kota}*\n`;
                    });
                    
                    if (matches.length > 15) txt += `*(Dan ${matches.length - 15} lainnya...)*\n`;
                    
                    txt += `\nSilakan ketik ulang, contoh:\n👉 *${prefix}jadwalsholat ${limitSaran[0].kota}*`;
                    return reply(txt);
                }

                let prov = matches[0].provinsi;
                let kota = matches[0].kota;

                const { data } = await axios.post('https://equran.id/api/v2/shalat', {
                    provinsi: prov,
                    kabkota: kota
                });
                
                if (data && data.code === 200) {
                    gc.jadwalsholat = { provinsi: prov, kota: kota };
                    gc.jadwalsholatData = null; 
                    gc.autosholat = true; 
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                    replysuccess(`✅ Berhasil mengatur lokasi sholat ke \n*${kota}* \nProvinsi *${prov}*`);
                } else {
                    replyfail(mess.fail);
                }
            } catch (e) {
                console.error(e);
                replyfail(mess.fail);
            }
        }
    }
        break
    case 'promote': {
        if (!m.isGroup) return replytolak(global.mess.only.group)
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin)
        if (!isBotAdmins) return replytolak('❌ Gagal! Bot harus menjadi admin terlebih dahulu.')
        
        let users = m.quoted ? [m.quoted.sender] : text ? [text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'] : []
        if (!users[0]) return replyquery(`Balas pesan orangnya atau ketik nomornya!\nContoh: *${prefix}promote 6281234567890*`)
        
        await hydro.groupParticipantsUpdate(m.chat, users, 'promote')
        replysuccess(`✅ Berhasil menaikkan jabatan anggota menjadi Admin!`)
    }
        break
    case 'demote': {
        if (!m.isGroup) return replytolak(global.mess.only.group)
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin)
        if (!isBotAdmins) return replytolak('❌ Gagal! Bot harus menjadi admin terlebih dahulu.')
        
        let users = m.quoted ? [m.quoted.sender] : text ? [text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'] : []
        if (!users[0]) return replyquery(`Balas pesan orangnya atau ketik nomornya!\nContoh: *${prefix}demote 6281234567890*`)
        
        await hydro.groupParticipantsUpdate(m.chat, users, 'demote')
        replysuccess(`✅ Berhasil menurunkan jabatan Admin menjadi Member biasa!`)
    }
        break
    case 'kick': {
        if (!m.isGroup) return replytolak(global.mess.only.group)
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin)
        if (!isBotAdmins) return replytolak('❌ Gagal! Bot harus menjadi admin terlebih dahulu.')
        
        let users = m.quoted ? [m.quoted.sender] : text ? [text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'] : []
        if (!users[0]) return replyquery(`Balas pesan orangnya atau ketik nomornya!\nContoh: *${prefix}kick 6281234567890*`)
        
        await hydro.groupParticipantsUpdate(m.chat, users, 'remove')
        replysuccess(`✅ Berhasil mengeluarkan anggota dari grup!`)
    }
        break
    case 'setnamegc': {
        if (!m.isGroup) return replytolak(global.mess.only.group)
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin)
        if (!isBotAdmins) return replytolak('❌ Gagal! Bot harus menjadi admin terlebih dahulu.')
        if (!text) return replyquery(`Masukkan nama grup yang baru!\nContoh: *${prefix}setnamegc Hydro Community*`)
        
        await hydro.groupUpdateSubject(m.chat, text)
        replysuccess(`✅ Berhasil mengubah nama grup menjadi:\n*${text}*`)
    }
        break
    case 'setdescgc': {
        if (!m.isGroup) return replytolak(global.mess.only.group)
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin)
        if (!isBotAdmins) return replytolak('❌ Gagal! Bot harus menjadi admin terlebih dahulu.')
        if (!text) return replyquery(`Masukkan deskripsi grup yang baru!\nContoh: *${prefix}setdescgc Patuhi Aturan Grup!*`)
        
        await hydro.groupUpdateDescription(m.chat, text)
        replysuccess(`✅ Berhasil memperbarui deskripsi grup!`)
    }
        break
    case 'setppgc': {
        if (!m.isGroup) return replytolak(global.mess.only.group)
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin)
        if (!isBotAdmins) return replytolak('❌ Gagal! Bot harus menjadi admin terlebih dahulu.')
        
        let isImageMsg = (type === 'imageMessage' || (m.quoted && m.quoted.mtype === 'imageMessage'))
        if (!isImageMsg) return replyquery(`Kirim gambar dengan caption *${prefix}setppgc* atau balas gambarnya!`)
        
        try {
            reply(global.mess.wait)
            let media = await hydro.downloadMediaMessage(m.quoted ? m.quoted : m)
            await hydro.updateProfilePicture(m.chat, media)
            replysuccess(`✅ Berhasil mengubah foto profil grup!`)
        } catch (e) {
            replyfail(`❌ Gagal mengubah foto profil. Pastikan gambar valid.`)
        }
    }
        break
    case 'welcome':
    case 'left':
    case 'groupinfo': {
        if (!m.isGroup) return replytolak(global.mess.only.group)
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin)
        
        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {}
        let gc = global.db.groups[m.chat]
        
        let currentStatus = (gc[command] !== undefined) ? gc[command] : global[command];

        if (args[0] === 'on') {
            if (currentStatus === true) return replyquery(`Fitur *${command}* sudah aktif!`)
            gc[command] = true
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
            replysuccess(`✅ Fitur *${command}* berhasil diaktifkan!`)
        } else if (args[0] === 'off') {
            if (currentStatus === false) return replyquery(`Fitur *${command}* memang sudah mati!`)
            gc[command] = false
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
            replysuccess(`❌ Fitur *${command}* berhasil dimatikan!`)
        } else {
            replyquery(`Status saat ini: *${currentStatus ? 'ON' : 'OFF'}*\n\nKetik *${prefix + command} on/off* untuk mengubah.`)
        }
    }
        break
    case 'mute':
    case 'onlyadmin': {
        if (!m.isGroup) return replytolak(global.mess.only.group)
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin)
        
        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {}
        let gc = global.db.groups[m.chat]
        
        if (args[0] === 'on') {
            if (gc.mute) return replyquery(`Bot sudah di-mute untuk member di grup ini!`)
            gc.mute = true
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
            replysuccess(global.mess.on)
        } else if (args[0] === 'off') {
            if (!gc.mute) return replyquery(`Bot memang tidak sedang di-mute!`)
            gc.mute = false
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2))
            replysuccess(global.mess.off)
        } else {
            replyquery(`Status Mute: *${gc.mute ? 'ON' : 'OFF'}*\n\nKetik \n*${prefix + command} on* untuk membisukan bot dari member.\n*${prefix + command} off* untuk mematikan mute.`)
        }
    }
        break
    case 'antilinkall':
    case 'antilinkgc':
    case 'antilinkch':
    case 'antilinktt':
    case 'antilinkig':
    case 'antilinkyt':
    case 'antilinkfb':
    case 'antilinktw':
    case 'antiwame':
    case 'antitagsw':
    case 'antiswgc':
    case 'antiswgb':
    case 'antitoxic':
        if (!m.isGroup) return replytolak(global.mess.only.group);
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin);
        
        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};
        let gc = global.db.groups[m.chat];
        
        if (!gc.antilink) gc.antilink = { all: false, gc: false, ch: false, tt: false, ig: false, yt: false, fb: false, tw: false, wame: false, tagsw: false, swgc: false, toxic: false };

        let typeLink = command.replace('anti', '').replace('link', '').replace('gb', 'gc'); 
        
        if (args[0] === 'on') {
            if (gc.antilink[typeLink]) return replyquery(`⚠️ Anti *${typeLink.toUpperCase()}* sudah aktif sebelumnya!`);
            gc.antilink[typeLink] = true;
            replysuccess(`✅ Anti *${typeLink.toUpperCase()}* berhasil diaktifkan!`);
        } else if (args[0] === 'off') {
            if (!gc.antilink[typeLink]) return replyquery(`⚠️ Anti *${typeLink.toUpperCase()}* memang sudah mati!`);
            gc.antilink[typeLink] = false;
            replysuccess(`❌ Anti *${typeLink.toUpperCase()}* berhasil dimatikan!`);
        } else {
            replyquery(`Status Anti ${typeLink.toUpperCase()}: *${gc.antilink[typeLink] ? 'ON' : 'OFF'}*\nKetik: *${prefix + command} on/off*`);
        }
        
        fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
        break;
    case 'addtoxic':
    case 'addbadword': {
        if (!m.isGroup) return replytolak(global.mess.only.group);
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin);
        if (!text) return replyquery(`*Contoh Penggunaan:*\n${prefix + command} qontol`);

        if (!fs.existsSync('./database/badword.json')) fs.writeFileSync('./database/badword.json', JSON.stringify([]));
        let bw = JSON.parse(fs.readFileSync('./database/badword.json'));

        let word = text.toLowerCase().trim();
        if (bw.includes(word)) return replytolak(`⚠️ Kata *${word}* sudah ada di dalam database toxic!`);

        bw.push(word);
        fs.writeFileSync('./database/badword.json', JSON.stringify(bw, null, 2));
        replysuccess(`✅ Berhasil menambahkan kata *${word}* ke daftar toxic.`);
    }
        break;
    case 'deltoxic':
    case 'delbadword': {
        if (!m.isGroup) return replytolak(global.mess.only.group);
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin);
        if (!text) return replyquery(`*Contoh Penggunaan:*\n${prefix + command} puqimak`);

        if (!fs.existsSync('./database/badword.json')) fs.writeFileSync('./database/badword.json', JSON.stringify([]));
        let bw = JSON.parse(fs.readFileSync('./database/badword.json'));

        let word = text.toLowerCase().trim();
        if (!bw.includes(word)) return replytolak(`⚠️ Kata *${word}* tidak ditemukan di dalam database toxic!`);

        bw = bw.filter(v => v !== word);
        fs.writeFileSync('./database/badword.json', JSON.stringify(bw, null, 2));
        replysuccess(`🗑️ Berhasil menghapus kata *${word}* dari daftar toxic.`);
    }
        break;
    case 'listtoxic':
    case 'listbadword': {
        if (!m.isGroup) return replytolak(global.mess.only.group);
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin);

        if (!fs.existsSync('./database/badword.json')) {
            return replyquery('📂 Daftar kata toxic masih kosong.');
        }

        let bw = JSON.parse(fs.readFileSync('./database/badword.json'));
        
        if (bw.length === 0) {
            return replyquery('📂 Daftar kata toxic masih kosong.');
        }

        let textList = `🤬 *DAFTAR KATA TOXIC (${bw.length})*\n\n`;
        
        textList += `\`\`\`\n`;
        bw.forEach((word, index) => {
            textList += `${index + 1}. ${word}\n`;
        });
        textList += `\`\`\`\n\n`;
        textList += `> Ketik *${prefix}addtoxic <kata>* untuk menambah.\n`;
        textList += `> Ketik *${prefix}deltoxic <kata>* untuk menghapus.`;

        await hydro.sendMessage(m.chat, { text: textList }, { quoted: m });
    }
        break;
    case 'setantilink': {
        if (!m.isGroup) return replytolak(global.mess.only.group);
        if (!isGroupAdmins && !Ahmad) return replytolak(global.mess.only.admin);

        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};
        let gc = global.db.groups[m.chat];
        
        if (!gc.antilinkAction) gc.antilinkAction = 'silent';
        if (!gc.antilinkWarnLimit) gc.antilinkWarnLimit = 3;

        let action = args[0] ? args[0].toLowerCase() : '';
        let limit = args[1] ? parseInt(args[1]) : 3;

        if (['silent', 'delete', 'warn', 'kick'].includes(action)) {
            gc.antilinkAction = action;
            if (action === 'warn') {
                if (!isNaN(limit) && limit > 0) gc.antilinkWarnLimit = limit;
                replysuccess(`✅ Aksi Antilink diatur ke: *WARN*\nBatas peringatan: *> ${gc.antilinkWarnLimit} kali*`);
            } else if (action === 'delete') {
                replysuccess(`✅ Aksi Antilink diatur ke: *DELETE*\n> Menghapus pesan link disertai tag peringatan`);
            } else if (action === 'silent') {
                replysuccess(`✅ Aksi Antilink diatur ke: *SILENT*\n> Menghapus link tanpa notif peringatan`);
            } else if (action === 'kick') {
                replysuccess(`✅ Aksi Antilink diatur ke: *KICK*\n> Menghapus link dan langsung kick`);
            }
            fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
        } else {
            replyquery(`📌 *Pengaturan Antilink*\n\n- Silent: Hapus pesan\n- Delete: Hapus dengan notif\n- Warn: Hapus & beri peringatan\n- Kick: Hapus & kick\n\n*Contoh Penggunaan:*\n${prefix + command} silent\n${prefix + command} warn 3`);
        }
    }
    break;
    
// ====== DOWNLOADER FEATURE ======

    case 'tiktok':
    case 'tt': {
        if (!text) return replyquery(`📌 Contoh: ${prefix + command} https://vt.tiktok.com/...`)

        let cost = getLimitCost('tiktok', 2);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️')

        try {
            const data = await tiktokDl(text)
            
            if (!data || !data.status) {
                await react('❌')
                return replyfail(`❌ Gagal mengambil data.`)
            }

            const title = data.title || '-'
            const author = data.author?.nickname || 'Unknown'
            const stats = data.stats || { views: 0, likes: 0, comment: 0, share: 0 }
            const audioUrl = data.music_info?.url

            let sisaLimitTampil = totalLimit === "∞" ? "∞" : (totalLimit - cost);
            const images = data.data.filter(v => v.type === 'photo').map(v => v.url)
            let videoObj = data.data.find(v => v.type === 'nowatermark') || data.data.find(v => v.type === 'nowatermark_hd') || data.data[0];

            if (images.length > 0) {
                let cards = await Promise.all(images.map(async (url, i) => ({
                    header: proto.Message.InteractiveMessage.Header.create({
                        ...(await prepareWAMessageMedia({ image: { url } }, { upload: hydro.waUploadToServer })),
                        title: '',
                        subtitle: `Foto ${i + 1}/${images.length}`,
                        hasMediaAttachment: true
                    }),
                    body: { text: '' },
                    nativeFlowMessage: { buttons: [] }
                })))

                let captionText = `📸 *Tiktok Slides*\n👤 ${author}\n📝 ${title}\n📊 View: ${stats.views} | Like: ${stats.likes}\n\nSisa limit: ${sisaLimitTampil}`

                let msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: {
                                body: { text: captionText },
                                carouselMessage: { cards: cards, messageVersion: 1 }
                            }
                        }
                    }
                }, { quoted: m })

                await hydro.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
            } else {
                if (!videoObj || !videoObj.url) {
                    await react('❌')
                    return replyfail('❌ Video tidak ditemukan.')
                }

                let captionText = `🎥 *Tiktok Video*\n\n👤 Author: ${author}\n📝 Desc: ${title}\n\n📊 Views: ${stats.views} | ❤️ ${stats.likes}\n💬 ${stats.comment} | 🔄 ${stats.share}\n\n> Sisa limit: ${sisaLimitTampil}`

                await hydro.sendMessage(m.chat, {
                    video: { url: videoObj.url },
                    caption: captionText
                }, { quoted: m })
            }

            let audioSent = false;

            if (audioUrl) {
                try {
                    let resAudio = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                    await hydro.sendMessage(m.chat, { audio: Buffer.from(resAudio.data), mimetype: 'audio/mp4' }, { quoted: m });
                    audioSent = true;
                } catch (e) {
                }
            }

            if (!audioSent && images.length === 0 && videoObj && videoObj.url) {
                try {

                    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
                    
                    let ranId = crypto.randomBytes(4).toString('hex');
                    let tmpVid = path.join('./temp', `${ranId}.mp4`);
                    let tmpAud = path.join('./temp', `${ranId}.mp3`);

                    let vidBuffer = await axios.get(videoObj.url, { responseType: 'arraybuffer' });
                    fs.writeFileSync(tmpVid, vidBuffer.data);

                    await new Promise((resolve, reject) => {
                        exec(`ffmpeg -i ${tmpVid} -vn -b:a 128k ${tmpAud}`, (err) => {
                            if (err) reject(err); else resolve();
                        });
                    });

                    await hydro.sendMessage(m.chat, { audio: fs.readFileSync(tmpAud), mimetype: 'audio/mp4' }, { quoted: m });

                    fs.unlinkSync(tmpVid);
                    fs.unlinkSync(tmpAud);
                } catch (err) {}
            }

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅')

        } catch (err) {
            console.error(err)
            await react('❌')
            replyfail('❌ Error sistem.')
        }
    }
        break
    case 'tiktokmusic':
    case 'tiktokaudio':
    case 'ttmusic':
    case 'ttaudio': {
        if (!text) return replyquery(`📌 Contoh: ${prefix + command} https://vt.tiktok.com/...`)

        let cost = getLimitCost('tiktokmusic', 1);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️')

        try {
            const data = await tiktokDl(text)
            
            if (!data || !data.status) {
                await react('❌')
                return replyfail(`❌ Gagal mengambil data.`)
            }

            const audioUrl = data.music_info?.url;
            let audioSent = false;
            
            let thumbUrl = data.music_info?.cover || 'https://raw.githubusercontent.com/AhmadAkbarID/media/main/tiktokmusic.png';

            let audioContext = {
                externalAdReply: {
                    showAdAttribution: true,
                    title: data.music_info?.title || "Tiktok Downloader",
                    body: data.music_info?.author || "Original Audio",
                    thumbnailUrl: thumbUrl,
                    sourceUrl: text,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            };

            if (audioUrl) {
                try {
                    let resAudio = await axios.get(audioUrl, { responseType: 'arraybuffer' });
                    await hydro.sendMessage(m.chat, { audio: Buffer.from(resAudio.data), mimetype: 'audio/mp4', contextInfo: audioContext }, { quoted: m });
                    audioSent = true;
                } catch (e) {
                }
            }

            if (!audioSent) {
                const images = data.data.filter(v => v.type === 'photo');
                let videoObj = data.data.find(v => v.type === 'nowatermark') || data.data.find(v => v.type === 'nowatermark_hd') || data.data[0];

                if (images.length > 0 || !videoObj || !videoObj.url) {
                    await react('❌')
                    return replyfail('❌ Audio tidak ditemukan dan ini adalah slide foto')
                }

                try {

                    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
                    
                    let ranId = crypto.randomBytes(4).toString('hex');
                    let tmpVid = path.join('./temp', `${ranId}.mp4`);
                    let tmpAud = path.join('./temp', `${ranId}.mp3`);

                    let vidBuffer = await axios.get(videoObj.url, { responseType: 'arraybuffer' });
                    fs.writeFileSync(tmpVid, vidBuffer.data);

                    await new Promise((resolve, reject) => {
                        exec(`ffmpeg -i ${tmpVid} -vn -b:a 128k ${tmpAud}`, (err) => {
                            if (err) reject(err); else resolve();
                        });
                    });

                    audioContext.externalAdReply.body = "Audio";
                    await hydro.sendMessage(m.chat, { audio: fs.readFileSync(tmpAud), mimetype: 'audio/mp4', contextInfo: audioContext }, { quoted: m });

                    fs.unlinkSync(tmpVid);
                    fs.unlinkSync(tmpAud);
                } catch (err) {
                    console.error(err)
                    await react('❌')
                    return replyfail('❌ Gagal mengunduh dan mengkonversi audio dari video tersebut.')
                }
            }

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅')

        } catch (err) {
            console.error(err)
            await react('❌')
            replyfail(mess.error.fitur)
        }
    }
        break
    case 'instagram':
    case 'igdl':
    case 'ig':
    case 'igvideo':
    case 'igimage':
    case 'igvid':
    case 'igimg': {
        if (!m.isGroup) return replytolak(global.mess.only.group);
        if (!text) return replyquery(`📌 Contoh: ${prefix + command} https://www.instagram.com/p/xxx/`);

        let cost = getLimitCost('instagram', 2);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️');

        try {
            const data = await igdl(text);
            
            if (!data || !data.status || !data.result || !data.result.downloadUrl || data.result.downloadUrl.length === 0) {
                await react('❌');
                return replyfail(`❌ Gagal mengambil data dari Instagram. Pastikan link valid dan akun tidak di-private.`);
            }

            const urls = data.result.downloadUrl;
            let sisaLimitTampil = totalLimit === "∞" ? "∞" : (totalLimit - cost);
            let captionText = `📸 *Instagram Downloader*\n\n> Sisa limit: ${sisaLimitTampil}`;

            let captionSent = false;

            for (let i = 0; i < urls.length; i++) {
                try {
                    let currentUrl = urls[i];
                    let res = await axios.get(currentUrl, { responseType: 'arraybuffer' });
                    let buffer = Buffer.from(res.data, 'binary');
                    let mimeType = res.headers['content-type'] || '';

                    if (mimeType.includes('video')) {
                        await hydro.sendMessage(m.chat, {
                            video: buffer,
                            caption: !captionSent ? captionText : ''
                        }, { quoted: m });
                        captionSent = true;
                    } else if (mimeType.includes('audio')) {
                        if (!captionSent) {
                            await hydro.sendMessage(m.chat, { text: captionText }, { quoted: m });
                            captionSent = true;
                        }
                        await hydro.sendMessage(m.chat, {
                            audio: buffer,
                            mimetype: 'audio/mp4'
                        }, { quoted: m });
                    } else {
                        await hydro.sendMessage(m.chat, {
                            image: buffer,
                            caption: !captionSent ? captionText : ''
                        }, { quoted: m });
                        captionSent = true;
                    }
                    
                    if (urls.length > 1 && i < urls.length - 1) {
                        await sleep(1000); 
                    }
                } catch (mediaErr) {
                    console.error(`Gagal memproses media ke-${i}:`, mediaErr);
                }
            }

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅');

        } catch (err) {
            console.error(err);
            await react('❌');
            replyfail(`❌ Error sistem.`);
        }
    }
        break
    case 'igaudio':
    case 'igmusic': {
        if (!m.isGroup) return replytolak(global.mess.only.group);
        if (!text) return replyquery(`📌 Contoh: ${prefix + command} https://www.instagram.com/reel/xxx/`);

        let cost = getLimitCost('igaudio', 1);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️');

        try {
            const data = await igdl(text);
            
            if (!data || !data.status || !data.result || !data.result.downloadUrl || data.result.downloadUrl.length === 0) {
                await react('❌');
                return replyfail(`❌ Gagal mengambil data dari Instagram.`);
            }

            const videoUrl = data.result.downloadUrl.find(url => url.includes('.mp4'));

            if (!videoUrl) {
                await react('❌');
                return replyfail(`❌ Tidak ada video yang ditemukan pada link tersebut untuk dikonversi menjadi audio.`);
            }

            try {

                if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
                
                let ranId = crypto.randomBytes(4).toString('hex');
                let tmpVid = path.join('./temp', `${ranId}.mp4`);
                let tmpAud = path.join('./temp', `${ranId}.mp3`);

                let vidBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer' });
                fs.writeFileSync(tmpVid, vidBuffer.data);

                await new Promise((resolve, reject) => {
                    exec(`ffmpeg -i ${tmpVid} -vn -b:a 128k ${tmpAud}`, (err) => {
                        if (err) reject(err); else resolve();
                    });
                });

                let audioContext = {
                    externalAdReply: {
                        showAdAttribution: true,
                        title: "Instagram Audio",
                        body: "Original Audio",
                        thumbnailUrl: 'https://raw.githubusercontent.com/AhmadAkbarID/media/main/igmusic.png',
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                };

                await hydro.sendMessage(m.chat, { 
                    audio: fs.readFileSync(tmpAud), 
                    mimetype: 'audio/mp4',
                    contextInfo: audioContext
                }, { quoted: m });

                fs.unlinkSync(tmpVid);
                fs.unlinkSync(tmpAud);

                if (cost > 0) {
                    useLimit(m.sender, cost, Ahmad);
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                }

                await react('✅');

            } catch (err) {
                console.error("FFmpeg Error:", err);
                await react('❌');
                return replyfail(`❌ Gagal mengunduh atau mengkonversi audio.`);
            }

        } catch (err) {
            console.error(err);
            await react('❌');
            replyfail(`❌ Error sistem.`);
        }
    }
        break;
    case 'dafontdl':
    case 'fontdl': {
        if (!text) return replyquery(`📌 *Contoh Penggunaan Manual:*\n\n1. Link Halaman Font:\n*${prefix + command} https://www.dafont.com/arial.font*\n\n2. Link Direct Download:\n*${prefix + command} https://dl.dafont.com/dl/?f=arial*`);

        let isManual = !text.includes('|');
        let cost = isManual ? getLimitCost('dafont', 1) : 0; 
        
        if (cost > 0) {
            let totalLimit = checkLimit(m.sender, Ahmad); 
            if (totalLimit !== "∞" && totalLimit < cost) {
                return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
            }
        }

        await react('⏱️');

        let dlUrl, previewUrl, name;

        if (!isManual) {
            [dlUrl, previewUrl, name] = text.split('|');
        } 
        else {
            let isUrl = text.match(/https?:\/\/[^\s]+/i);
            if (!isUrl) {
                await react('❌');
                return replyfail('❌ Masukkan URL DaFont yang valid!');
            }
            
            let rawUrl = isUrl[0];
            previewUrl = null;

            if (rawUrl.includes('dafont.com') && !rawUrl.includes('dl.dafont.com')) {
                try {
                    let { data } = await axios.get(rawUrl);
                    let $ = cheerio.load(data);
                    
                    let dlHref = $('a.dl').attr('href');
                    if (!dlHref) throw new Error('Tombol download tidak ditemukan');
                    
                    dlUrl = dlHref.startsWith('//') ? 'https:' + dlHref : dlHref;
                    
                    let style = $('.preview').first().attr('style');
                    if (style) {
                        previewUrl = 'https://www.dafont.com' + (style.match(/url\((.*?)\)/)?.[1] || '');
                    }
                    
                    name = rawUrl.split('/').pop().replace('.font', '').replace(/-/g, ' ');
                } catch (e) {
                    await react('❌');
                    return replyfail('❌ Gagal mengambil link download dari halaman tersebut.');
                }
            } 
            else {
                dlUrl = rawUrl.startsWith('//') ? 'https:' + rawUrl : rawUrl;
                let matchName = dlUrl.match(/\?f=([^&]+)/);
                name = matchName ? matchName[1].replace(/_/g, ' ') : 'DaFont_Download';
            }
        }

        if (!dlUrl) {
            await react('❌');
            return replyfail('❌ URL Download tidak valid!');
        }

        try {
            if (previewUrl && previewUrl !== 'null') {
                await hydro.sendMessage(m.chat, { 
                    image: { url: previewUrl }, 
                    caption: `*${name.toUpperCase()}*\n\n⏳ Sedang mengunduh font...` 
                }, { quoted: m });
            } else {
                replysuccess(`⏳ Sedang mengunduh *${name.toUpperCase()}*...`);
            }

            await hydro.sendMessage(m.chat, {
                document: { url: dlUrl },
                fileName: `${name}.zip`,
                mimetype: 'application/zip'
            }, { quoted: m });

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅');
        } catch (e) {
            console.error(e);
            await react('❌');
            replyfail('❌ Gagal mengunduh file font tersebut. Pastikan link yang diberikan valid.');
        }
    }
        break;
    case 'ytmp4':
    case 'ytvideo':
    case 'mp4': {
        if (!text) {
            return replyquery(
                `🎬 *YouTube Video Downloader*\n\n` +
                `📌 *Cara Penggunaan:*\n` +
                `   • *${prefix + command}* <link> <resolusi>\n` +
                `   • *${prefix + command}* <link>\n\n` +
                `💡 *Contoh:*\n` +
                `   ${prefix + command} https://youtu.be/abc123 720\n` +
                `   ${prefix + command} https://youtu.be/abc123\n`
            );
        }

        const argsList = text.split(' ');
        const link = argsList[0];
        const resolution = argsList[1];

        const isUrl = (url) => url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi);
        if (!isUrl(link) || !link.includes("youtu")) return replyfail('❌ Link tidak valid! Pastikan itu link YouTube.');

        const limitMap = {
            '144': 2, '240': 3, '360': 4, '480': 6, '720': 10, '1080': 15, '1440': 20, '2160': 30, '4320': 50
        };

        if (!resolution) {
            try {
                const reso = ['144', '240', '360', '480', '720', '1080', '1440', '2160', '4320'];
                const rows = reso.map(r => ({
                    header: "",
                    title: `🎥 Resolusi ${r}p`,
                    description: `Dibutuhkan ${limitMap[r]} Limit`,
                    id: `${prefix}${command} ${link} ${r}`
                }));

                const msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                            interactiveMessage: {
                                body: { text: `📥 *Pilih resolusi video yang tersedia untuk diunduh:*` },
                                footer: { text: `💡 ${global.botname} — Downloader Cepat` },
                                header: {
                                    title: "📺 YouTube Video Downloader",
                                    subtitle: "Format: MP4",
                                    hasMediaAttachment: false,
                                },
                                nativeFlowMessage: {
                                    buttons: [{
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "🎯 Pilih Resolusi",
                                            sections: [{ title: "Daftar Resolusi", rows }]
                                        })
                                    }]
                                }
                            }
                        }
                    }
                }, { quoted: m }, {});

                await hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
            } catch (e) {
                return replyfail(global.mess.error.fitur);
            }
        } else {
            if (!limitMap[resolution]) return replyfail("⚠️ Resolusi tidak tersedia!");

            let baseCost = limitMap[resolution];
            let cost = getLimitCost('ytmp4', baseCost);
            let totalLimit = checkLimit(m.sender, Ahmad); 

            if (totalLimit !== "∞" && totalLimit < cost) {
                return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
            }

            try {
                await react('⏳');

                const data = await ytmp4(link, resolution); 
                
                if (!data || !data.downloadUrl) throw new Error("Gagal mengambil link download");

                const resData = await axios.get(data.downloadUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(resData.data);
                const fileSizeMB = buffer.length / (1024 * 1024);
                
                let sisaLimitText = totalLimit === "∞" ? "∞" : (totalLimit - cost);
                let captionText = `🎥 *Judul:* \n${data.title || '-'}\n📌 *Resolusi:* ${resolution}p\n> Sisa limit: ${sisaLimitText}`;

                const fileMsg = fileSizeMB > 100 
                    ? { document: buffer, fileName: `${data.title || 'video'}.mp4`, mimetype: 'video/mp4', caption: captionText }
                    : { video: buffer, fileName: `${data.title || 'video'}.mp4`, mimetype: 'video/mp4', caption: captionText };

                await hydro.sendMessage(m.chat, fileMsg, { quoted: m });

                if (cost > 0) {
                    useLimit(m.sender, cost, Ahmad);
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                }

                await react('✅');
            } catch (err) {
                console.error(err.message);
                await react('❌');
                return replyfail(mess.error.fitur);
            }
        }
    }
        break;
    case 'ytmp3':
    case 'ytaudio':
    case 'mp3': {
        if (!text) {
            return replyquery(
                `🎵 *YouTube Audio Downloader*\n\n` +
                `📌 *Cara Penggunaan:*\n` +
                `   • *${prefix + command}* <link>\n\n` +
                `💡 *Contoh:*\n` +
                `   ${prefix + command} https://youtu.be/abc123\n`
            );
        }

        const link = text.split(' ')[0];
        const isUrl = (url) => url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi);

        if (!isUrl(link) || !link.includes("youtu")) return replyfail('❌ Link tidak valid! Pastikan itu link YouTube.');

        let cost = getLimitCost('ytmp3', 2);
        let totalLimit = checkLimit(m.sender, Ahmad); 

        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        try {
            await react('⏳');
            const data = await ytmp3(link); 
            
            if (!data || !data.downloadUrl) throw new Error("Gagal mengambil link download");

            const resData = await axios.get(data.downloadUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(resData.data);
            
            let audioContext = {
                externalAdReply: {
                    showAdAttribution: true,
                    title: data.title || "YouTube Downloader",
                    body: "Audio MP3",
                    thumbnailUrl: data.thumbnail || 'https://telegra.ph/file/320b066dc81928b782c7b.png',
                    sourceUrl: link,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            };
            
            await hydro.sendMessage(m.chat, { 
                audio: buffer, 
                mimetype: 'audio/mpeg', 
                ptt: false,
                contextInfo: audioContext
            }, { quoted: m });
            
            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅');
        } catch (err) {
            console.error(err.message);
            await react('❌');
            return replyfail(mess.error.fitur);
        }
    }
        break;
    case "spdl":
    case "spotifydl": {
        if (!text) {
            return replyquery(`📌 *Contoh Penggunaan:*\n${prefix + command} https://open.spotify.com/track/...`);
        }

        let cost = getLimitCost('spotifydl', 2);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️');

        try {
            const res = await spotifyScrape(text);

            let title = res?.song?.title || "Spotify Audio";
            let artist = res?.song?.artist || "Unknown Artist";
            let thumb = res?.song?.thumbnail || "https://telegra.ph/file/320b066dc81928b782c7b.png"; 
            let url = res?.trackUrl || text;
            let duration = res?.song?.duration || "-";

            await hydro.sendMessage(
                m.chat,
                {
                    audio: res.audioBuffer,
                    mimetype: "audio/mpeg",
                    fileName: `${title}.mp3`,
                    contextInfo: {
                        externalAdReply: {
                            showAdAttribution: true,
                            title: title,
                            body: artist,
                            mediaType: 1,
                            renderLargerThumbnail: true,
                            thumbnailUrl: thumb,
                            sourceUrl: url,
                        },
                    },
                    caption: `🎵 *${title}*\n👤 *Artist:* ${artist}\n⏱️ *Duration:* ${duration}`,
                },
                { quoted: m }
            );

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅');
        } catch (err) {
            console.error(err.message);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'git':
    case 'github':
    case 'gitclone': {
        if (!args[0]) return replyquery(`Mana linknya?\nExample :\n${prefix}${command} https://github.com/AhmadAkbarID/hydromd`);
        
        const isUrl = (url) => url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi);
        if (!isUrl(args[0]) || !args[0].includes('github.com')) return replyfail(`❌ Link invalid! Harus berupa link repositori GitHub.`);
        
        await react('⏱️');
        
        try {
            let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
            let [, user, repo] = args[0].match(regex1) || [];
            
            if (!user || !repo) return replyfail('❌ Gagal mem-parsing link GitHub.');
            
            repo = repo.replace(/.git$/, '');
            let tag = args[1] ? args[1] : ''; 
            
            let url = `https://api.github.com/repos/${user}/${repo}/zipball`;
            if (tag && tag !== 'master') {
                url += `/${tag}`;
            }
            
            let response = await fetch(url, { method: 'HEAD' });
            
            if (!response.ok) {
                await react('❌');
                return replyfail(`❌ Gagal mengambil repository. Pastikan repo bersifat public atau versi tag tersebut benar-benar ada.\nStatus: ${response.status}`);
            }

            let versionText = (tag && tag !== 'master') ? tag : 'master';
            let filename = `${repo}-${versionText}.zip`;

            filename = filename.replace(/[^a-zA-Z0-9-_\.]/g, '');

            await hydro.sendMessage(m.chat, { 
                document: { url: url }, 
                fileName: filename, 
                mimetype: 'application/zip',
                caption: `✅ Berhasil mengunduh *${user}/${repo}*\nVersi: ${versionText}`
            }, { quoted: m });
            
            await react('✅');
        } catch (err) {
            console.error(err);
            await react('❌');
            replyfail(global.mess.error.fitur);
        }
    }
        break;

// ====== MAKER FEATURE ======

    case 'brat': {
        if (!text) return replyquery(`📌 Contoh:\n*${prefix + command} nyong*`);
        let cost = getLimitCost('brat', 1);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }
        await react('⏱️');
        try {
            let pngBuffer = await makeBrat(text);
            let webpBuffer = await toSticker(pngBuffer, global.packname, global.author);
            await hydro.sendMessage(m.chat, { sticker: webpBuffer }, { quoted: m });
            
            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }
            await react('✅');
        } catch (e) {
            console.error(e);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'bratvid': {
        if (!text) return replyquery(`📌 Contoh:\n*${prefix + command} So I wasn't the only one...*`);
        let cost = getLimitCost('bratvid', 1);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }
        await react('⏱️');
        try {
            let webpBuffer = await makeBratVid(text, global.packname, global.author);
            await hydro.sendMessage(m.chat, { sticker: webpBuffer }, { quoted: m });
            
            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }
            await react('✅');
        } catch (e) {
            console.error(e);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'iqc': {
        if (!text) return replyquery(`📌 Contoh Penggunaan:\n*${prefix + command} pesan*\n*${prefix + command} pesan|jam* ( opsional )\n*${prefix + command} pesan|baterai|sinyal|jam* ( opsional )\n\nContoh: *${prefix + command} Halo Sayangku*`);

        let cost = getLimitCost('iqc', 1);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        let parts = text.split("|").map(s => s.trim());
        let pesan = parts[0];
        let baterai = 100; 
        let sinyal = 4;    
        let jam;

        if (!pesan) return replyquery(`❌ Pesan tidak boleh kosong!`);

        if (parts.length === 2) {
            jam = parts[1];
        } else if (parts.length === 3) {
            baterai = !isNaN(parts[1]) ? parseInt(parts[1]) : 100;
            sinyal = !isNaN(parts[2]) ? parseInt(parts[2]) : 4;
        } else if (parts.length === 4) {
            baterai = !isNaN(parts[1]) ? parseInt(parts[1]) : 100;
            sinyal = !isNaN(parts[2]) ? parseInt(parts[2]) : 4;
            jam = parts[3];
        }

        if (baterai < 0) baterai = 0;
        if (baterai > 100) baterai = 100;
        if (sinyal < 1) sinyal = 1;
        if (sinyal > 4) sinyal = 4;

        if (!jam) {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const wib = new Date(utc + (7 * 3600000));
            const h = String(wib.getHours()).padStart(2, "0");
            const mnt = String(wib.getMinutes()).padStart(2, "0");
            jam = `${h}:${mnt}`;
        }

        if (jam && !jam.includes(":")) return replyquery('❌ Format jam salah! Gunakan titik dua (:), contoh: 12:00');

        await react('⏱️');

        let apiUrl = `https://brat.siputzx.my.id/iphone-quoted?messageText=${encodeURIComponent(pesan)}&carrierName=TELKOMSEL&batteryPercentage=${baterai}&signalStrength=${sinyal}&time=${encodeURIComponent(jam)}`;

        try {
            
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);

            await hydro.sendMessage(m.chat, { image: buffer }, { quoted: m });

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅');
        } catch (err) {
            console.error(err);
            await react('❌');
            replyfail('❌ Gagal membuat IQC dari server.');
        }
    }
        break;
    case 'qc':
    case 'quoted': {
        if (!text) return replyquery(`📌 Contoh Penggunaan:\n*${prefix + command} halo sayang*`);

        let cost = getLimitCost('qc', 1);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️');

        try {
            let ppUrl;
            try {
                ppUrl = await hydro.profilePictureUrl(m.sender, 'image');
            } catch (e) {
                ppUrl = 'https://telegra.ph/file/320b066dc81928b782c7b.png'; 
            }
            let nameUser = pushname || m.pushName || 'User';
            
            let imageBuffer = await makeQC(text, nameUser, ppUrl);
            let stickerBuffer = await toSticker(imageBuffer, global.packname, global.author);

            await hydro.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }
            await react('✅');

        } catch (err) {
            console.error(err);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'storyig':
    case 'igstory': {
        if (!text) return replyquery(`📌 Contoh Penggunaan:\n*${prefix + command} Lagi sedih banget hari ini...*`);
        let cost = getLimitCost('storyig', 1);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        if (totalLimit !== "∞" && totalLimit < cost) return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        await react('⏱️');
        try {
            let ppUrl;
            try {
                ppUrl = await hydro.profilePictureUrl(m.sender, 'image');
            } catch (e) {
                ppUrl = 'https://telegra.ph/file/320b066dc81928b782c7b.png'; 
            }
            let nameUser = pushname || m.pushName || 'User';
            let imageBuffer = await makeStoryIG(text, nameUser, ppUrl);
            await hydro.sendMessage(m.chat, { image: imageBuffer, caption: mess.success }, { quoted: m });
            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }
            await react('✅');
        } catch (err) {
            console.error(err);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'balogo':
    case 'bluearchivelogo': {
        if (!text) return replyquery(`*Contoh Penggunaan:*\n${prefix + command} Blue|Archive`);
        if (!text.includes('|')) return replytolak('Format Salah! Teks kiri dan kanan harus dipisahkan dengan tanda |');

        const [l, r] = text.split('|');

        if (!l || !r) return replytolak('Format Salah! Teks kiri dan kanan tidak boleh kosong.');

        replysuccess(mess.wait);

        try {
            
            const balogoMaker = new BALogo({
                fontSize: 84,
                transparent: false,
                haloX: -15,
                haloY: 0
            });

            const buffer = await balogoMaker.draw(l.trim(), r.trim());

            await hydro.sendMessage(m.chat, { 
                image: buffer,
                caption: mess.success
            }, { quoted: m });

        } catch (e) {
            replyfail(mess.fail);
        }
    }
    break;

// ====== SEARCH FEATURE ======

    case 'pin':
    case 'pinterest': {
        if (!text) return replyquery(`Contoh: \n${prefix + command} furina kawaii`)

        let cost = getLimitCost('pinterest', 1);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        try {
            const images = await searchPinterestAPI(text, 20);

            if (!images || images.length === 0) return m.reply('Gambar tidak ditemukan.')

            let cards = await Promise.all(images.map(async (url, i) => {
                return {
                    header: proto.Message.InteractiveMessage.Header.create({
                        ...(await prepareWAMessageMedia({ image: { url: url } }, { upload: hydro.waUploadToServer })),
                        title: '',
                        subtitle: `Gambar ${i + 1} dari ${images.length}`,
                        hasMediaAttachment: true 
                    }),
                    body: { text: '' },
                    nativeFlowMessage: { buttons: [] }
                }
            }))

            let msg = generateWAMessageFromContent(
                m.chat,
                {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: {
                                body: { text: `Ini Hasil Pencarian Dari Pinterest\n*${text}*` },
                                carouselMessage: {
                                    cards: cards,
                                    messageVersion: 1
                                }
                            }
                        }
                    }
                },
                { quoted: m }
            )

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }
        
            await hydro.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
        } catch (err) {
            console.error(err)
            replyfail('Terjadi kesalahan saat mengambil data dari Pinterest.')
        }
    }
        break;
    case 'dafont':
    case 'font': {
        if (!text) return replyquery(`📌 Contoh Penggunaan:\n*${prefix + command} arial*`);
        
        let cost = getLimitCost('dafont', 0);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️');
        
        try {
            let result = await searchDafont(text);

            if (!result || result.length === 0) {
                await react('❌');
                return replyfail('❌ Font tidak ditemukan!');
            }

            let listDaFont = result.slice(0, 15).map((v, i) => {
                let fName = v.name.length > 20 ? v.name.substring(0, 20) : v.name;
                let desc = `By: ${v.author} | DL: ${v.downloads}`;
                return {
                    header: "",
                    title: `${i + 1}. ${fName}`,
                    description: desc.length > 70 ? desc.substring(0, 67) + '...' : desc,
                    id: `${prefix}dafontdl ${v.download}|${v.preview}|${v.name}`
                };
            });

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: {
                            body: {
                                text: `🔎 *Hasil Pencarian DaFont:*\n"${text}"\n`
                            },
                            footer: {
                                text: global.botname
                            },
                            header: {
                                title: "DaFont Search",
                                subtitle: "",
                                hasMediaAttachment: false
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "PILIH FONT",
                                            sections: [
                                                {
                                                    title: "Daftar Font",
                                                    rows: listDaFont
                                                }
                                            ]
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { quoted: m }, {});

            await hydro.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }
            await react('✅');

        } catch (e) {
            console.error(e);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'spotify':
    case 'spotifysearch':
    case 'spotifys': {
        if (!text) return replyquery(`📌 *Contoh Penggunaan:*\n${prefix + command} anone by arekun`);

        let cost = getLimitCost('spotify', 0);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️');

        try {
            const result = await searchSpotify(text);

            if (!result || result.length === 0) {
                await react('❌');
                return replyfail(mess.error.fitur);
            }

            let caption = result.map((v, i) => {
                let desc = `Artist: ${v.artists} | Popularity: ${v.popularity}`;
                return {
                    header: "",
                    title: v.name.length > 30 ? v.name.substring(0, 27) + '...' : v.name,
                    description: desc.length > 60 ? desc.substring(0, 57) + '...' : desc,
                    id: `${prefix}spdl ${v.link}`
                };
            });

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: {
                            body: {
                                text: `🔎 Hasil Pencarian Spotify\n*${text}*`,
                            },
                            footer: {
                                text: global.botname
                            },
                            header: {
                                title: "Spotify - Search",
                                subtitle: "",
                                hasMediaAttachment: false,
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "PILIH LAGU",
                                            sections: [
                                                {
                                                    title: "Daftar Lagu Spotify",
                                                    rows: caption
                                                }
                                            ]
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { quoted: m }, {});
            
            await hydro.relayMessage(msg.key.remoteJid, msg.message, {
                messageId: msg.key.id
            });

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅');

        } catch (e) {
            console.error(e);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'songs':
    case 'play': {
        if (!text) return replyquery(`📌 *Contoh Penggunaan:*\n${prefix + command} 7!! - Orange Official`);

        let cost = getLimitCost('play', 0);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️');

        try {
            const search = await yts(text);
            
            const video = search.videos[0]; 
            
            if (!video) {
                await react('❌');
                return replyfail('❌ Video/Lagu tidak ditemukan!');
            }

            const bodyText = `• *Judul:* ${video.title}\n` +
                `• *Channel:* ${video.author.name}\n` +
                `• *Durasi:* ${video.timestamp}\n` +
                `• *Views:* ${video.views}\n` +
                `• *Upload:* ${video.ago}\n` +
                `• *Link:* ${video.url}`;

            const resolusiVideo = ['144', '240', '360', '480', '720', '1080', '1440', '2160'];
            let listMp4 = resolusiVideo.map(res => {
                return {
                    header: "",
                    title: `${res}p`,
                    description: `Download video kualitas ${res}p`,
                    id: `${prefix}ytmp4 ${video.url} ${res}`
                };
            });

            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: {
                            body: {
                                text: bodyText,
                            },
                            footer: {
                                text: global.botname
                            },
                            header: {
                                title: "",
                                subtitle: "",
                                hasMediaAttachment: true,
                                ...(await prepareWAMessageMedia({ image: { url: video.thumbnail } }, { upload: hydro.waUploadToServer }))
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "🎵 AUDIO",
                                            id: `${prefix}ytmp3 ${video.url}`
                                        })
                                    },
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "🎥 VIDEO",
                                            sections: [
                                                {
                                                    title: "Pilih Resolusi",
                                                    rows: listMp4
                                                }
                                            ]
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { quoted: m });

            await hydro.relayMessage(msg.key.remoteJid, msg.message, {
                messageId: msg.key.id
            });

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅');

        } catch (err) {
            console.error(err);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
        
// ====== CONVERTER FEATURE ======

    case 's':
    case 'sticker':
    case 'stiker':
    case 'tosticker': {
        let isImageMsg = type === 'imageMessage' || (m.quoted && m.quoted.mtype === 'imageMessage');
        let isVideoMsg = type === 'videoMessage' || (m.quoted && m.quoted.mtype === 'videoMessage');

        if (!isImageMsg && !isVideoMsg) return replyquery(`📌 Reply gambar atau video dengan caption *${prefix + command}*`);

        let cost = getLimitCost('tosticker', 1);
        let totalLimit = checkLimit(m.sender, Ahmad);
        if (totalLimit !== "∞" && totalLimit < cost) return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);

        await react('⏱️');
        try {
            if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

            let mediaBuffer = await (m.quoted ? m.quoted.download() : m.download());
            let ranId = crypto.randomBytes(4).toString('hex');
            let ext = isVideoMsg ? '.mp4' : '.png';
            let tmpIn = `./temp/${ranId}${ext}`;
            let tmpOut = `./temp/${ranId}.webp`;

            fs.writeFileSync(tmpIn, mediaBuffer);
            let ffmpegArgs = isVideoMsg 
                ? `-vcodec libwebp -filter_complex "[0:v]scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" -loop 0 -preset default -an -vsync 0 -t 10` 
                : `-vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -preset default -an -vsync 0`;

            exec(`ffmpeg -i ${tmpIn} ${ffmpegArgs} ${tmpOut}`, async (err) => {
                if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
                if (err) {
                    await react('❌');
                    return replyfail(mess.error.fitur);
                }
                
                let webp = fs.readFileSync(tmpOut);

                webp = await addExif(webp, global.packname, global.author);

                await hydro.sendMessage(m.chat, { sticker: webp }, { quoted: m });
                if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);

                if (cost > 0) {
                    useLimit(m.sender, cost, Ahmad);
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                }
                await react('✅');
            });
        } catch (e) {
            console.error(e);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'toimg':
    case 'toimage': {
        let isStickerMsg = m.quoted && m.quoted.mtype === 'stickerMessage';
        if (!isStickerMsg) return replyquery(`📌 Reply stiker dengan caption *${prefix + command}*`);

        let cost = getLimitCost('toimg', 1);
        let totalLimit = checkLimit(m.sender, Ahmad);
        if (totalLimit !== "∞" && totalLimit < cost) return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);

        await react('⏱️');
        try {
            if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

            let mediaBuffer = await m.quoted.download();
            let ranId = crypto.randomBytes(4).toString('hex');
            let tmpIn = `./temp/${ranId}.webp`;
            let tmpOut = `./temp/${ranId}.png`;

            fs.writeFileSync(tmpIn, mediaBuffer);

            exec(`ffmpeg -i ${tmpIn} ${tmpOut}`, async (err) => {
                if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
                if (err) {
                    await react('❌');
                    return replyfail('❌ Media ini tidak bisa dijadikan gambar. Gunakan .tovid jika video');
                }
                
                let img = fs.readFileSync(tmpOut);
                await hydro.sendMessage(m.chat, { image: img, caption: mess.success }, { quoted: m });
                if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);

                if (cost > 0) {
                    useLimit(m.sender, cost, Ahmad);
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                }
                await react('✅');
            });
        } catch (e) {
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'tovid':
    case 'tovideo': {
        let isStickerMsg = m.quoted && m.quoted.mtype === 'stickerMessage';
        if (!isStickerMsg) return replyquery(`📌 Reply stiker (bergerak) dengan caption *${prefix + command}*`);

        let cost = getLimitCost('tovid', 2);
        let totalLimit = checkLimit(m.sender, Ahmad);
        if (totalLimit !== "∞" && totalLimit < cost) return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);

        await react('⏱️');
        try {
            if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

            let mediaBuffer = await m.quoted.download();
            let ranId = crypto.randomBytes(4).toString('hex');
            let tmpIn = `./temp/${ranId}.webp`;
            let tmpOut = `./temp/${ranId}.mp4`;

            fs.writeFileSync(tmpIn, mediaBuffer);

            exec(`ffmpeg -i ${tmpIn} -c:v libx264 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tmpOut}`, async (err) => {
                if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
                if (err) {
                    await react('❌');
                    return replyfail('❌ Media ini tidak bisa dijadikan video. Gunakan .toimg jika gambar');
                }
                
                let vid = fs.readFileSync(tmpOut);
                await hydro.sendMessage(m.chat, { video: vid, caption: mess.success }, { quoted: m });
                if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);

                if (cost > 0) {
                    useLimit(m.sender, cost, Ahmad);
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                }
                await react('✅');
            });
        } catch (e) {
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'tomp3':
    case 'toaudio': {
        let isVideoMsg = type === 'videoMessage' || (m.quoted && m.quoted.mtype === 'videoMessage');
        let isAudioMsg = type === 'audioMessage' || (m.quoted && m.quoted.mtype === 'audioMessage');
        if (!isVideoMsg && !isAudioMsg) return replyquery(`📌 Reply video atau voice note dengan caption *${prefix + command}*`);

        let cost = getLimitCost('tomp3', 1);
        let totalLimit = checkLimit(m.sender, Ahmad);
        if (totalLimit !== "∞" && totalLimit < cost) return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);

        await react('⏱️');
        try {
            if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

            let mediaBuffer = await (m.quoted ? m.quoted.download() : m.download());
            let ranId = crypto.randomBytes(4).toString('hex');
            let tmpIn = `./temp/${ranId}.mp4`;
            let tmpOut = `./temp/${ranId}.mp3`;

            fs.writeFileSync(tmpIn, mediaBuffer);

            exec(`ffmpeg -i ${tmpIn} -vn -b:a 128k ${tmpOut}`, async (err) => {
                if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
                if (err) {
                    await react('❌');
                    return replyfail('❌ Gagal mengekstrak audio.');
                }
                
                let aud = fs.readFileSync(tmpOut);
                await hydro.sendMessage(m.chat, { audio: aud, mimetype: 'audio/mp4' }, { quoted: m });
                if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);

                if (cost > 0) {
                    useLimit(m.sender, cost, Ahmad);
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                }
                await react('✅');
            });
        } catch (e) {
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'togif': {
        let isVideoMsg = type === 'videoMessage' || (m.quoted && m.quoted.mtype === 'videoMessage');
        if (!isVideoMsg) return replyquery(`📌 Reply video dengan caption *${prefix + command}*`);

        let cost = getLimitCost('togif', 1);
        let totalLimit = checkLimit(m.sender, Ahmad);
        if (totalLimit !== "∞" && totalLimit < cost) return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);

        await react('⏱️');
        try {
            let mediaBuffer = await (m.quoted ? m.quoted.download() : m.download());
            
            await hydro.sendMessage(m.chat, { 
                video: mediaBuffer, 
                gifPlayback: true, 
                caption: mess.success
            }, { quoted: m });

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }
            await react('✅');
        } catch (e) {
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'tofile':
    case 'todoc':
    case 'todocument': {
        if (!mime) return replyquery(`📌 Reply media apa saja (gambar, stiker, video, audio, dokumen) dengan caption *${prefix + command}*`);

        let cost = getLimitCost('tofile', 1); 
        let totalLimit = checkLimit(m.sender, Ahmad);
        if (totalLimit !== "∞" && totalLimit < cost) return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);

        await react('⏱️');
        try {
            if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

            let mediaBuffer = await (m.quoted ? m.quoted.download() : m.download());
            let ranId = crypto.randomBytes(4).toString('hex');
            
            let ext = 'bin'; 
            if (mime.includes('webp')) ext = 'webp';
            else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
            else if (mime.includes('png')) ext = 'png';
            else if (mime.includes('mp4')) ext = 'mp4';
            else if (mime.includes('ogg')) ext = 'ogg';
            else if (mime.includes('mpeg')) ext = 'mp3';
            else if (mime.includes('pdf')) ext = 'pdf';
            else if (mime.includes('zip')) ext = 'zip';
            else if (mime.includes('rar')) ext = 'rar';
            else if (mime.includes('apk') || mime.includes('android.package-archive')) ext = 'apk';
            else ext = mime.split('/')[1]?.split(';')[0]?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';

            let tmpIn = `./temp/${ranId}.${ext}`;
            fs.writeFileSync(tmpIn, mediaBuffer);

            await hydro.sendMessage(m.chat, { 
                document: fs.readFileSync(tmpIn), 
                mimetype: mime, 
                fileName: `${ranId}.${ext}`, 
                caption: mess.success
            }, { quoted: m });

            if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }
            await react('✅');
        } catch (e) {
            console.error(e);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'tovn':
    case 'toptt': {
        let isVideoMsg = type === 'videoMessage' || (m.quoted && m.quoted.mtype === 'videoMessage');
        let isAudioMsg = type === 'audioMessage' || (m.quoted && m.quoted.mtype === 'audioMessage');
        
        if (!isVideoMsg && !isAudioMsg) return replyquery(`📌 Reply video atau lagu/audio dengan caption *${prefix + command}*`);

        let cost = getLimitCost('tovn', 1);
        let totalLimit = checkLimit(m.sender, Ahmad);
        if (totalLimit !== "∞" && totalLimit < cost) return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);

        await react('⏱️');
        try {
            if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

            let mediaBuffer = await (m.quoted ? m.quoted.download() : m.download());
            let ranId = crypto.randomBytes(4).toString('hex');
            
            let ext = isVideoMsg ? '.mp4' : '.mp3';
            let tmpIn = `./temp/${ranId}${ext}`;
            let tmpOut = `./temp/${ranId}.ogg`;

            fs.writeFileSync(tmpIn, mediaBuffer);

            exec(`ffmpeg -i ${tmpIn} -vn -c:a libopus -b:a 128k ${tmpOut}`, async (err) => {
                if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
                if (err) {
                    await react('❌');
                    return replyfail('❌ Gagal mengubah media menjadi Voice Note.');
                }
                
                let aud = fs.readFileSync(tmpOut);
                
                await hydro.sendMessage(m.chat, { 
                    audio: aud, 
                    mimetype: 'audio/ogg; codecs=opus', 
                    ptt: true 
                }, { quoted: m });
                
                if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);

                if (cost > 0) {
                    useLimit(m.sender, cost, Ahmad);
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                }
                await react('✅');
            });
        } catch (e) {
            console.error(e);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'swm':
    case 'steal':
    case 'stickerwm':
    case 'take':
    case 'wm': {
        let isStickerMsg = m.quoted && m.quoted.mtype === 'stickerMessage';
        if (!isStickerMsg) return replyquery(`⚠️ Reply stickernya dulu!`);

        let cost = getLimitCost('swm', 1);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        let ahuh = text ? text.split('|') : [];
        let packname = ahuh[0] ? ahuh[0].trim() : ' '; 
        let author = ahuh[1] ? ahuh[1].trim() : ' ';   

        await react('⏱️');

        try {
            let mediaBuffer = await m.quoted.download(); 
            
            let newStickerBuffer = await addExif(mediaBuffer, packname, author);

            await hydro.sendMessage(m.chat, { sticker: newStickerBuffer }, { quoted: m });

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }
            
            await react('✅');
        } catch (e) {
            console.error(e);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;

// ====== AI FEATURE ======

    case 'mathgpt':
    case 'mtkgpt': {
        let isImageMsg = type === 'imageMessage' || (m.quoted && m.quoted.mtype === 'imageMessage');
        
        if (!text && !isImageMsg) return replyquery(`📌 Contoh Penggunaan:\n*${prefix + command} 1+1=?*\n\nAtau kirim/reply gambar soal matematika dengan caption *${prefix + command}*`);

        let cost = getLimitCost('mathgpt', 2);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️');

        try {
            let imgBuffer = null;
            let mimeType = null;
            let extension = 'jpg';

            if (isImageMsg) {
                imgBuffer = await (m.quoted ? m.quoted.download() : m.download());
                mimeType = mime || (m.quoted && m.quoted.msg ? m.quoted.msg.mimetype : 'image/jpeg');
                extension = mimeType.split('/')[1]?.split(';')[0] || 'jpg';
            }

            let questionText = text || "Tolong selesaikan dan jelaskan soal pada gambar ini.";
            
            const res = await mathgpt({
                question: questionText,
                think: false,
                image: imgBuffer,
                mime: mimeType,
                ext: extension
            });

            let formattedResponse = res.content
                .replace(/\*\*/g, '*')
                .replace(/\$\$/g, '')
                .replace(/\$/g, '')
                .replace(/\\text{([^}]*)}/g, '$1')
                .replace(/\\sqrt{([^}]*)}/g, '√($1)')
                .replace(/\\times/g, '×')
                .replace(/\n{3,}/g, '\n\n')
                .trim();

            await reply(`*🤖 MathGPT AI*\n\n${formattedResponse}`);

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅');
        } catch (e) {
            console.error(e);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'felo':
    case 'feloai': {
        if (!text) return replyquery(`📌 Contoh Penggunaan:\n*${prefix + command} Apa itu kecerdasan buatan?*`);

        let cost = getLimitCost('felo', 2);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️');

        try {
            const client = new FeloClient();

            const { answer, sources } = await client.search(text);

            if (!answer) throw new Error("Tidak ada jawaban yang diterima dari AI.");

            let responseText = `*🤖 Felo AI*\n\n${answer}`;
            
            if (sources && sources.length > 0) {
                responseText += `\n\n*📚 Sumber:*`;
                sources.forEach((src, index) => {
                    responseText += `\n*${index + 1}.* ${src.title}\n🔗 ${src.url}`;
                });
            }

            await reply(responseText);

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅');
        } catch (e) {
            console.error(e);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'chatex':
    case 'chatexai': {
        if (!text) return replyquery(`📌 Contoh Penggunaan:\n*${prefix + command} Buatkan saya puisi tentang laut*`);

        let cost = getLimitCost('chatex', 2);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        await react('⏱️');

        try {
            const res = await chatex(text);

            if (!res || !res.text) throw new Error("Tidak ada respon yang diterima dari AI.");

            let responseText = `*🤖 ChatEx AI*\n\n${res.text}`;

            await reply(responseText);

            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }

            await react('✅');
        } catch (e) {
            console.error("ChatEx AI Error:", e);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;

// ====== UTILITY FEATURE ======
    
    case 'rch':
    case 'frch':
    case 'fakereactch':
    case 'fakerch':
    case 'reactch': {
        if (args.length < 2) return replyquery(`⚠️ *Format Salah!*\nGunakan format:\n${prefix + command} <link_post> <emoji>\n\n📌 *Contoh:*\n${prefix + command} https://whatsapp.com/channel/xxx/123 😂 😱`)

        let cost = getLimitCost('reactch', 5);
        let totalLimit = checkLimit(m.sender, Ahmad); 
        
        if (totalLimit !== "∞" && totalLimit < cost) {
            return replylimit(`Limit kamu kurang!\nButuh *${cost}* limit.\n> Sisa limit: *${totalLimit}*`);
        }

        const link = args[0]
        const emoji = args.slice(1).join(" ").replace(/,/g, " ").split(/\s+/).filter(e => e.trim()).join(",")

        await react('⏳');

        if (!global.frch || !Array.isArray(global.frch) || global.frch.length === 0) {
            await react('❌');
            return replyfail('❌ Error: Array `global.frch` belum diatur di file settings!');
        }

        let success = false;
        let lastError = 'Unknown error';

        for (const jwtToken of global.frch) {
            try {
                const reactor = new ReactChannel({ userJwt: jwtToken });
                const response = await reactor.reactToPost(link, emoji);

                if (response) {
                    let teks = `✅ *React Sent!*\n\n🔗 *Target:* ${link}\n🎭 *Emoji:* ${emoji.replace(/,/g, ' ')}\n\n🚀 *Powered by ${global.botname}*`;
                    
                    await react('✅');
                    await replysuccess(teks);
                    success = true;
                    break;
                }
            } catch (e) {
                lastError = e.response?.data?.message || e.response?.data?.error || e.message || 'Terjadi Kesalahan Sistem';
            }
        }

        if (!success) {
            let teks = `❌ *GAGAL MENGIRIM REAKSI*\n\n📝 *Pesan:* ${lastError}`;
            await react('❌');
            await replyfail(teks);
        } else {
            if (cost > 0) {
                useLimit(m.sender, cost, Ahmad);
                fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
            }
        }
    }
        break;


// ====== ADDCASE ======

    case 'addcase': {
            if (!Ahmad) return replytolak(mess.only.owner)
            if (!q) return replyquery('Mana case nya');
            const namaFile = 'hydro.js';
            const caseBaru = `${text}`;
            fs.readFile(namaFile, 'utf8', (err, data) => {
            if (err) {
            console.error('Terjadi kesalahan saat membaca file:', err);
            return;
            }

            const posisiAwalGimage = data.indexOf("case 'addcase':");

            if (posisiAwalGimage !== -1) {
            const kodeBaruLengkap = data.slice(0, posisiAwalGimage) + '\n' + caseBaru + '\n' + data.slice(posisiAwalGimage);
            fs.writeFile(namaFile, kodeBaruLengkap, 'utf8', (err) => {
            if (err) {
                replyfail('Terjadi kesalahan saat menulis file:', err);
            } else {
                replysuccess('Case baru berhasil ditambahkan di atas case gimage.');
            }
            });
            } else {
            replyfail('Tidak dapat menemukan case gimage dalam file.');
           }
           });

           }
        break
    
// ===========================

    case 'ping':
    case 'statusbot':
    case 'botstatus': {
        let timestamp = m.messageTimestamp ? (typeof m.messageTimestamp === 'number' ? m.messageTimestamp : m.messageTimestamp.low) : (Date.now() / 1000);
        let now = Date.now();
        let latensi = now - (timestamp * 1000);

        const startProcess = performance.now();

        let osName = 'Unknown OS';
        try {
            if (process.platform === 'linux' && fs.existsSync('/etc/os-release')) {
                const osInfo = fs.readFileSync('/etc/os-release', 'utf8');
                const nameMatch = osInfo.match(/^NAME="?(.+?)"?$/m);
                const verMatch = osInfo.match(/^VERSION="?(.+?)"?$/m);
                const name = nameMatch ? nameMatch[1].replace(/"/g, '') : '';
                const version = verMatch ? verMatch[1].replace(/"/g, '') : '';
                osName = `${name} ${version}`.trim();
            } else if (process.platform === 'win32') {
                osName = 'Windows';
            } else if (process.platform === 'darwin') {
                osName = 'macOS';
            } else {
                osName = os.type();
            }
            } catch {
                osName = os.type();
            }

            const runtimeFormat = (seconds) => {
                const d = Math.floor(seconds / (3600 * 24));
                const h = Math.floor((seconds % (3600 * 24)) / 3600);
                const m = Math.floor((seconds % 3600) / 60);
                const s = Math.floor(seconds % 60);
                return `*${d}* ☀️ Hari\n│ *${h}* 🕐 Jam\n│ *${m}* ⏰ Menit\n│ *${s}* ⏱️ Detik`;
            };

            const formatp = (bytes) => `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;

            const getCpuUsage = async (delay = 100) => {
                const start = os.cpus();
                await new Promise(r => setTimeout(r, delay));
                const end = os.cpus();
                let idleDiff = 0, totalDiff = 0;

                for (let i = 0; i < start.length; i++) {
                    const s = start[i].times;
                    const e = end[i].times;
                    const idle = e.idle - s.idle;
                    const total = Object.keys(s).reduce((a, t) => a + (e[t] - s[t]), 0);
                    idleDiff += idle;
                    totalDiff += total;
                }
                return 100 - Math.round((idleDiff / totalDiff) * 100);
            };

            const cpuUsagePercent = await getCpuUsage();

            const cpus = os.cpus();
            const avgSpeed = cpus.reduce((a, c) => a + c.speed, 0) / cpus.length;
            const cpuModel = cpus[0]?.model?.trim() || 'Unknown CPU';
            const cpuCore = cpus.length;

            const mem = os.totalmem();
            const free = os.freemem();

            let swapTotal = 0, swapFree = 0;
            try {
                if (fs.existsSync('/proc/meminfo')) {
                    const info = fs.readFileSync('/proc/meminfo', 'utf8');
                    const swapTotalMatch = info.match(/^SwapTotal:\s+(\d+)/m);
                    const swapFreeMatch = info.match(/^SwapFree:\s+(\d+)/m);
                    swapTotal = swapTotalMatch ? parseInt(swapTotalMatch[1]) * 1024 : 0;
                    swapFree = swapFreeMatch ? parseInt(swapFreeMatch[1]) * 1024 : 0;
                }
            } catch {}

            const totalMemAll = mem + swapTotal;
            const usedMemAll = (mem - free) + (swapTotal - swapFree);
            const percentUsed = totalMemAll > 0 ? (usedMemAll / totalMemAll) * 100 : 0;

            const runtimeText = runtimeFormat(process.uptime());
            const waktu = moment().tz("Asia/Jakarta").format('HH:mm:ss');
            const tanggal = moment().tz("Asia/Jakarta").locale("id").format('dddd, D MMMM YYYY');

            const endProcess = performance.now();
            const responInSeconds = ((endProcess - startProcess) / 1000).toFixed(4);

            const val = parseFloat(responInSeconds);
            let p = 0;

            if (val >= 1.0000) p = 100;
            else if (val <= 0.0001) p = 0;
            else if (val <= 0.0010) p = 0 + ((val - 0.0001) / (0.0010 - 0.0001)) * 20;
            else if (val <= 0.0100) p = 20 + ((val - 0.0010) / (0.0100 - 0.0010)) * 20;
            else if (val <= 0.1000) p = 40 + ((val - 0.0100) / (0.1000 - 0.0100)) * 20;
            else if (val <= 0.6000) p = 60 + ((val - 0.1000) / (0.6000 - 0.1000)) * 20;
            else p = 80 + ((val - 0.6000) / (1.0000 - 0.6000)) * 20;

            const chart = new QuickChart();
            chart.setVersion('3');
            chart.setWidth(500);
            chart.setHeight(300);
            chart.setConfig({
                type: 'bar',
                data: {
                    labels: [''],
                    datasets: [
                        { label: 'Safe', data: [20], backgroundColor: '#32CD32', barPercentage: 1, categoryPercentage: 1 },
                        { label: 'Low Risk', data: [20], backgroundColor: '#ADFF2F', barPercentage: 1, categoryPercentage: 1 },
                        { label: 'Warning', data: [20], backgroundColor: '#FFFF00', barPercentage: 1, categoryPercentage: 1 },
                        { label: 'High Risk', data: [20], backgroundColor: '#FFA500', barPercentage: 1, categoryPercentage: 1 },
                        { label: 'Critical', data: [20], backgroundColor: '#FF0000', barPercentage: 1, categoryPercentage: 1 },
                    ],
                },
                options: {
                    indexAxis: 'y',
                    layout: { padding: { top: 60, bottom: 20, left: 20, right: 20 } },
                    scales: {
                        x: {
                            stacked: true, min: 0, max: 100,
                            ticks: {
                                display: true, color: '#999', maxRotation: 45, minRotation: 45,
                                font: { size: 10 },
                                callback: (val) => {
                                    const l = {0:'0.0001', 10:'0.0003', 20:'0.0010', 30:'0.0030', 40:'0.0100', 50:'0.0300', 60:'0.1000', 70:'0.3000', 80:'0.6000', 90:'0.8000', 100:'1.0000'};
                                    return l[val] || '';
                                }
                            },
                            grid: { display: false }
                        },
                        y: { display: false, stacked: true }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                        annotation: {
                            clip: false,
                            annotations: {
                                text: {
                                    type: 'label',
                                    xValue: p, yValue: 0, yAdjust: -125,
                                    content: [`Respond: ${responInSeconds}s`],
                                    color: 'black', font: { size: 14, weight: 'bold' },
                                    position: 'center', backgroundColor: 'transparent'
                                },
                                panah: {
                                    type: 'point', xValue: p, yValue: 0, yAdjust: -100,
                                    pointStyle: 'triangle', rotation: 180, radius: 8,
                                    backgroundColor: 'black', borderColor: 'black'
                                },
                                garis: {
                                    type: 'line', xMin: p, xMax: p, yMin: -0.5, yMax: 0.5,
                                    borderColor: 'black', borderWidth: 2, borderDash: [6, 4]
                                }
                            }
                        }
                    }
                }
            });

            let pingIcon;
            if (latensi < 100) pingIcon = "🟢";
            else if (latensi < 300) pingIcon = "🔵";
            else if (latensi < 600) pingIcon = "🟡";
            else if (latensi < 1000) pingIcon = "🟠";
            else pingIcon = "🔴";

            const response = `
╭───⏱️ *[ STATUS BOT ]* ⏱️
│
├ 💠 *Ping:* ${pingIcon} ${latensi.toFixed(0)} ms
├ 💠 *Respon:* ${responInSeconds} detik
│
├ 📈 *Uptime:*
│  ${runtimeText}
│
├ 🖥️ *Server Info:*
│  🔵 Platform : ${os.platform()}
│  💻 OS        : ${osName}
│  🧿 Hostname : ${os.hostname()}
│  🌎 Zona      : ${Intl.DateTimeFormat().resolvedOptions().timeZone}
│  🧠 CPU       : ${cpuModel}
│  🔩 Core      : ${cpuCore} Core
│  ⚡ Speed     : ${avgSpeed.toFixed(2)} MHz
│
├ 📊 *RAM Usage:*
│  ${formatp(usedMemAll)} / ${formatp(totalMemAll)} (${percentUsed.toFixed(1)}%)
│
├ ⚡ *CPU Usage:*
│  ${cpuUsagePercent.toFixed(1)}% dari ${cpuCore} Core
│
├ 🗓️ *Tanggal:* ${tanggal}
├ 🕒 *Waktu:* ${waktu} WIB
╰─────────────────────
`.trim();

            hydro.sendMessage(m.chat, {
                text: response,
                contextInfo: {
                    externalAdReply: {
                        title: "🏓 Status bot online >.<",
                        body: global.botname,
                        thumbnailUrl: chart.getUrl(),
                        sourceUrl: "https://store.hydrohost.web.id",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        }
        break;
    case 'sc':
    case 'script': {
        try {

            let localVersion = 'Unknown';
            try {
                let localPkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
                localVersion = localPkg.version;
            } catch (e) {}

            let latestVersion = 'Unknown';
            try {
                let { data: pkgData } = await axios.get('https://raw.githubusercontent.com/AhmadAkbarID/hydromd/refs/heads/master/package.json');
                latestVersion = pkgData.version;
            } catch (e) {}

            let releases = [];
            try {
                let { data: relData } = await axios.get('https://api.github.com/repos/AhmadAkbarID/hydromd/releases');
                releases = relData; 
            } catch (e) {}

            let repoUrl = 'https://github.com/AhmadAkbarID/hydromd';
            let latestTag = releases.length > 0 ? releases[0].tag_name : 'master';

            let bodyText = `✨ Hai Kak! Mau coba script mimin yang keren ama banyak fitur ga? GRATIS JUGA! 🎉\n\n` +
                           `📦 *Versi Bot:* v${localVersion}\n` +
                           `🚀 *Versi Terbaru:* v${latestVersion}\n\n` +
                           `🔗 *Link Script:*\n${repoUrl}\n\n` +
                           `👥 Gabung juga nih grup kita!:\n${global.wagc || 'https://chat.whatsapp.com/FvSBEz1UezQ4G7Xwfrr9sF'}\n\n` +
                           `Yuu dukung trus agar bisa berkembang bot ini 🤩`;

            let sortedReleases = releases.slice();
            let rows = sortedReleases.map((rel) => {
                return {
                    header: "",
                    title: `🏷️ ${rel.name || rel.tag_name}`,
                    description: `Publish ${rel.published_at.split('T')[0]}`,
                    id: `${prefix}gitclone ${repoUrl} ${rel.tag_name}`
                };
            });

            if (rows.length === 0) {
                rows.push({
                    header: "",
                    title: "📦 Master Branch",
                    description: "Download versi terbaru dari branch master",
                    id: `${prefix}gitclone ${repoUrl} master`
                });
            }

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                        interactiveMessage: {
                            body: { text: bodyText },
                            footer: { text: global.botname },
                            header: {
                                title: "Script HydroMD",
                                subtitle: "",
                                hasMediaAttachment: false
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "🚀 Download Latest",
                                            id: `${prefix}gitclone ${repoUrl} ${latestTag}`
                                        })
                                    },
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "📂 Select Release",
                                            sections: [
                                                {
                                                    title: "Daftar Versi",
                                                    rows: rows
                                                }
                                            ]
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { quoted: m }, {});

            await hydro.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await react('✅');

        } catch (err) {
            console.error(err);
            await react('❌');
            replyfail(mess.error.fitur);
        }
    }
        break;
    case 'rating': {
        let nilai = parseInt(text.trim());

        if (!isNaN(nilai)) {
            if (nilai < 1 || nilai > 10) return replyfail(`❌ Rating hanya boleh 1-10`);

            await react('⏱️');

            let { data: existing, error: checkError } = await supabase
                .from('ratings')
                .select('id')
                .eq('user_id', m.sender)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                await react('❌');
                return replyfail(`⚠️ Terjadi kesalahan: ${checkError.message}`);
            }

            if (existing) {
                await react('❌');
                return replytolak('❌ Kamu sudah memberikan rating sebelumnya.\n`Terima kasih!`');
            }

            let { error } = await supabase
                .from('ratings')
                .insert([{ user_id: m.sender, nilai }]);

            if (error) {
                await react('❌');
                return replyfail(`⚠️ Gagal menyimpan rating: ${error.message}`);
            }

            let quickMsg = {
                text: `✅ Terima kasih! Kamu memberikan rating *${nilai}* ⭐`,
                footer: global.botname,
                buttons: [
                    {
                        buttonId: `${prefix}cekrating`,
                        buttonText: { displayText: '📊 Cek total rating' },
                        type: 1
                    }
                ],
                headerType: 1
            };
            
            await hydro.sendMessage(m.chat, quickMsg, { quoted: m });
            return await react('✅');
        }

        let rows = Array.from({ length: 10 }, (_, i) => ({
            header: "",
            title: `${i + 1} ⭐`,
            description: `Beri rating ${i + 1} bintang`,
            id: `${prefix}rating ${i + 1}`
        }));

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: {
                            text: `📌 Silakan pilih rating untuk bot ini:`
                        },
                        footer: {
                            text: global.botname
                        },
                        header: {
                            title: "⭐ Rating Bot",
                            subtitle: "",
                            hasMediaAttachment: false
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "Pilih Rating",
                                        sections: [
                                            {
                                                title: "Rating 1–10",
                                                rows: rows
                                            }
                                        ]
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }, { quoted: m }, {});

        await hydro.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id
        });
    }
        break;
    case 'cekrating': {
        await react('⏱️');
        
        let { data, error } = await supabase
            .from('ratings')
            .select('nilai');

        if (error) {
            await react('❌');
            return replyfail(`⚠️ Gagal mengambil rating: ${error.message}`);
        }
        
        if (!data || !data.length) {
            await react('✅');
            return replyquery(`⚠️ Belum ada pengguna yang memberikan rating.`);
        }

        let semuaRating = data.map(r => r.nilai);
        let rata2 = (semuaRating.reduce((a, b) => a + b, 0) / semuaRating.length).toFixed(1);
        
        await reply(`📊 Rata-rata rating bot ini adalah *${rata2}* ⭐\nDari total ${semuaRating.length} penilai.`);
        await react('✅');
    }
        break;
    case 'infobot': {
        await react('⏱️');
        
        let versiSc = 'Unknown';
        try {
            let localPkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
            versiSc = localPkg.version;
        } catch (e) {}

        let infoText = `*╭─❒ 「 INFORMASI ${global.botname} 」*\n` +
        `├ OWNER: *${global.ownername}*\n` +
        `├ VERSI: *v${versiSc}*\n` +
        `├ RUNTIME: *${runtime(process.uptime())}*\n` +
        `├ RAM: *${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}*\n` +
        `╰─❒\n\n` +
        `*✦ INFORMASI SISTEM ✦*\n` +
        `Bot ini sedang aktif dan siap membantu kamu! \n` +
        `Nikmati fitur-fitur canggih yang kami tawarkan untuk memudahkan kegiatanmu. \n` +
        `Jangan lupa update terus ya biar tetap dapet fitur terbaru!\n\n` +
        `Terima kasih telah menggunakan bot kami! 😊\n\n` +
        `💖 *Terima kasih spesial untuk:* \n` +
        `➤ Ibracode – Penyedia Baileys SOCKETON\n` +
        `➤ Ahmad Akbar – Dev/Owner Script\n` +
        `➤ Taka, Apocalypse, XAi Archive, Ryuusuke – Membagi kode dan scrape\n` +
        `➤ Zanspiw – Sharing Script\n\n` +
        `Berkat mereka, bot ini bisa berkembang dan terus memberikan yang terbaik! 🚀✨`;

        await replysuccess(infoText);
        await react('✅');
    }
        break;
} // End Switch

    if (budy.startsWith('<')) {
        if (!Ahmad) return;
        try {
            return reply(JSON.stringify(eval(budy.slice(1).trim()), null, '\t'));
        } catch (e) {
            reply(String(e));
        }
    }

    if (budy.startsWith('$')) {
        if (!Ahmad) return reply(global.mess.only.owner);
        exec(budy.slice(1).trim(), (err, stdout) => {
            if (err) return reply(err.toString());
            if (stdout) return reply(util.format(stdout));
        });
    }

    if (budy.startsWith('vv')) {
        if (!Ahmad) return;
        try {
            let evaled = await eval(budy.slice(2).trim());
            if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
            await reply(evaled);
        } catch (err) {
            reply(String(err));
        }
    }

    if (budy.startsWith('>')) {
        if (!Ahmad) return;
        try {
            let evaled = await eval(budy.slice(1).trim()); 
            if (typeof evaled !== 'string') evaled = util.inspect(evaled);
            reply(util.format(evaled));
        } catch (e) {
            reply(util.format(e));
        }
    }

    if (budy.startsWith('uu')) {
        if (!Ahmad) return;
        let qur = budy.slice(2).trim();
        exec(qur, (err, stdout) => {
            if (err) return reply(`${err}`);
            if (stdout) return reply(stdout);
        });
    }

} catch (err) {
    console.log(util.format(err))
}
}

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err)
})

// ======================== Auto Reload File ===================== \\
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`[ UPDATE ] '${__filename}'`))
    delete require.cache[file]
    require(file)
})