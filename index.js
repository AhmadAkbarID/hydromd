require('./settings')
const { modul } = require('./lib/module');
const moment = require('moment-timezone');
const { baileys, boom, chalk, fs, figlet, FileType, path, pino, process, PhoneNumber, axios, yargs, _ } = modul;
const { Boom } = boom
const {
    default: makeWASocket,
    BufferJSON,
    DisconnectReason,
    AnyMessageContent,
    useMultiFileAuthState,
    delay,
    fetchLatestVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    toBuffer,
    jidDecode,
    makeCacheableSignalKeyStore,
    getAggregateVotesInPollMessage,
    proto,
    USyncQuery, 
    USyncUser
} = require('@mataram/wa')
const crypto = require('crypto')
const cfonts = require('cfonts');
const { exec } = require('child_process');
const { parsePhoneNumber } = require("libphonenumber-js")
const Pino = require("pino")
const { randomBytes } = require('crypto')
const readline = require("readline")
const colors = require('colors')

let phoneNumber = "6285187063723"

const { downloadAllAssets, fsm, stricted } = require('./lib/file.js');
downloadAllAssets().catch(console.error);

if (fs.existsSync('./database/database.json')) {
    try {
        global.db = JSON.parse(fs.readFileSync('./database/database.json', 'utf-8'));
    } catch (e) {
        console.log('Gagal membaca database, membuat ulang...');
        global.db = { users: {}, groups: {}, chats: {}, database: {}, settings: {}, others: {} };
    }
} else {
    global.db = { users: {}, groups: {}, chats: {}, database: {}, settings: {}, others: {} };
}

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

let owner = [];
if (fs.existsSync('./database/owner.json')) {
    try {
        owner = JSON.parse(fs.readFileSync('./database/owner.json'))
    } catch (e) {
        console.log('Gagal membaca owner.json, pastikan formatnya array seperti ["628xxx"]')
    }
}

const store = {
    groupMetadata: {},
    contacts: {},
    bind() { },
    loadMessages() { return [] },
}
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

require('./hydro.js')

const decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
        const d = jidDecode(jid) || {}
        return (d.user && d.server) ? `${d.user}@${d.server}` : jid
    }
    return jid
}

const lidCache = new Map()
const isLid = (id = "") => id.endsWith("@lid")

const resolveLidToJid = async (sock, id) => {
    if (!id) return id
    if (!id.endsWith('@lid')) return decodeJid(id)
    if (lidCache.has(id)) return lidCache.get(id)
    try {
        const query = new USyncQuery()
            .withLIDProtocol()
            .withUser(new USyncUser().withId(id))
        const result = await sock.executeUSyncQuery(query)
        const jid = result?.list?.[0]?.lid?.phoneNumber
            ? result.list[0].lid.phoneNumber + '@s.whatsapp.net'
            : id
        lidCache.set(id, jid)
        return jid
    } catch {
        return id
    }
}

const normalizeMessageIds = async (sock, kay) => {
    if (kay?.key?.participant) kay.key.participant = await resolveLidToJid(sock, kay.key.participant)
    if (kay?.participant) kay.participant = await resolveLidToJid(sock, kay.participant)
    if (kay?.key?.remoteJid) kay.key.remoteJid = decodeJid(kay.key.remoteJid)

    const extractMessage = (msg) => {
        if (!msg) return msg
        if (msg.ephemeralMessage) return extractMessage(msg.ephemeralMessage.message)
        if (msg.viewOnceMessage) return extractMessage(msg.viewOnceMessage.message)
        if (msg.viewOnceMessageV2) return extractMessage(msg.viewOnceMessageV2.message)
        return msg
    }

    const realMessage = extractMessage(kay.message)
    const type = realMessage ? Object.keys(realMessage)[0] : null
    const node = type ? realMessage[type] : null
    const ctx = node?.contextInfo

    if (ctx?.participant) ctx.participant = await resolveLidToJid(sock, ctx.participant)
    if (Array.isArray(ctx?.mentionedJid) && ctx.mentionedJid.length) {
        ctx.mentionedJid = await Promise.all(ctx.mentionedJid.map(j => resolveLidToJid(sock, j)))
    }
    return kay
}

