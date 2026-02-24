require('../settings')
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  proto,
  Browsers
} = require('socketon')
const fs = require('fs')
const pino = require('pino')
const chalk = require('chalk')
const path = require('path')
const axios = require('axios')
const FileType = require('file-type')
const PhoneNumber = require('awesome-phonenumber')
const {
  imageToWebp,
  imageToWebp3,
  videoToWebp,
  writeExifImg,
  writeExifImgAV,
  writeExifVid
} = require('../lib/exif')
const {
  getBuffer,
  sleep,
  smsg
} = require('../lib/myfunc')

let usePairingCode = true
const store = makeInMemoryStore({
  logger: pino().child({
    level: 'silent',
    stream: 'store'
  })
})
const client = {}

const jadibot = async (hydro, m, from) => {
  if (Object.keys(client).includes(from)) {
    return hydro.sendMessage(from, {
      text: 'Kamu sudah jadibot sebelumnya!'
    }, {
      quoted: m
    })
  }
  const {
    state,
    saveCreds
  } = await useMultiFileAuthState(`./database/rentbot/${m.sender.split("@")[0]}`)
  try {
    async function connectToWhatsApp() {
      const { version, isLatest } = await fetchLatestBaileysVersion()
      client[from] = makeWASocket({
        logger: pino({
          level: "silent"
        }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        version: version,
        browser: Browsers.ubuntu("Chrome"),
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        emitOwnEvents: false
      })

      if (usePairingCode && !client[from].user && !client[from].authState.creds.registered) {
        setTimeout(async () => {
          code = await client[from].requestPairingCode(m.sender.split("@")[0])
          code = code?.match(/.{1,4}/g)?.join("-") || code
          let txt = `*[ JADIBOT - CLONE ]*\nKode: ${code}\n\nMasukan kode ke Perangkat tertaut.`
          await hydro.sendMessage(from, {text: txt }, {quoted: m})
        }, 2000)
      }
      store.bind(client[from].ev)

      client[from].ev.on('messages.upsert', async chatUpdate => {
        try {
          mek = chatUpdate.messages[0]
          if (!mek.message) return
          mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
          if (mek.key && mek.key.remoteJid === 'status@broadcast') return
          if (!client[from].public && !mek.key.fromMe) return
          const m = smsg(client[from], mek, store)
          require('../hydro')(client[from], m, chatUpdate, store)
        } catch (err) {
          console.log(err)
        }
      })

      client[from].ev.on('messages.upsert', async chatUpdate => {
        try {
          for (let mek of chatUpdate.messages) {
            if (!mek.message) return
            if (mek.mtype == 'interactiveResponseMessage') {
              const command = mek.msg.body.text
              if (command == undefined) return
              const comand = `.${command}`
              client[from].appenTextMessage(comand, chatUpdate)
            }
          }
        } catch (err) {
          console.log(err)
        }
      })

      client[from].ev.process(
        async (events) => {
          if (events['presence.update']) {
            await client[from].sendPresenceUpdate('available')
          }
          if (events['messages.upsert']) {
            const upsert = events['messages.upsert']
            for (let msg of upsert.messages) {
              if (msg.key.remoteJid === 'status@broadcast') {
                if (msg.message?.protocolMessage) return
                await sleep(3000)
                await client[from].readMessages([msg.key])
              }
            }
          }
          if (events['creds.update']) {
            await saveCreds()
          }
        }
      )

      client[from].decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
          let decode = jidDecode(jid) || {}
          return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
      }

      client[from].ev.on('contacts.update', update => {
        for (let contact of update) {
          let id = client[from].decodeJid(contact.id)
          if (store && store.contacts) store.contacts[id] = {
            id,
            name: contact.notify
          }
        }
      })

      client[from].getName = (jid, withoutContact = false) => {
        id = client[from].decodeJid(jid)
        withoutContact = client[from].withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
          v = store.contacts[id] || {}
          if (!(v.name || v.subject)) v = client[from].groupMetadata(id) || {}
          resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
          } : id === client[from].decodeJid(client[from].user.id) ?
          client[from].user :
          (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
      }

      client[from].sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = []
        for (let i of kon) {
          list.push({
            displayName: await client[from].getName(i + '@s.whatsapp.net'),
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await client[from].getName(i + '@s.whatsapp.net')}\nFN:${await client[from].getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:client[from]officiall@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://bit.ly/420u6GX\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
          })
        }
        client[from].sendMessage(jid, {
          contacts: {
            displayName: `${list.length} Kontak`,
            contacts: list
          },
          ...opts
        }, {
          quoted
        })
      }

      client[from].setStatus = (status) => {
        client[from].query({
          tag: 'iq',
          attrs: {
            to: '@s.whatsapp.net',
            type: 'set',
            xmlns: 'status',
          },
          content: [{
            tag: 'status',
            attrs: {},
            content: Buffer.from(status, 'utf-8')
          }]
        })
        return status
      }

      client[from].public = true
      client[from].serializeM = (m) => smsg(client[from], m, store)

      client[from].sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        let type = await client[from].getFile(path, true)
        let {
          res,
          data: file,
          filename: pathFile
        } = type
        if (res && res.status !== 200 || file.length <= 65536) {
          try {
            throw {
              json: JSON.parse(file.toString())
            }
          } catch (e) {
            if (e.json) throw e.json
          }
        }
        let opt = {
          filename
        }
        if (quoted) opt.quoted = quoted
        if (!type) options.asDocument = true
        let mtype = '',
          mimetype = type.mime,
          convert
        if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
        else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
        else if (/video/.test(type.mime)) mtype = 'video'
        else if (/audio/.test(type.mime))(
          convert = await toAudio(file, type.ext),
          file = convert.data,
          pathFile = convert.filename,
          mtype = 'audio',
          mimetype = 'audio/ogg; codecs=opus'
        )
        else mtype = 'document'
        if (options.asDocument) mtype = 'document'

        delete options.asSticker
        delete options.asLocation
        delete options.asVideo
        delete options.asDocument
        delete options.asImage

        let message = {
          ...options,
          caption,
          ptt,
          [mtype]: {
            url: pathFile
          },
          mimetype,
          fileName: filename || pathFile.split('/').pop()
        }
        let m
        try {
          m = await client[from].sendMessage(jid, message, {
            ...opt,
            ...options
          })
        } catch (err) {
          m = null
        } finally {
          if (!m) m = await client[from].sendMessage(jid, {
            ...message,
            [mtype]: file
          }, {
            ...opt,
            ...options
          })
          file = null
          return m
        }
      }

      client[from].sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = '';
        let res = await axios.head(url)
        mime = res.headers['content-type']
        if (mime.split("/")[1] === "gif") {
          return client[from].sendMessage(jid, {
            video: await getBuffer(url),
            caption: caption,
            gifPlayback: true,
            ...options
          }, {
            quoted: quoted,
            ...options
          })
        }
        let type = mime.split("/")[0] + "Message"
        if (mime === "application/pdf") {
          return client[from].sendMessage(jid, {
            document: await getBuffer(url),
            mimetype: 'application/pdf',
            caption: caption,
            ...options
          }, {
            quoted: quoted,
            ...options
          })
        }
        if (mime.split("/")[0] === "image") {
          return client[from].sendMessage(jid, {
            image: await getBuffer(url),
            caption: caption,
            ...options
          }, {
            quoted: quoted,
            ...options
          })
        }
        if (mime.split("/")[0] === "video") {
          return client[from].sendMessage(jid, {
            video: await getBuffer(url),
            caption: caption,
            mimetype: 'video/mp4',
            ...options
          }, {
            quoted: quoted,
            ...options
          })
        }
        if (mime.split("/")[0] === "audio") {
          return client[from].sendMessage(jid, {
            audio: await getBuffer(url),
            caption: caption,
            mimetype: 'audio/mpeg',
            ...options
          }, {
            quoted: quoted,
            ...options
          })
        }
      }

      client[from].sendTextWithMentions = async (jid, text, quoted, options = {}) => client[from].sendMessage(jid, {
        text: text,
        mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
        ...options
      }, {
        quoted
      })

      client[from].getFile = async (PATH, returnAsFilename) => {
        let res, filename
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
          mime: 'application/octet-stream',
          ext: '.bin'
        }
        if (data && returnAsFilename && !filename)(filename = path.join(__dirname, './search/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data))
        return {
          res,
          filename,
          ...type,
          data
        }
      }

      client[from].sendImage = async (jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await client[from].sendMessage(jid, {
          image: buffer,
          caption: caption,
          ...options
        }, {
          quoted
        })
      }

      client[from].downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        let trueFileName = attachExtension ? ('./search/' + filename + '.' + type.ext) : './search/' + filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
      }

      client[from].downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk])
        }

        return buffer
      }

      client[from].sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await client[from].sendMessage(jid, {
          audio: buffer,
          ptt: ptt,
          ...options
        }, {
          quoted
        })
      }

      client[from].sendVideo = async (jid, path, gif = false, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await client[from].sendMessage(jid, {
          video: buffer,
          caption: caption,
          gifPlayback: gif,
          ...options
        }, {
          quoted
        })
      }

      client[from].sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await global.getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
          buffer = await writeExifImg(buff, options)
        } else {
          buffer = await imageToWebp(buff)
        }
        await client[from].sendMessage(jid, {
          sticker: {
            url: buffer
          },
          ...options
        }, {
          quoted
        })
        return buffer
      }

      client[from].sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await global.getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
          buffer = await writeExifVid(buff, options)
        } else {
          buffer = await videoToWebp(buff)
        }
        await client[from].sendMessage(jid, {
          sticker: {
            url: buffer
          },
          ...options
        }, {
          quoted
        })
        return buffer
      }

      client[from].sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await client[from].getFile(path, true)
        let {
          mime,
          ext,
          res,
          data,
          filename
        } = types
        if (res && res.status !== 200 || file.length <= 65536) {
          try {
            throw {
              json: JSON.parse(file.toString())
            }
          } catch (e) {
            if (e.json) throw e.json
          }
        }
        let type = '',
          mimetype = mime,
          pathFile = filename
        if (options.asDocument) type = 'document'
        if (options.asSticker || /webp/.test(mime)) {
          let media = {
            mimetype: mime,
            data
          }
          pathFile = await writeExif(media, {
            packname: options.packname ? options.packname : global.packname,
            author: options.author ? options.author : global.author,
            categories: options.categories ? options.categories : []
          })
          await fs.promises.unlink(filename)
          type = 'sticker'
          mimetype = 'image/webp'
        } else if (/image/.test(mime)) type = 'image'
        else if (/video/.test(mime)) type = 'video'
        else if (/audio/.test(mime)) type = 'audio'
        else type = 'document'
        await client[from].sendMessage(jid, {
          [type]: {
            url: pathFile
          },
          caption,
          mimetype,
          fileName,
          ...options
        }, {
          quoted,
          ...options
        })
        return fs.promises.unlink(pathFile)
      }

      client[from].copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
        if (options.readViewOnce) {
          message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
          vtype = Object.keys(message.message.viewOnceMessage.message)[0]
          delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
          delete message.message.viewOnceMessage.message[vtype].viewOnce
          message.message = {
            ...message.message.viewOnceMessage.message
          }
        }

        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
        let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
          ...context,
          ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
          ...content[ctype],
          ...options,
          ...(options.contextInfo ? {
            contextInfo: {
              ...content[ctype].contextInfo,
              ...options.contextInfo
            }
          } : {})
        } : {})
        await client[from].relayMessage(jid, waMessage.message, {
          messageId: waMessage.key.id
        })
        return waMessage
      }

      client[from].imgToSticker = async (from, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await fetchBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
          buffer = await writeExifImg(buff, options)
        } else {
          buffer = await imageToWebp(buff)
        }
        await client[from].sendMessage(from, {
          sticker: {
            url: buffer
          },
          ...options
        }, {
          quoted
        })
        return buffer
      }

      client[from].vidToSticker = async (from, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await fetchBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
          buffer = await writeExifVid(buff, options)
        } else {
          buffer = await videoToWebp(buff)
        }
        await client[from].sendMessage(from, {
          sticker: {
            url: buffer
          },
          ...options
        }, {
          quoted
        })
        return buffer
      }

      client[from].sendText = (jid, text, quoted = '', options) => client[from].sendMessage(jid, {
        text: text,
        ...options
      }, {
        quoted,
        ...options
      })

      client[from].cMod = (jid, copy, text = '', sender = client[from].user.id, options = {}) => {
        let mtype = Object.keys(copy.message)[0]
        let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
          mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
        let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
        else if (content.caption) content.caption = text || content.caption
        else if (content.text) content.text = text || content.text
        if (typeof content !== 'string') msg[mtype] = {
          ...content,
          ...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = sender === client[from].user.id

        return proto.WebMessageInfo.fromObject(copy)
      }
      client[from].serializeM = (m) => smsg(client[from], m, store)
      client[from].ev.on("connection.update", async (update) => {
        const {
          connection,
          lastDisconnect
        } = update
        if (connection === "close") {
          let reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.statusCode

          if (reason === DisconnectReason.badSession) {
            console.log(`Session error, please delete the session and try again...`)
            process.exit()
          } else if (reason === DisconnectReason.connectionClosed) {
            console.log('Connection closed, reconnecting....')
            connectToWhatsApp()
          } else if (reason === DisconnectReason.connectionLost) {
            console.log('Connection lost from the server, reconnecting...')
            connectToWhatsApp()
          } else if (reason === DisconnectReason.connectionReplaced) {
            console.log('Session connected to another server, please restart the bot.');
            process.exit()
          } else if (reason === DisconnectReason.loggedOut) {
            console.log(`Device logged out, please delete the session folder and scan again.`)
            process.exit()
          } else if (reason === DisconnectReason.restartRequired) {
            console.log('Restart required, restarting connection...')
            connectToWhatsApp()
          } else if (reason === DisconnectReason.timedOut) {
            console.log('Connection timed out, reconnecting...')
            connectToWhatsApp()
          } else {
            console.log(`Unknown DisconnectReason: ${reason}|${connection}`)
            connectToWhatsApp()
          }
        } else if (connection === "connecting") {
          console.log('')
        } else if (connection === "open") {
          console.log(chalk.green('Successfully connected to WhatsApp'))
        }
      })
      return client[from]
    }
    return connectToWhatsApp()
  } catch (err) {
    console.log('')
  }
}

async function stopjadibot(hydro, m, from) {
  if (!Object.keys(client).includes(from)) {
    return hydro.sendMessage(from, {
      text: `Kamu tidak ada di list jadibot!`
    }, {
      quoted: m
    })
  }
  delete client[from]
  fs.unlinkSync(`./database/rentbot/${from.split("@")[0]}`)
}

async function listjadibot(hydro, m) {
  let from = m.key.remoteJid
  let mentions = []
  let text = "List jadi bot:\n"
  for (let jadibot of Object.values(client)) {
    mentions.push(jadibot.user.jid)
    text += ` • ${jadibot.user.jid}\n`
  }
  return hydro.sendMessage(from, {
    text: text.trim(),
    mentions,
  }, {
    quoted: m
  })
}

module.exports = {
  jadibot,
  stopjadibot,
  listjadibot
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(`Update ${__filename}`)
  delete require.cache[file]
  require(file)
})
