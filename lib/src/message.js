const { generateWAMessage, areJidsSameUser, proto } = require('socketon');
const fs = require('fs');
const axios = require('axios');
const FileType = require('file-type');
const { writeExif } = require('../exif');
const { getBuffer, axiosss } = require('../function');

module.exports = (hydro, m, chatUpdate, store) => {
    
    const reply = async (teks) => {
        return await hydro.sendMessage(m.chat, { text: teks }, { quoted: m });
    }

    const replytolak = async (teks) => {
        return await hydro.sendMessage(m.chat, {
            text: teks,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channel,
                    serverMessageId: Math.floor(Math.random() * 1000) + 1,
                    newsletterName: global.channeln,
                },
                externalAdReply: {
                    showAdAttribution: false,
                    containsAutoReply: true,
                    title: "Apasihh.. Tolak dulu deh >.<",
                    previewType: "VIDEO",
                    thumbnailUrl: global.mess.replyimg.tolak,
                    sourceUrl: 'https://store.hydrohost.web.id'
                }
            }
        }, { quoted: m });
    }

    const replyquery = async (teks) => {
        return await hydro.sendMessage(m.chat, {
            text: teks,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channel,
                    serverMessageId: Math.floor(Math.random() * 1000) + 1,
                    newsletterName: global.channeln,
                },
                externalAdReply: {
                    showAdAttribution: false,
                    containsAutoReply: true,
                    title: "Hmm.. isi yang benar ya",
                    previewType: "VIDEO",
                    thumbnailUrl: global.mess.replyimg.query,
                    sourceUrl: 'https://store.hydrohost.web.id'
                }
            }
        }, { quoted: m });
    }

    const replysuccess = async (teks) => {
        return await hydro.sendMessage(m.chat, {
            text: teks,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channel,
                    serverMessageId: Math.floor(Math.random() * 1000) + 1,
                    newsletterName: global.channeln,
                },
                externalAdReply: {
                    showAdAttribution: false,
                    containsAutoReply: true,
                    title: "Yatta! Berhasil :>",
                    previewType: "VIDEO",
                    thumbnailUrl: global.mess.replyimg.success,
                    sourceUrl: 'https://store.hydrohost.web.id'
                }
            }
        }, { quoted: m });
    }

    const replyfail = async (teks) => {
        return await hydro.sendMessage(m.chat, {
            text: teks,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channel,
                    serverMessageId: Math.floor(Math.random() * 1000) + 1,
                    newsletterName: global.channeln,
                },
                externalAdReply: {
                    showAdAttribution: false,
                    containsAutoReply: true,
                    title: "Yahh.. Gagal :<",
                    previewType: "VIDEO",
                    thumbnailUrl: global.mess.replyimg.fail,
                    sourceUrl: 'https://store.hydrohost.web.id'
                }
            }
        }, { quoted: m });
    }

    const replylimit = async (teks) => {
        return await hydro.sendMessage(m.chat, {
            text: teks,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channel,
                    serverMessageId: Math.floor(Math.random() * 1000) + 1,
                    newsletterName: global.channeln,
                },
                externalAdReply: {
                    showAdAttribution: false,
                    containsAutoReply: true,
                    title: "Limit kamu kurang :3",
                    previewType: "VIDEO",
                    thumbnailUrl: global.mess.replyimg.limit,
                    sourceUrl: 'https://store.hydrohost.web.id'
                }
            }
        }, { quoted: m });
    }

    const replywait = async (teks) => {
        return await hydro.sendMessage(m.chat, {
            text: teks,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channel,
                    serverMessageId: Math.floor(Math.random() * 1000) + 1,
                    newsletterName: global.channeln,
                },
                externalAdReply: {
                    showAdAttribution: false,
                    containsAutoReply: true,
                    title: "Mangan dlu yah >.<",
                    previewType: "VIDEO",
                    thumbnailUrl: global.mess.replyimg.wait,
                    sourceUrl: 'https://store.hydrohost.web.id'
                }
            }
        }, { quoted: m });
    }

    const appenTextMessage = async (text) => {
        let messages = await generateWAMessage(m.chat, { text: text, mentions: m.mentionedJid }, {
            userJid: hydro.user.id,
            quoted: m.quoted ? m.quoted.fakeObj : m
        });
        messages.key.fromMe = areJidsSameUser(m.sender, hydro.user.id);
        messages.key.id = m.key.id;
        messages.pushName = m.pushName;
        if (m.isGroup) messages.participant = m.sender;
        
        let msg = {
            ...chatUpdate,
            messages: [proto.WebMessageInfo.fromObject(messages)],
            type: 'append'
        };
        hydro.ev.emit('messages.upsert', msg);
    }

    const react = async (emoji) => {
        return await hydro.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    }

    hydro.sendPoll = async (jid, name = '', values = [], quoted, selectableCount = 1) => {
        return await hydro.sendMessage(jid, { poll: { name, values, selectableCount }}, { quoted: quoted || m });
    }

    hydro.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        const quotedOptions = { quoted: quoted || m };
        async function getFileUrl(res, mime) {
            if (mime && mime.includes('gif')) {
                return hydro.sendMessage(jid, { video: res.data, caption: caption, gifPlayback: true, ...options }, quotedOptions);
            } else if (mime && mime === 'application/pdf') {
                return hydro.sendMessage(jid, { document: res.data, mimetype: 'application/pdf', caption: caption, ...options }, quotedOptions);
            } else if (mime && mime.includes('image')) {
                return hydro.sendMessage(jid, { image: res.data, caption: caption, ...options }, quotedOptions);
            } else if (mime && mime.includes('video')) {
                return hydro.sendMessage(jid, { video: res.data, caption: caption, mimetype: 'video/mp4', ...options }, quotedOptions);
            } else if (mime && mime.includes('webp') && !/.jpg|.jpeg|.png/.test(url)) {
                return hydro.sendAsSticker(jid, res.data, quotedOptions.quoted, options);
            } else if (mime && mime.includes('audio')) {
                return hydro.sendMessage(jid, { audio: res.data, mimetype: 'audio/mpeg', ...options }, quotedOptions);
            }
        }
        
        const res = await axiosss.get(url, { responseType: 'arraybuffer' });
        let mime = res.headers['content-type'];
        if (!mime || mime.includes('octet-stream')) {
            const fileType = await FileType.fromBuffer(res.data);
            mime = fileType ? fileType.mime : null;
        }
        return await getFileUrl(res, mime);
    }

    hydro.sendAsSticker = async (jid, path, quoted, options = {}) => {
        const buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        const result = await writeExif(buff, options);
        return await hydro.sendMessage(jid, { sticker: { url: result }, ...options }, { quoted: quoted || m });
    }

    m.react = react;
    
    m.reply = async (content, options = {}) => {
        const quoted = options.quoted || m;
        const chat = options.chat || m.chat;
        const caption = options.caption || '';
        const ephemeralExpiration = m.expiration || 0; 
        
        let mentions = options.mentions || [];
        if (typeof content === 'string' || content.text || content.caption) {
            const textToMatch = content.text || content.caption || content;
            if (typeof textToMatch === 'string') {
                const matched = [...textToMatch.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net');
                if (matched.length > 0) mentions = matched;
            }
        }

        if (typeof content === 'object') {
            return await hydro.sendMessage(chat, content, { ...options, quoted, ephemeralExpiration });
        } else if (typeof content === 'string') {
            try {
                if (/^https?:\/\//.test(content)) {
                    const data = await axios.get(content, { responseType: 'arraybuffer' });
                    const mime = data.headers['content-type'] || (await FileType.fromBuffer(data.data))?.mime;
                    
                    if (mime && /gif|image|video|audio|pdf|stream/i.test(mime)) {
                        return await hydro.sendFileUrl(chat, content, caption, quoted, options);
                    } else {
                        return await hydro.sendMessage(chat, { text: content, mentions, ...options }, { quoted, ephemeralExpiration });
                    }
                } else {
                    return await hydro.sendMessage(chat, { text: content, mentions, ...options }, { quoted, ephemeralExpiration });
                }
            } catch (e) {
                return await hydro.sendMessage(chat, { text: content, mentions, ...options }, { quoted, ephemeralExpiration });
            }
        }
    };

    return { 
        reply,
        replytolak,
        replyquery,
        replysuccess,
        replyfail,
        replywait,
        react,
        appenTextMessage,
        replylimit,
        m
    }
}