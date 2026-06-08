const {
    default: makeWASocket,
    makeWALegacySocket,
    extractMessageContent,
    makeInMemoryStore,
    proto,
    prepareWAMessageMedia,
    downloadContentFromMessage,
    getBinaryNodeChild,
    jidDecode,
    areJidsSameUser,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    WAMessageStubType,
    WA_DEFAULT_EPHEMERAL,
} = require('socketon')
const { toAudio, toPTT, toVideo } = require('./converter')
const chalk = require('chalk')
const fetch = require("node-fetch")
const FileType = require('file-type')
const PhoneNumber = require('awesome-phonenumber')
const fs = require('fs')
const path = require('path')
let Jimp = require('jimp')
const pino = require('pino')
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const ephemeral = { ephemeralExpiration: 8600 }

exports.makeWASocket = (connectionOptions, options = {}) => {
    let hydro = (global.opts['legacy'] ? makeWALegacySocket : makeWASocket)(connectionOptions)
    // hydro.ws.on('CB:stream:error', (stream) => {
    //     const { code } = stream || {}
    //     if (code == '401') hydro.ev.emit('connection.update', {
    //         connection: 'logged Out',
    //         lastDisconnect: {
    //             error: {
    //                 output: {
    //                     statusCode: DisconnectReason.loggedOut
    //                 }
    //             },
    //             date: new Date()
    //         }
    //     })
    // })
    
    // Load Group Message
    hydro.loadAllMessages = (messageID) => {
      return Object.entries(hydro.chats)
      .filter(([_, { messages }]) => typeof messages === 'object')
      .find(([_, { messages }]) => Object.entries(messages)
      .find(([k, v]) => (k === messageID || v.key?.id === messageID)))
      ?.[1].messages?.[messageID]
    }
    
    hydro.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    if (hydro.user && hydro.user.id) hydro.user.jid = hydro.decodeJid(hydro.user.id)
    if (!hydro.chats) hydro.chats = {}

    function updateNameToDb(contacts) {
        if (!contacts) return
        for (const contact of contacts) {
            const id = hydro.decodeJid(contact.id)
            if (!id) continue
            let chats = hydro.chats[id]
            if (!chats) chats = hydro.chats[id] = { id }
            hydro.chats[id] = {
                ...chats,
                ...({
                    ...contact, id, ...(id.endsWith('@g.us') ?
                        { subject: contact.subject || chats.subject || '' } :
                        { name: contact.notify || chats.name || chats.notify || '' })
                } || {})
            }
        }
    }
	
	
    hydro.ev.on('contacts.upsert', updateNameToDb)
    hydro.ev.on('groups.update', updateNameToDb)
    hydro.ev.on('chats.set', async ({ chats }) => {
        for (const { id, name, readOnly } of chats) {
            id = hydro.decodeJid(id)
            if (!id) continue
            const isGroup = id.endsWith('@g.us')
            let chats = hydro.chats[id]
            if (!chats) chats = hydro.chats[id] = { id }
            chats.isChats = !readOnly
            if (name) chats[isGroup ? 'subject' : 'name'] = name
            if (isGroup) {
                const metadata = await hydro.groupMetadata(id).catch(_ => null)
                if (!metadata) continue
                chats.subject = name || metadata.subject
                chats.metadata = metadata
            }
        }
    })
    hydro.ev.on('group-participants.update', async function updateParticipantsToDb({ id, participants, action }) {
        id = hydro.decodeJid(id)
        if (!(id in hydro.chats)) hydro.chats[id] = { id }
        hydro.chats[id].isChats = true
        const groupMetadata = await hydro.groupMetadata(id).catch(_ => null)
        if (!groupMetadata) return
        hydro.chats[id] = {
            ...hydro.chats[id],
            subject: groupMetadata.subject,
            metadata: groupMetadata
        }
    })

    hydro.ev.on('groups.update', async function groupUpdatePushToDb(groupsUpdates) {
        for (const update of groupsUpdates) {
            const id = hydro.decodeJid(update.id)
            if (!id) continue
            const isGroup = id.endsWith('@g.us')
            if (!isGroup) continue
            let chats = hydro.chats[id]
            if (!chats) chats = hydro.chats[id] = { id }
            chats.isChats = true
            const metadata = await hydro.groupMetadata(id).catch(_ => null)
            if (!metadata) continue
            chats.subject = metadata.subject
            chats.metadata = metadata
        }
    })
    hydro.ev.on('chats.upsert', async function chatsUpsertPushToDb(chatsUpsert) {
        console.log({ chatsUpsert })
        const { id, name } = chatsUpsert
        if (!id) return
        let chats = hydro.chats[id] = { ...hydro.chats[id], ...chatsUpsert, isChats: true }
        const isGroup = id.endsWith('@g.us')
        if (isGroup) {
            const metadata = await hydro.groupMetadata(id).catch(_ => null)
            if (metadata) {
                chats.subject = name || metadata.subject
                chats.metadata = metadata
            }
            const groups = await hydro.groupFetchAllParticipating().catch(_ => ({})) || {}
            for (const group in groups) hydro.chats[group] = { id: group, subject: groups[group].subject, isChats: true, metadata: groups[group] }
        }
    })
    hydro.ev.on('presence.update', async function presenceUpdatePushToDb({ id, presences }) {
        const sender = Object.keys(presences)[0] || id
        const _sender = hydro.decodeJid(sender)
        const presence = presences[sender]['lastKnownPresence'] || 'composing'
        let chats = hydro.chats[_sender]
        if (!chats) chats = hydro.chats[_sender] = { id: sender }
        chats.presences = presence
        if (id.endsWith('@g.us')) {
            let chats = hydro.chats[id]
            if (!chats) {
                const metadata = await hydro.groupMetadata(id).catch(_ => null)
                if (metadata) chats = hydro.chats[id] = { id, subject: metadata.subject, metadata }
            }
            chats.isChats = true
        }
    })

    hydro.logger = {
        ...hydro.logger,
        info(...args) { console.log(chalk.bold.rgb(57, 183, 16)(`INFO [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.cyan(...args)) },
        error(...args) { console.log(chalk.bold.rgb(247, 38, 33)(`ERROR [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.rgb(255, 38, 0)(...args)) },
        warn(...args) { console.log(chalk.bold.rgb(239, 225, 3)(`WARNING [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.keyword('orange')(...args)) }
    }

    /**
     * getBuffer hehe
     * @param {fs.PathLike} path
     * @param {Boolean} returnFilename
     */
    hydro.getFile = async (PATH, returnAsFilename) => {
        let res, filename
        const data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        const type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        if (data && returnAsFilename && !filename) (filename = path.join(__dirname, '../tmp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data))
        return {
            res,
            filename,
            ...type,
            data,
            deleteFile() {
                return filename && fs.promises.unlink(filename)
            }
        }
    }


    /**
     * waitEvent
     * @param {Partial<BaileysEventMap>|String} eventName 
     * @param {Boolean} is 
     * @param {Number} maxTries 
     * @returns 
     */
    hydro.waitEvent = (eventName, is = () => true, maxTries = 25) => {
        return new Promise((resolve, reject) => {
            let tries = 0
            let on = (...args) => {
                if (++tries > maxTries) reject('Max tries reached')
                else if (is()) {
                    hydro.ev.off(eventName, on)
                    resolve(...args)
                }
            }
            hydro.ev.on(eventName, on)
        })
    }
    
  hydro.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
     
  /**
     * 
     * @param {String} text 
     * @returns 
     */
    hydro.filter = (text) => {
      let mati = ["q", "w", "r", "t", "y", "p", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"]
      if (/[aiueo][aiueo]([qwrtypsdfghjklzxcvbnm])?$/i.test(text)) return text.substring(text.length - 1)
      else {
        let res = Array.from(text).filter(v => mati.includes(v))
        let resu = res[res.length - 1]
        for (let huruf of mati) {
            if (text.endsWith(huruf)) {
                resu = res[res.length - 2]
            }
        }
        let misah = text.split(resu)
        return resu + misah[misah.length - 1]
      }
    }
    
    /**
     * ms to date
     * @param {String} ms
     */
    hydro.msToDate = (ms) => {
      let days = Math.floor(ms / (24 * 60 * 60 * 1000));
      let daysms = ms % (24 * 60 * 60 * 1000);
      let hours = Math.floor((daysms) / (60 * 60 * 1000));
      let hoursms = ms % (60 * 60 * 1000);
      let minutes = Math.floor((hoursms) / (60 * 1000));
      let minutesms = ms % (60 * 1000);
      let sec = Math.floor((minutesms) / (1000));
      return days + " Hari " + hours + " Jam " + minutes + " Menit";
      // +minutes+":"+sec;
    }
    
     /**
    * isi
    */
    hydro.rand = async (isi) => {
        return isi[Math.floor(Math.random() * isi.length)]
    }
    
    /**
    * Send Media All Type 
    * @param {String} jid
    * @param {String|Buffer} path
    * @param {Object} quoted
    * @param {Object} options 
    */
    hydro.sendMedia = async (jid, path, quoted, options = {}) => {
        let { ext, mime, data } = await hydro.getFile(path)
        messageType = mime.split("/")[0]
        pase = messageType.replace('application', 'document') || messageType
        return await hydro.sendMessage(jid, { [`${pase}`]: data, mimetype: mime, ...options }, { quoted })
    }
    
    hydro.adReply = (jid, text, title = '', body = '', buffer, source = '', quoted, options) => {
                let { data } = hydro.getFile(buffer, true)
                return hydro.sendMessage(jid, { text: text, 
                    contextInfo: {
                        mentionedJid: hydro.parseMention(text),
                        externalAdReply: {
                            showAdAttribution: true,
                            mediaType: 1,
                            title: title,
                            body: body,
                            thumbnailUrl: 'https://telegra.ph/file/dc229854bebc5fe9ccf01.jpg',
                            renderLargerThumbnail: true,
                            sourceUrl: source
                        }
                    }
                }, { quoted: quoted, ...options, ...ephemeral })
                
                enumerable: true
            },

    /**
    * Send Media/File with Automatic Type Specifier
    * @param {String} jid
    * @param {String|Buffer} path
    * @param {String} filename
    * @param {String} caption
    * @param {proto.WebMessageInfo} quoted
    * @param {Boolean} ptt
    * @param {Object} options
    */
    hydro.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        let type = await hydro.getFile(path, true)
        let { res, data: file, filename: pathFile } = type
        if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
        }
        let opt = { filename }
        if (quoted) opt.quoted = quoted
        if (!type) options.asDocument = true
        let mtype = '', mimetype = type.mime, convert
        if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
        else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
        else if (/video/.test(type.mime)) mtype = 'video'
        else if (/audio/.test(type.mime)) (
            convert = await (ptt ? toPTT : toAudio)(file, type.ext),
            file = convert.data,
            pathFile = convert.filename,
            mtype = 'audio',
            mimetype = 'audio/ogg; codecs=opus'
        )
        else mtype = 'document'
        if (options.asDocument) mtype = 'document'

        let message = {
            ...options,
            caption,
            ptt,
            [mtype]: { url: pathFile },
            mimetype
        }
        let m
        try {
            m = await hydro.sendMessage(jid, message, { ...opt, ...options })
        } catch (e) {
            console.error(e)
            m = null
        } finally {
            if (!m) m = await hydro.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })
            return m
        }
    }

     hydro.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await hydro.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }
    /**
     * Send Contact
     * @param {String} jid 
     * @param {String} number 
     * @param {String} name 
     * @param {Object} quoted 
     * @param {Object} options 
     */
     hydro.sendContact = async (jid, data, quoted, options) => {
                if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
                let contacts = []
                for (let [number, name] of data) {
                    number = number.replace(/[^0-9]/g, '')
                    let njid = number + '@s.whatsapp.net'
                    let biz = await hydro.getBusinessProfile(njid).catch(_ => null) || {}
                    let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${name.replace(/\n/g, '\\n')}
ORG:
item1.TEL;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}
item1.X-ABLabel:Ponsel${biz.description ? `
item2.EMAIL;type=INTERNET:${(biz.email || '').replace(/\n/g, '\\n')}
item2.X-ABLabel:Email
PHOTO;BASE64:${(await hydro.getFile(await hydro.profilePictureUrl(njid)).catch(_ => ({})) || {}).number?.toString('base64')}
X-WA-BIZ-DESCRIPTION:${(biz.description || '').replace(/\n/g, '\\n')}
X-WA-BIZ-NAME:${name.replace(/\n/g, '\\n')}
` : ''}
END:VCARD
`.trim()
                    contacts.push({
                        vcard,
                        displayName: name
                    })

                }
                return hydro.sendMessage(jid, {
                    ...options,
                    contacts: {
                        ...options,
                        displayName: (contacts.length >= 2 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
                        contacts,
                    }
                }, {
                    quoted,
                    ...options
                })
                enumerable: true
            },
            
      hydro.sendList = async (jid, header, footer, separate, buttons, rows, quoted, options) => {
                const inputArray = rows.flat()
                const result = inputArray.reduce((acc, curr, index) => {
                    if (index % 2 === 1) {
                        const [title, rowId, description] = curr[0]
                        acc.push({
                            title,
                            rowId,
                            description
                        })
                    }
                    return acc
                }, [])
                let teks = result
                    .map((v, index) => {
                        return `${v.title || ''}\n${v.rowId || ''}\n${v.description || ''}`.trim()
                    })
                    .filter(v => v)
                    .join("\n\n")
                return hydro.sendMessage(jid, {
                    ...options,
                    text: teks
                }, {
                    quoted,
                    ...options
                })
            },
            
    
    /**
     * Reply to a message
     * @param {String} jid
     * @param {String|Object} text
     * @param {Object} quoted
     * @param {Object} options
     */
    hydro.reply = (jid, text = '', quoted, options) => {
        return Buffer.isBuffer(text) ? hydro.sendFile(jid, text, 'file', '', quoted, false, options) : hydro.sendMessage(jid, { ...options, text, mentions: hydro.parseMention(text) }, { quoted, ...options, mentions: hydro.parseMention(text) })
    }
    
    hydro.resize = async (image, width, height) => {
                let oyy = await Jimp.read(image)
                let kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG)
                return kiyomasa
            }
    
    hydro.fakeReply = (jid, text = '', fakeJid = hydro.user.jid, fakeText = '', fakeGroupJid, options) => {
        return hydro.sendMessage(jid, { text: text }, { ephemeralExpiration: 86400, quoted: { key: { fromMe: fakeJid == hydro.user.jid, participant: fakeJid, ...(fakeGroupJid ? { remoteJid: fakeGroupJid } : {}) }, message: { conversation: fakeText }, ...options } })
    }
    hydro.reply1 = async (jid, text, quoted, men) => {
        return hydro.sendMessage(jid, {
            text: text, jpegThumbnail: await (await fetch(thumbr1)).buffer(), mentions: men
        }, { quoted: quoted, ephemeralExpiration: 86400 })
    }
    hydro.reply2 = async (jid, text, media, quoted, men) => {
        return hydro.sendMessage(jid, {
            text: text, jpegThumbnail: await (await fetch(media)).buffer(), mentions: men
        }, { quoted: quoted, ephemeralExpiration: 8600 })
    }

    hydro.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    hydro.sendText = (jid, text, quoted = '', options) => hydro.sendMessage(jid, { text: text, ...options }, { quoted })
    
    /**
    * sendGroupV4Invite
    * @param {String} jid 
    * @param {*} participant 
    * @param {String} inviteCode 
    * @param {Number} inviteExpiration 
    * @param {String} groupName 
    * @param {String} caption 
    * @param {*} options 
    * @returns 
    */
    hydro.sendGroupV4Invite = async (jid, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', caption = 'Invitation to join my WhatsApp group', options = {}) => {
        let msg = proto.Message.fromObject({
            groupInviteMessage: proto.GroupInviteMessage.fromObject({
                inviteCode,
                inviteExpiration: parseInt(inviteExpiration) || + new Date(new Date + (3 * 86400000)),
                groupJid: jid,
                groupName: groupName ? groupName : this.getName(jid),
                caption
            })
        })
        let message = await this.prepareMessageFromContent(participant, msg, options)
        await this.relayWAMessage(message)
        return message
    }

    /**
    * cMod
    * @param {String} jid 
    * @param {proto.WebMessageInfo} message 
    * @param {String} text 
    * @param {String} sender 
    * @param {*} options 
    * @returns 
    */
    hydro.cMod = (jid, message, text = '', sender = hydro.user.jid, options = {}) => {
        let copy = message.toJSON()
        let mtype = Object.keys(copy.message)[0]
        let isEphemeral = false // mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
        let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
        else if (content.caption) content.caption = text || content.caption
        else if (content.text) content.text = text || content.text
        if (typeof content !== 'string') msg[mtype] = { ...content, ...options }
        if (copy.participant) sender = copy.participant = sender || copy.participant
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = areJidsSameUser(sender, hydro.user.id) || false
        return proto.WebMessageInfo.fromObject(copy)
    }

    /**
     * Exact Copy Forward
     * @param {String} jid
     * @param {proto.WebMessageInfo} message
     * @param {Boolean|Number} forwardingScore
     * @param {Object} options
     */
    hydro.copyNForward = async (jid, message, forwardingScore = true, options = {}) => {
        let m = generateForwardMessageContent(message, !!forwardingScore)
        let mtype = Object.keys(m)[0]
        if (forwardingScore && typeof forwardingScore == 'number' && forwardingScore > 1) m[mtype].contextInfo.forwardingScore += forwardingScore
        m = generateWAMessageFromContent(jid, m, { ...options, userJid: hydro.user.id })
        await hydro.relayMessage(jid, m.message, { messageId: m.key.id, additionalAttributes: { ...options } })
        return m
    }
    
    hydro.loadMessage = hydro.loadMessage || (async (messageID) => {
        return Object.entries(hydro.chats)
            .filter(([_, { messages }]) => typeof messages === 'object')
            .find(([_, { messages }]) => Object.entries(messages)
                .find(([k, v]) => (k === messageID || v.key?.id === messageID)))
            ?.[1].messages?.[messageID]
    })

    /**
     * Download media message
     * @param {Object} m
     * @param {String} type 
     * @param {fs.PathLike|fs.promises.FileHandle} filename
     * @returns {Promise<fs.PathLike|fs.promises.FileHandle|Buffer>}
     */
    hydro.downloadM = async (m, type, saveToFile) => {
        if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
        const stream = await downloadContentFromMessage(m, type)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        if (saveToFile) var { filename } = await hydro.getFile(buffer, true)
        return saveToFile && fs.existsSync(filename) ? filename : buffer
    }
    
    
    hydro.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
	let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }


    /**
     * parseMention(s)
     * @param {string} text 
     * @returns {string[]}
     */
    hydro.parseMention = (text = '') => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }
    /**
     * Read message
     * @param {String} jid 
     * @param {String|undefined|null} participant 
     * @param {String} messageID 
     */
    hydro.chatRead = async (jid, participant = hydro.user.jid, messageID) => {
        return await hydro.sendReadReceipt(jid, participant, [messageID])
    }
    
    hydro.sendStimg = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }
        await hydro.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }

    hydro.sendStvid = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }
        await hydro.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }

    /**
     * Parses string into mentionedJid(s)
     * @param {String} text
     */
    hydro.parseMention = (text = '') => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }
    
     hydro.sendTextWithMentions = async (jid, text, quoted, options = {}) => hydro.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

    /**
     * Get name from jid
     * @param {String} jid
     * @param {Boolean} withoutContact
     */
    hydro.getName = (jid = '', withoutContact = false) => {
        jid = hydro.decodeJid(jid)
        withoutContact = this.withoutContact || withoutContact
        let v
        if (jid.endsWith('@g.us')) return new Promise(async (resolve) => {
            v = hydro.chats[jid] || {}
            if (!(v.name || v.subject)) v = await hydro.groupMetadata(jid) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = jid === '0@s.whatsapp.net' ? {
            jid,
            vname: 'WhatsApp'
        } : areJidsSameUser(jid, hydro.user.id) ?
            hydro.user :
            (hydro.chats[jid] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    /**
     * to process MessageStubType
     * @param {proto.WebMessageInfo} m 
     */
     hydro.processMessageStubType = async(m) => {
    /**
     * to process MessageStubType
     * @param {import('@adiwajshing/baileys').proto.WebMessageInfo} m 
     */
    if (!m.messageStubType) return
        const chat = hydro.decodeJid(m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || '')
    if (!chat || chat === 'status@broadcast') return
        const emitGroupUpdate = (update) => {
            hydro.ev.emit('groups.update', [{ id: chat, ...update }])
        }
        switch (m.messageStubType) {
            case WAMessageStubType.REVOKE:
            case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
            emitGroupUpdate({ revoke: m.messageStubParameters[0] })
            break
            case WAMessageStubType.GROUP_CHANGE_ICON:
            emitGroupUpdate({ icon: m.messageStubParameters[0] })
            break
            default: {
                console.log({
                    messageStubType: m.messageStubType,
                    messageStubParameters: m.messageStubParameters,
                    type: WAMessageStubType[m.messageStubType]
                })
                break
            }
        }
        const isGroup = chat.endsWith('@g.us')
        if (!isGroup) return
        let chats = hydro.chats[chat]
        if (!chats) chats = hydro.chats[chat] = { id: chat }
        chats.isChats = true
        const metadata = await hydro.groupMetadata(chat).catch(_ => null)
        if (!metadata) return
        chats.subject = metadata.subject
        chats.metadata = metadata
    }
    hydro.insertAllGroup = async() => {
        const groups = await hydro.groupFetchAllParticipating().catch(_ => null) || {}
        for (const group in groups) hydro.chats[group] = { ...(hydro.chats[group] || {}), id: group, subject: groups[group].subject, isChats: true, metadata: groups[group] }
            return hydro.chats
    }
    
    /*hydro.processMessageStubType = async (m) => {
        if (!m.messageStubType) return
        const mtype = Object.keys(m.message || {})[0]
        const chat = hydro.decodeJid(m.key.remoteJid || m.message[mtype] && m.message[mtype].groupId || '')
        const isGroup = chat.endsWith('@g.us')
        if (!isGroup) return
        let chats = hydro.chats[chat]
        if (!chats) chats = hydro.chats[chat] = { id: chat }
        chats.isChats = true
        const metadata = await hydro.groupMetadata(chat).catch(_ => null)
        if (!metadata) return
        chats.subject = metadata.subject
        chats.metadata = metadata
    }*/

    /**
     * pushMessage
     * @param {proto.WebMessageInfo[]} m 
     */
     hydro.pushMessage = async(m) => {
    /**
     * pushMessage
     * @param {import('@adiwajshing/baileys').proto.WebMessageInfo[]} m 
     */
    if (!m) return
        if (!Array.isArray(m)) m = [m]
            for (const message of m) {
                try {
                // if (!(message instanceof proto.WebMessageInfo)) continue // https://github.com/adiwajshing/Baileys/pull/696/commits/6a2cb5a4139d8eb0a75c4c4ea7ed52adc0aec20f
                if (!message) continue
                    if (message.messageStubType && message.messageStubType != WAMessageStubType.CIPHERTEXT) hydro.processMessageStubType(message).catch(console.error)
                        const _mtype = Object.keys(message.message || {})
                    const mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(_mtype[0]) && _mtype[0]) ||
                    (_mtype.length >= 3 && _mtype[1] !== 'messageContextInfo' && _mtype[1]) ||
                    _mtype[_mtype.length - 1]
                    const chat = hydro.decodeJid(message.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '')
                    if (message.message?.[mtype]?.contextInfo?.quotedMessage) {
                    /**
                     * @type {import('@adiwajshing/baileys').proto.IContextInfo}
                     */
                    let context = message.message[mtype].contextInfo
                    let participant = hydro.decodeJid(context.participant)
                    const remoteJid = hydro.decodeJid(context.remoteJid || participant)
                    /**
                     * @type {import('@adiwajshing/baileys').proto.IMessage}
                     * 
                     */
                    let quoted = message.message[mtype].contextInfo.quotedMessage
                    if ((remoteJid && remoteJid !== 'status@broadcast') && quoted) {
                        let qMtype = Object.keys(quoted)[0]
                        if (qMtype == 'conversation') {
                            quoted.extendedTextMessage = { text: quoted[qMtype] }
                            delete quoted.conversation
                            qMtype = 'extendedTextMessage'
                        }

                        if (!quoted[qMtype].contextInfo) quoted[qMtype].contextInfo = {}
                        quoted[qMtype].contextInfo.mentionedJid = context.mentionedJid || quoted[qMtype].contextInfo.mentionedJid || []
                        const isGroup = remoteJid.endsWith('g.us')
                        if (isGroup && !participant) participant = remoteJid
                            const qM = {
                                key: {
                                    remoteJid,
                                    fromMe: areJidsSameUser(hydro.user.jid, remoteJid),
                                    id: context.stanzaId,
                                    participant,
                                },
                                message: JSON.parse(JSON.stringify(quoted)),
                                ...(isGroup ? { participant } : {})
                            }
                            let qChats = hydro.chats[participant]
                            if (!qChats) qChats = hydro.chats[participant] = { id: participant, isChats: !isGroup }
                                if (!qChats.messages) qChats.messages = {}
                                    if (!qChats.messages[context.stanzaId] && !qM.key.fromMe) qChats.messages[context.stanzaId] = qM
                                        let qChatsMessages
                                        if ((qChatsMessages = Object.entries(qChats.messages)).length > 40) qChats.messages = Object.fromEntries(qChatsMessages.slice(30, qChatsMessages.length)) // maybe avoid memory leak
                                    }
                            }
                            if (!chat || chat === 'status@broadcast') continue
                                const isGroup = chat.endsWith('@g.us')
                            let chats = hydro.chats[chat]
                            if (!chats) {
                                if (isGroup) await hydro.insertAllGroup().catch(console.error)
                                    chats = hydro.chats[chat] = { id: chat, isChats: true, ...(hydro.chats[chat] || {}) }
                            }
                            let metadata, sender
                            if (isGroup) {
                                if (!chats.subject || !chats.metadata) {
                                    metadata = await hydro.groupMetadata(chat).catch(_ => ({})) || {}
                                    if (!chats.subject) chats.subject = metadata.subject || ''
                                    if (!chats.metadata) chats.metadata = metadata
                                }
                            sender = hydro.decodeJid(message.key?.fromMe && hydro.user.id || message.participant || message.key?.participant || chat || '')
                            if (sender !== chat) {
                                let chats = hydro.chats[sender]
                                if (!chats) chats = hydro.chats[sender] = { id: sender }
                                if (!chats.name) chats.name = message.pushName || chats.name || ''
                            }
                    } else if (!chats.name) chats.name = message.pushName || chats.name || ''
                    if (['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype)) continue
                        chats.isChats = true
                    if (!chats.messages) chats.messages = {}
                        const fromMe = message.key.fromMe || areJidsSameUser(sender || chat, hydro.user.id)
                    if (!['protocolMessage'].includes(mtype) && !fromMe && message.messageStubType != WAMessageStubType.CIPHERTEXT && message.message) {
                        delete message.message.messageContextInfo
                        delete message.message.senderKeyDistributionMessage
                        chats.messages[message.key.id] = JSON.parse(JSON.stringify(message, null, 2))
                        let chatsMessages
                        if ((chatsMessages = Object.entries(chats.messages)).length > 40) chats.messages = Object.fromEntries(chatsMessages.slice(30, chatsMessages.length))
                    }
            } catch (e) {
                console.error(e)
            }
        }
    }
     
/*
  * Send Polling
*/
hydro.getFile = async (path) => {
      let res
      let data = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (res = await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : typeof path === 'string' ? path : Buffer.alloc(0)
      if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
      let type = await FileType.fromBuffer(data) || {
        mime: 'application/octet-stream',
        ext: '.bin'
      }

      return {
        res,
        ...type,
        data
      }
    }
    
hydro.sendPoll = async (jid, name = '', optiPoll, options) => {
    if (!Array.isArray(optiPoll[0]) && typeof optiPoll[0] === 'string') optiPoll = [optiPoll];
    if (!options) options = {};
    const pollMessage = {
        name: name,
        options: optiPoll.map(btn => ({ optionName: btn[0] || '' })),
        selectableOptionsCount: 1
    };
    return hydro.relayMessage(jid, { pollCreationMessage: pollMessage }, { ...options });
};
    
/*
   * Set auto Bio
*/

hydro.setBio = async (status) => {
        return await hydro.query({
            tag: 'iq',
            attrs: {
                to: 's.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [
                {
                    tag: 'status',
                    attrs: {},
                    content: Buffer.from(status, 'utf-8')
                }
            ]
        })
        // <iq to="s.whatsapp.net" type="set" xmlns="status" id="21168.6213-69"><status>"Hai, saya menggunakan WhatsApp"</status></iq>
    }


    /*hydro.pushMessage = async (m) => {
        if (!m) return
        if (!Array.isArray(m)) m = [m]
        for (const message of m) {
            try {
                // if (!(message instanceof proto.WebMessageInfo)) continue // https://github.com/adiwajshing/Baileys/pull/696/commits/6a2cb5a4139d8eb0a75c4c4ea7ed52adc0aec20f
                if (!message) continue
                if (message.messageStubType) hydro.processMessageStubType(message).catch(console.error)
                let mtype = Object.keys(message.message || {})
                mtype = mtype[mtype[0] === 'messageContextInfo' && mtype.length == 2 ? 1 : 0]
                const chat = hydro.decodeJid(message.key.remoteJid || message.message[mtype] && message.message[mtype].groupId || '')
                const isGroup = chat.endsWith('@g.us')
                let chats = hydro.chats[chat]
                if (!chats) {
                    if (isGroup) {
                        const groups = await hydro.groupFetchAllParticipating().catch(_ => ({}))
                        for (const group in groups) hydro.chats[group] = { id: group, subject: groups[group].subject, isChats: true, metadata: groups[group] }
                    }
                    chats = hydro.chats[chat] = { id: chat, ...(hydro.chats[chat] || {}) }
                }
                let metadata, sender
                if (isGroup) {
                    if (!chats.subject || !chats.metadata) {
                        metadata = await hydro.groupMetadata(chat).catch(_ => ({})) || {}
                        if (!chats.subject) chats.subject = metadata.subject || ''
                        if (!chats.metadata) chats.metadata = metadata
                    }
                    sender = hydro.decodeJid(message.fromMe && hydro.user.id || message.participant || message.key.participant || chat || '')
                    if (sender !== chat) {
                        let chats = hydro.chats[sender]
                        if (!chats) chats = hydro.chats[sender] = { id: sender }
                        if (!chats.name) chats.name = message.pushName || chats.name || ''
                    }
                } else {
                    if (!chats.name) chats.name = message.pushName || chats.name || ''
                }
                if (['senderKeyDistributionMessage', 'protocolMessage'].includes(mtype)) continue
                chats.isChats = true
                const fromMe = message.key.fromMe || areJidsSameUser(chat, hydro.user.id)
                if (!chats.messages) chats.messages = {}
                if (!fromMe) chats.messages[message.key.id] = JSON.parse(JSON.stringify(message, null, 2))
            } catch (e) {
                console.error(e)
            }
        }
    }*/
    
    /**
     * 
     * @param  {...any} args 
     * @returns 
     */
    hydro.format = (...args) => {
        return util.format(...args)
    }
    
    /**
     * 
     * @param {String} url 
     * @param {Object} options 
     * @returns 
     */
    hydro.getBuffer = async (url, options) => {
        try {
            options ? options : {}
            const res = await axios({
                method: "get",
                url,
                headers: {
                    'DNT': 1,
                    'Upgrade-Insecure-Request': 1
                },
                ...options,
                responseType: 'arraybuffer'
            })
            return res.data
        } catch (e) {
            console.log(`Error : ${e}`)
        }
    }

    /**
     * Serialize Message, so it easier to manipulate
     * @param {Object} m
     */
    hydro.serializeM = (m) => {
        return exports.smsg(hydro , m)
    }

    Object.defineProperty(hydro, 'name', {
        value: 'WASocket',
        configurable: true,
    })
    return hydro 
}
/**
 * Serialize Message
 * @param {ReturnType<typeof makeWASocket>} conn 
 * @param {proto.WebMessageInfo} m 
 * @param {Boolean} hasParent 
 */
 exports.smsg = (hydro, m, hasParent) => {
    if (!m) return m
    let M = proto.WebMessageInfo
    m = M.fromObject(m)
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id && m.id.length === 16 || false 
        m.chat = hydro.decodeJid(m.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '')
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = hydro.decodeJid(m.key.fromMe && hydro.user.id || m.participant || m.key.participant || m.chat || '')
        m.fromMe = m.key.fromMe || areJidsSameUser(m.sender, hydro.user.id)
    }
    if (m.message) {
        let mtype = Object.keys(m.message)
        m.mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype[0]) && mtype[0]) || // Sometimes message in the front
            (mtype.length >= 3 && mtype[1] !== 'messageContextInfo' && mtype[1]) || // Sometimes message in midle if mtype length is greater than or equal to 3!
            mtype[mtype.length - 1] // common case
        m.msg = m.message[m.mtype]
        if (m.chat == 'status@broadcast' && ['protocolMessage', 'senderKeyDistributionMessage'].includes(m.mtype)) m.chat = (m.key.remoteJid !== 'status@broadcast' && m.key.remoteJid) || m.sender
        if (m.mtype == 'protocolMessage' && m.msg.key) {
            if (m.msg.key.remoteJid == 'status@broadcast') m.msg.key.remoteJid = m.chat
            if (!m.msg.key.participant || m.msg.key.participant == 'status_me') m.msg.key.participant = m.sender
            m.msg.key.fromMe = hydro.decodeJid(m.msg.key.participant) === hydro.decodeJid(hydro.user.id)
            if (!m.msg.key.fromMe && m.msg.key.remoteJid === hydro.decodeJid(hydro.user.id)) m.msg.key.remoteJid = m.sender
        }
        m.text = m.msg.text || m.msg.caption || m.msg.contentText || m.msg || ''
        if (typeof m.text !== 'string') {
            if ([
                'protocolMessage',
                'messageContextInfo',
                'stickerMessage',
                'audioMessage',
                'senderKeyDistributionMessage'
            ].includes(m.mtype)) m.text = ''
            else m.text = m.text.selectedDisplayText || m.text.hydratedTemplate?.hydratedContentText || m.text
        }
        m.mentionedJid = m.msg?.contextInfo?.mentionedJid?.length && m.msg.contextInfo.mentionedJid || []
        let quoted = m.quoted = m.msg?.contextInfo?.quotedMessage ? m.msg.contextInfo.quotedMessage : null
        if (m.quoted) {
            let type = Object.keys(m.quoted)[0]
            m.quoted = m.quoted[type]
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.chat = hydro.decodeJid(m.msg.contextInfo.remoteJid || m.chat || m.sender)
            m.quoted.isBaileys = m.quoted.id && m.quoted.id.length === 16 || false
            m.quoted.sender = hydro.decodeJid(m.msg.contextInfo.participant)
            m.quoted.fromMe = m.quoted.sender === hydro.user.jid
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.contentText || ''
            m.quoted.name = hydro.getName(m.quoted.sender)
            m.quoted.mentionedJid = m.quoted.contextInfo?.mentionedJid?.length && m.quoted.contextInfo.mentionedJid || []
            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    fromMe: m.quoted.fromMe,
                    remoteJid: m.quoted.chat,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })
            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.id) return null
                let q = M.fromObject(await hydro.loadMessage(m.quoted.id) || vM)
                return exports.smsg(hydro, q)
            }
            if (m.quoted.url || m.quoted.directPath) m.quoted.download = (saveToFile = false) => hydro.downloadM(m.quoted, m.quoted.mtype.replace(/message/i, ''), saveToFile)
            
 
/*exports.smsg = (conn, m, hasParent) => {
    if (!m) return m
    let M = proto.WebMessageInfo
    m = M.fromObject(m)
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id && m.id.length === 16 || m.id.startsWith('3EB0') && m.id.length === 12 || false
        let mtype = Object.keys(m.message || {})[0]
        m.chat = hydro.decodeJid(m.key.remoteJid || m.message[mtype] && m.message[mtype].groupId || '')
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = hydro.decodeJid(m.fromMe && hydro.user.id || m.participant || m.key.participant || m.chat || '')
        m.fromMe = m.key.fromMe || areJidsSameUser(m.sender, hydro.user.id)
    }
    if (m.message) {
        let mtype = Object.keys(m.message)
        m.mtype = mtype[mtype[0] === 'messageContextInfo' && mtype.length == 2 ? 1 : 0]
        m.msg = m.message[m.mtype]
        if (m.chat == 'status@broadcast' && ['protocolMessage', 'senderKeyDistributionMessage'].includes(m.mtype)) m.chat = m.sender
        // if (m.mtype === 'ephemeralMessage') {
        //     exports.smsg(conn, m.msg)
        //     m.mtype = m.msg.mtype
        //     m.msg = m.msg.msg
        //   }
        if (m.mtype == 'protocolMessage' && m.msg.key) {
            if (m.msg.key.remoteJid == 'status@broadcast') m.msg.key.remoteJid = m.chat
            if (!m.msg.key.participant || m.msg.key.participant == 'status_me') m.msg.key.participant = m.sender
            m.msg.key.fromMe = hydro.decodeJid(m.msg.key.participant) === hydro.decodeJid(hydro.user.id)
            if (!m.msg.key.fromMe && m.msg.key.remoteJid === hydro.decodeJid(hydro.user.id)) m.msg.key.remoteJid = m.sender
        }
        m.text = m.msg.text || m.msg.caption || m.msg.contentText || m.msg || ''
        m.mentionedJid = m.msg && m.msg.contextInfo && m.msg.contextInfo.mentionedJid && m.msg.contextInfo.mentionedJid.length && m.msg.contextInfo.mentionedJid || []
        let quoted = m.quoted = m.msg && m.msg.contextInfo && m.msg.contextInfo.quotedMessage ? m.msg.contextInfo.quotedMessage : null
        if (m.quoted) {
            let type = Object.keys(m.quoted)[0]
            m.quoted = m.quoted[type]
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.chat = hydro.decodeJid(m.msg.contextInfo.remoteJid || m.chat || m.sender)
            m.quoted.isBaileys = m.quoted.id && m.quoted.id.length === 16 || false
            m.quoted.sender = hydro.decodeJid(m.msg.contextInfo.participant)
            m.quoted.fromMe = m.quoted.sender === hydro.user.jid
            m.quoted.text = m.quoted.text || m.quoted.caption || ''
            m.quoted.name = hydro.getName(m.quoted.sender)
            m.quoted.mentionedJid = m.quoted.contextInfo && m.quoted.contextInfo.mentionedJid && m.quoted.contextInfo.mentionedJid.length && m.quoted.contextInfo.mentionedJid || []
            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    fromMe: m.quoted.fromMe,
                    remoteJid: m.quoted.chat,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })
            m.getQuotedObj = m.getQuotedMessage = () => {
                if (!m.quoted.id) return false
                let q = M.fromObject(((hydro.chats[m.quoted.chat] || {}).messages || {})[m.quoted.id])
                return exports.smsg(conn, q ? q : vM)
            }

            if (m.quoted.url || m.quoted.directPath) m.quoted.download = (saveToFile = false) => hydro.downloadM(m.quoted, m.quoted.mtype.replace(/message/i, ''), saveToFile)*/

            /**
             * Reply to quoted message
             * @param {String|Object} text
             * @param {String|false} chatId
             * @param {Object} options
             */
            m.quoted.reply = (text, chatId, options) => hydro.reply(chatId ? chatId : m.chat, text, vM, options)

            /**
             * Copy quoted message
             */
            m.quoted.copy = () => exports.smsg(hydro, M.fromObject(M.toObject(vM)))

            /**
             * Forward quoted message
             * @param {String} jid
             *  @param {Boolean} forceForward
            */
            m.quoted.forward = (jid, forceForward = false) => hydro.forwardMessage(jid, vM, forceForward)

            /**
             * Exact Forward quoted message
             * @param {String} jid
             * @param {Boolean|Number} forceForward
             * @param {Object} options
            */
            m.quoted.copyNForward = (jid, forceForward = true, options = {}) => hydro.copyNForward(jid, vM, forceForward, options)

            /**
             * Modify quoted Message
             * @param {String} jid
             * @param {String} text
             * @param {String} sender
             * @param {Object} options
            */
            m.quoted.cMod = (jid, text = '', sender = m.quoted.sender, options = {}) => hydro.cMod(jid, vM, text, sender, options)

            /**
             * Delete quoted message
             */
            m.quoted.delete = () => hydro.sendMessage(m.quoted.chat, { delete: vM.key })
        }
    }
    m.name = m.pushName || hydro.getName(m.sender)
    if (m.msg && m.msg.url) m.download = (saveToFile = false) => hydro.downloadM(m.msg, m.mtype.replace(/message/i, ''), saveToFile)
    /**
     * Reply to this message
     * @param {String|Object} text
     * @param {String|false} chatId
     * @param {Object} options
     */
    m.reply = (text, chatId, options) => hydro.reply(chatId ? chatId : m.chat, text, m, options)

    /**
     * Copy this message
     */
    m.copy = () => exports.smsg(hydro, M.fromObject(M.toObject(m)))

    /**
     * Forward this message
     * @param {String} jid
     * @param {Boolean} forceForward
     */
    m.forward = (jid = m.chat, forceForward = false) => hydro.copyNForward(jid, m, forceForward, options)
    
    // BY JOHANNES
    /**
     * Reply to this message
     * @param {String|Object} text
     * @param {String|false} chatId
     * @param {Object} options
     */
     m.reply = async (text, chatId, options) => hydro.reply(chatId ? chatId : m.chat, text, m, options)
     
     /**m.reply = async (text, chatId, options) => {
    const msg = await generateWAMessageFromContent(
      m.chat,
      {
        interactiveMessage: {
          body: {
            text: "\n" + text + "\n",
          },
          footer: {
            text: "Powered by : dcodekemii",
          },
          header: {
            title: "",
            hasMediaAttachment: false,
          },
          nativeFlowMessage: {
            buttons: [],
          },
        },
      },
      {
        quoted: global.fkontak,
      },
    );
    return hydro.relayMessage(m.chat, msg.message, {
      contextInfo: {
        mentionedJid: [m.sender],
      },
    });
   };/**
    
    /**
     * Exact Forward this message
     * @param {String} jid
     * @param {Boolean} forceForward
     * @param {Object} options
     */
    
    m.copyNForward = (jid = m.chat, forceForward = true, options = {}) => hydro.copyNForward(jid, m, forceForward, options)

    /**
     * Modify this Message
     * @param {String} jid 
     * @param {String} text 
     * @param {String} sender 
     * @param {Object} options 
     */
    m.cMod = (jid, text = '', sender = m.sender, options = {}) => hydro.cMod(jid, m, text, sender, options)

    /**
     * Delete this message
     */
    m.delete = () => hydro.sendMessage(m.chat, { delete: m.key })

    try {
        if (m.msg && m.mtype == 'protocolMessage') hydro.ev.emit('message.delete', m.msg.key)
    } catch (e) {
        console.error(e)
    }
    return m
}