async function hydroInd() {
    await delay(5000)
    const { version } = await fetchLatestVersion()
    const { saveCreds, state } = await useMultiFileAuthState(global.sessionName)

    const hydro = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
        mobile: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        browser: ["Android", "Chrome", "114.0.5735.196"],
        cachedGroupMetadata: async (jid) => {
            if (!jid.endsWith('@g.us')) return
            let gm = store.groupMetadata?.[jid]
            if (!gm) {
                try {
                    gm = await hydro.groupMetadata(jid)
                    store.groupMetadata = store.groupMetadata || {}
                    store.groupMetadata[jid] = gm
                } catch { }
            }
            return gm
        },
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
            if (requiresPatch) {
                message = { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {}, }, ...message, }, }, };
            }
            return message;
        },
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 20000,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        getMessage: async (key) => null,
    })

    const _sendMessage = hydro.sendMessage
    hydro.sendMessage = async (jid, content, options = {}) => {
        if (!options.messageId) options.messageId = randomBytes(16).toString('hex').toUpperCase()
        if (content.text) options.userAgent = "WhatsApp/2.23.13.76 A"
        return await _sendMessage(jid, content, options)
    }

    await fsm(version, chalk, hydro);

    if (!hydro.authState.creds.registered) {
        const inputNumber = await question('Masukin nomor yang mau dijadikan bot.. contoh: 6285187063723\n');
        let code = await hydro.requestPairingCode(inputNumber || phoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        console.log(`Ini kodenya:`, code);
    }

    store.bind(hydro.ev)

    hydro.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        try {
            if (connection === 'close') {
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode
                if (reason === DisconnectReason.badSession) {
                    console.log(`Sesi rusak.. Mohon hapus folder furina`);
                    hydroInd();
                } else if (reason === DisconnectReason.connectionClosed) {
                    console.log("Koneksi terputus, menghubungkan ulang..");
                    hydroInd();
                } else if (reason === DisconnectReason.connectionLost) {
                    console.log("Koneksi terputus dari server, menghubungkan ulang..");
                    hydroInd();
                } else if (reason === DisconnectReason.connectionReplaced) {
                    console.log("Koneksi bertabrakan.. matikan proses untuk mencegah spam.");
                    process.exit(1);
                } else if (reason === DisconnectReason.loggedOut) {
                    console.log(`Sesi terputus.. Mohon hapus folder furina`);
                    hydroInd();
                } else if (reason === DisconnectReason.restartRequired) {
                    console.log("Membutuhkan restart, Merestart..");
                    hydroInd();
                } else if (reason === DisconnectReason.timedOut) {
                    console.log("Waktu habis.. Menghubungkan ulang");
                    hydroInd();
                } else {
                    console.log(`Kesalahan tidak diketahui: ${reason}|${connection}`)
                    hydroInd();
                }
            }
            if (update.connection == "connecting") {
                console.log(`\n👀Menghubungkan...`)
            }
            if (update.connection == "open") {
                console.log(`✅ HydroBot Connected!`)

                const { startSewaChecker, startAutoSholat } = require('./lib/function');
                if (typeof startSewaChecker === 'function') startSewaChecker(hydro);
                if (typeof startAutoSholat === 'function') startAutoSholat(hydro);
                stricted(hydro);
            }
        } catch (err) {
            console.log('Error in Connection.update: \n', err)
        }
    })

    global.hydro = hydro
    hydro.ev.on('creds.update', await saveCreds)

    // Anti Call
    hydro.ev.on('call', async (callUpdate) => {
        try {
            let botNumber = await hydro.decodeJid(hydro.user.id)
            let setting = db.settings?.[botNumber]
            if (!setting) return
            let antiCall = setting.anticall
            if (!antiCall) return

            const calls = Array.isArray(callUpdate) ? callUpdate : [callUpdate]
            for (let call of calls) {
                if (call.isGroup) continue
                if (call.status === 'offer' || call.status === 'ringing') {
                    try { if (hydro.rejectCall) await hydro.rejectCall(call.id, call.from) } catch (e) { }
                    let msg = await hydro.sendTextWithMentions(
                        call.from,
                        `*${hydro.user.name}* tidak bisa menerima panggilan ${call.isVideo ? 'video' : 'suara'}.\nMaaf @${call.from.split('@')[0]} kamu akan diblokir.`
                    )
                    await delay(3000)
                    await hydro.updateBlockStatus(call.from, "block")
                }
            }
        } catch (err) { console.log(err) }
    })

    if (typeof global.db.settings.registrationRequired === 'undefined') {
        global.db.settings.registrationRequired = false
    }

    // Message Upsert Handler
    hydro.ev.on('messages.upsert', async chatUpdate => {
        try {
            const { messages, type } = chatUpdate
            if (type !== 'notify') return

            const kay = chatUpdate.messages[0]
            if (!kay.message) return

            kay.message = (Object.keys(kay.message)[0] === 'ephemeralMessage') ? kay.message.ephemeralMessage.message : kay.message
            if (kay.key && kay.key.remoteJid === 'status@broadcast') {
                await hydro.readMessages([kay.key])
                return
            }

            if (kay.key?.participantAlt) {
                kay.key.participant = kay.key.participantAlt
            }

            await normalizeMessageIds(hydro, kay)
            const sender = kay.key.participant || kay.key.remoteJid

            const Ahmad = [...owner, global.ownernomer, global.botnumber].some(v => {
                if (!v) return false;
                if (v.endsWith('@lid')) return sender === v;
                return sender === v.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            })

            if (kay.key.id.startsWith('903D') && kay.key.id.length === 14) return

            const m = kay
            require('./hydro')(hydro, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })

    hydro.ev.on('group-participants.update', async (anu) => {
        require('./lib/group').participantsUpdate(hydro, anu);
    });

    hydro.ev.on('groups.update', async (anu) => {
        require('./lib/group').groupsUpdate(hydro, anu, store);
    });


    hydro.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    hydro.sendTextWithMentions = async (jid, text, quoted, options = {}) => hydro.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

    hydro.getName = (jid, withoutContact = false) => {
        let id = hydro.decodeJid(jid)
        withoutContact = hydro.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = hydro.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : id === hydro.decodeJid(hydro.user.id) ? hydro.user : (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    hydro.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    return hydro
}

hydroInd()

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err)
})
