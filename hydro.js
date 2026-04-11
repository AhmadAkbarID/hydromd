/*
• SCRIPT INI GRATIS 100%
• BEBAS RECODE 
• JANGAN DI JUAL
*/

require('./settings');

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
    initDatabase
} = require('./lib/database');

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
    const { reply, replytolak, replyquery, replysuccess, replyfail, replywait, appenTextMessage } = msgHelper;
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

    if (baseId.startsWith('BAE5') || baseId.length === 16) return;

    let isOtherBot = false;
    if (baseId.match(/[^0-9A-F]/gi)) isOtherBot = true;
    if (baseId.length !== 32 && !baseId.startsWith('3EB0') && !baseId.startsWith('3A')) isOtherBot = true;
    if (isOtherBot && !Ahmad && !m.key.fromMe) return;

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
    const groupMetadata = m.isGroup ? store.groupMetadata[m.chat] || (store.groupMetadata[m.chat] = await hydro.groupMetadata(m.chat).catch(e => {})) : '';
    const groupName = m.isGroup ? groupMetadata.subject : ''
    const participants = m.isGroup ? await groupMetadata.participants : ''

    if (m.isGroup && m.sender.endsWith("@lid")) {
        m.sender = participants.find(p => p.lid === m.sender)?.jid || m.sender;
    }

    const groupAdmins = m.isGroup ? participants.filter((v) => v.admin !== null).map((i) => i.jid || i.id) : [];
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
    const isGroupAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
    
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



// ====== FUNCTION AREA ======
    // ==============================================
    
switch (command) {
    
    case 'menu': { 
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

            await hydro.sendMessage(m.chat, { react: { text: `🌊`, key: m.key }})
            
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

            const bet = getMenuList();
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

// ====== OWNER FEATURE ======

    case 'addowner': {
            if (!Ahmad) return replytolak(global.mess.only.owner)
            
            let num;
            if (m.quoted) num = m.quoted.sender.split('@')[0]
            else if (m.mentionedJid && m.mentionedJid[0]) num = m.mentionedJid[0].split('@')[0]
            else if (args[0]) num = args[0].replace(/[^0-9]/g, '')
            else return replyquery('Tag orangnya, balas pesannya, atau ketik nomornya!\nContoh: *.addowner @user*')
            
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
            else return replyquery('Tag orangnya, balas pesannya, atau ketik nomornya!\nContoh: *.delowner @user*')
            
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

    replyhydro(mess.wait)

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

        reply(global.mess.wait)
        
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
            replysuccess(`✅ Berhasil mengatur prefix khususmenjadi:\n${listPrefix}`)
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
            if (!text.includes(',')) return replyquery(`❌ Format salah!\n\nContoh: *${prefix}jadwalsholat Jawa Barat,Kota Bogor*\nAtau *${prefix}jadwalsholat on/off*`);
            
            let [prov, kota] = text.split(',').map(v => v.trim());
            
            reply(global.mess.wait);
            try {
                const { data } = await axios.post('https://equran.id/api/v2/shalat', {
                    provinsi: prov,
                    kabkota: kota
                });
                
                if (data && data.code === 200) {
                    gc.jadwalsholat = { provinsi: prov, kota: kota };
                    gc.jadwalsholatData = null; 
                    gc.autosholat = true; 
                    fs.writeFileSync('./database/database.json', JSON.stringify(global.db, null, 2));
                    replysuccess(`✅ Berhasil mengatur lokasi sholat ke *${kota}, ${prov}* dan Autosholat telah otomatis *diaktifkan* untuk grup ini!`);
                } else {
                    replyfail('❌ Gagal menemukan lokasi tersebut. Pastikan penulisan Provinsi dan Kota benar sesuai API.\nContoh: Jawa Barat, Kota Bogor');
                }
            } catch (e) {
                replyfail('❌ Gagal menghubungi server jadwal sholat. Pastikan penulisan Provinsi dan Kota benar!');
            }
        }
    }
        break

// ====== ADDCASE ======

    case 'addcase': {
            if (!Ahmad) return replytolak(mess.only.owner)
            if (!q) return replyhydro('Mana case nya');
            const fs = require('fs');
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
                replyhydro('Terjadi kesalahan saat menulis file:', err);
            } else {
                replyhydro('Case baru berhasil ditambahkan di atas case gimage.');
            }
            });
            } else {
            replyhydro('Tidak dapat menemukan case gimage dalam file.');
           }
           });

           }
        break;
    
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

function autoClearSession() {
    const sessionDir = './furina';
    const tempDir = './temp'; 
    const clearInterval = 4 * 60 * 60 * 1000; // 4 Jam
    
    setInterval(async () => {
        try {
            if (fs.existsSync(sessionDir)) {
                const files = fs.readdirSync(sessionDir);
                const filteredFiles = files.filter(file => 
                    file.startsWith('pre-key') ||
                    file.startsWith('sender-key') ||
                    file.startsWith('session-') ||
                    file.startsWith('app-state')
                );

                if (filteredFiles.length > 0) {
                    console.log(chalk.yellow.bold(`📂 [AUTO CLEAN] Starting session cleanup...`));
                    filteredFiles.forEach(file => {
                        fs.unlinkSync(path.join(sessionDir, file));
                    });
                    console.log(chalk.green.bold(`🗃️ [AUTO CLEAN] Successfully removed ${filteredFiles.length} session files!`));
                }
            }

            if (fs.existsSync(tempDir)) {
                const tempFiles = fs.readdirSync(tempDir);
                if (tempFiles.length > 0) {
                    tempFiles.forEach(file => {
                        fs.unlinkSync(path.join(tempDir, file));
                    });
                    console.log(chalk.cyan.bold(`🗑️ [TEMP CLEAN] Successfully deleted ${tempFiles.length} files from temp!`));
                }
            }
        } catch (error) {
            console.error(chalk.red.bold(`📑 [AUTO CLEAN ERROR]`), error);
        }
    }, clearInterval);
}

autoClearSession();

// ======================== Auto Reload File ===================== \\
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`[ UPDATE ] '${__filename}'`))
    delete require.cache[file]
    require(file)
})