exports.logic = (check, inp, out) => {
    if (inp.length !== out.length) throw new Error('Input and Output must have same length')
    for (let i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i]
    return null
}

exports.protoType = () => {
  Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
    const ab = new ArrayBuffer(this.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < this.length; ++i) {
        view[i] = this[i];
    }
    return ab;
  }
  /**
   * @returns {ArrayBuffer}
   */
  Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
    return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength)
  }
  /**
   * @returns {Buffer}
   */
  ArrayBuffer.prototype.toBuffer = function toBuffer() {
    return Buffer.from(new Uint8Array(this))
  }
  // /**
  //  * @returns {String}
  //  */
  // Buffer.prototype.toUtilFormat = ArrayBuffer.prototype.toUtilFormat = Object.prototype.toUtilFormat = Array.prototype.toUtilFormat = function toUtilFormat() {
  //     return util.format(this)
  // }
  Uint8Array.prototype.getFileType = ArrayBuffer.prototype.getFileType = Buffer.prototype.getFileType = async function getFileType() {
    return await fileTypeFromBuffer(this)
  }
  /**
   * @returns {Boolean}
   */
  String.prototype.isNumber = Number.prototype.isNumber = isNumber
  /**
   *
   * @returns {String}
   */
  String.prototype.capitalize = function capitalize() {
    return this.charAt(0).toUpperCase() + this.slice(1, this.length)
  }
  /**
   * @returns {String}
   */
  String.prototype.capitalizeV2 = function capitalizeV2() {
    const str = this.split(' ')
    return str.map(v => v.capitalize()).join(' ')
  }
  String.prototype.decodeJid = function decodeJid() {
    if (/:\d+@/gi.test(this)) {
      const decode = jidDecode(this) || {}
      return (decode.user && decode.server && decode.user + '@' + decode.server || this).trim()
    } else return this.trim()
  }
  /**
   * number must be milliseconds
   * @returns {string}
   */
  Number.prototype.toTimeString = function toTimeString() {
    // const milliseconds = this % 1000
    const seconds = Math.floor((this / 1000) % 60)
    const minutes = Math.floor((this / (60 * 1000)) % 60)
    const hours = Math.floor((this / (60 * 60 * 1000)) % 24)
    const days = Math.floor((this / (24 * 60 * 60 * 1000)))
    return (
      (days ? `${days} day(s) ` : '') +
      (hours ? `${hours} hour(s) ` : '') +
      (minutes ? `${minutes} minute(s) ` : '') +
      (seconds ? `${seconds} second(s)` : '')
    ).trim()
  }
  Number.prototype.getRandom = String.prototype.getRandom = Array.prototype.getRandom = getRandom
}

function isNumber() {
  const int = parseInt(this)
  return typeof int === 'number' && !isNaN(int)
}

function getRandom() {
  if (Array.isArray(this) || this instanceof String) return this[Math.floor(Math.random() * this.length)]
  return Math.floor(Math.random() * this)
}

function rand(isi) {
     return isi[Math.floor(Math.random() * isi.length)]
}