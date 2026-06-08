/*
 * Name : Play channel (fix thumbnail)
 * Type : CommonJS
 * Credit : Kyzo yamaha
*/

const crypto = require("crypto")
const axios = require("axios")
const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")
const yts = require("yt-search")
const os = require("os")

class SaveTube {
  constructor() {
    this.ky = "C5D58EF67A7584E4A29F6C35BBC4EB12"
    this.fmt = ["144", "240", "360", "480", "720", "1080", "mp3"]
    this.m = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/
    this.is = axios.create({
      headers: {
        "content-type": "application/json",
        "origin": "https://yt.savetube.me",
        "user-agent": "Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0"
      }
    })
  }

  async decrypt(enc) {
    const sr = Buffer.from(enc, "base64")
    const ky = Buffer.from(this.ky, "hex")
    const iv = sr.slice(0, 16)
    const dt = sr.slice(16)
    const dc = crypto.createDecipheriv("aes-128-cbc", ky, iv)
    const res = Buffer.concat([dc.update(dt), dc.final()])
    return JSON.parse(res.toString())
  }

  async getCdn() {
    try {
      const res = await this.is.get("https://media.savetube.vip/api/random-cdn")
      return res.data ? { status: true, data: res.data.cdn } : { status: false }
    } catch {
      return { status: false }
    }
  }

  async download(url, format = "mp3") {
    const id = url.match(this.m)?.[3]
    if (!id) return { status: false, msg: "ID not found" }
    
    const cdn = await this.getCdn()
    if (!cdn.status) return cdn

    try {
      const info = await this.is.post(`https://${cdn.data}/v2/info`, {
        url: `https://www.youtube.com/watch?v=${id}`
      })

      const dec = await this.decrypt(info.data.data)

      const dl = await this.is.post(`https://${cdn.data}/download`, {
        id,
        downloadType: format === "mp3" ? "audio" : "video",
        quality: format === "mp3" ? "128" : format,
        key: dec.key
      })

      return {
        status: true,
        title: dec.title,
        channel: dec.channelTitle || "Unknown",
        format,
        thumb: dec.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        duration: dec.durationLabel || dec.duration,
        dl: dl.data.data.downloadUrl,
        url: `https://youtu.be/${id}`
      }
    } catch (e) {
      return { status: false, msg: e.message }
    }
  }
}

const ytdl = new SaveTube()

async function playCh(hydro, m, query) {
  if (!query) return hydro.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
  if (!global.channel) return hydro.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
  
  try {
    await hydro.sendMessage(m.chat, { react: { text: "🔎", key: m.key } })

    const search = await yts(query)
    const video = search.videos.find(v => v.seconds < 900)
    if (!video) return hydro.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
    
    const ytChannel =
      video.author?.name ||
      video.author?.username ||
      "Unknown"
  

    const data = await ytdl.download(video.url, "mp3")
    if (!data.status) return hydro.sendMessage(m.chat, { react: { text: "❌", key: m.key } })

    const audioResponse = await axios.get(data.dl, { responseType: 'arraybuffer' })
    const thumbResponse = await axios.get(data.thumb, { responseType: 'arraybuffer' })

    const tempInput = path.join(os.tmpdir(), `in_${crypto.randomBytes(4).toString('hex')}.mp3`)
    const tempOutput = path.join(os.tmpdir(), `out_${crypto.randomBytes(4).toString('hex')}.opus`)

    fs.writeFileSync(tempInput, audioResponse.data)

    await new Promise((resolve, reject) => {
      exec(`ffmpeg -y -i "${tempInput}" -c:a libopus -b:a 128k -vbr on -compression_level 10 "${tempOutput}"`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    const opusBuffer = fs.readFileSync(tempOutput)

    await hydro.sendMessage(global.channel, {
      audio: opusBuffer,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.channel,
          serverMessageId: 100,
          newsletterName: global.channeln || global.botname
        },
        externalAdReply: {
          title: data.title,
          body: `Channel • ${ytChannel}`,
          thumbnail: thumbResponse.data,
          sourceUrl: data.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    })

    fs.unlinkSync(tempInput)
    fs.unlinkSync(tempOutput)
    
    await hydro.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (e) {
    console.error(e)
    await hydro.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
  }
}

module.exports = playCh