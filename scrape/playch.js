const crypto = require("crypto")
const axios = require("axios")
const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")
const yts = require("yt-search")
const os = require("os")
const tough = require("tough-cookie")
const { wrapper } = require("axios-cookiejar-support")

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
      },
      timeout: 30000
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
    if (!cdn.status) return { status: false, msg: "CDN not available" }

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

const videoQuality = ["1080", "720", "480", "360", "144"]
const audioQuality = ["128", "320"]

async function ddownr(url, type = "mp3", format = "128") {
  try {
    const mode = ["mp3", "mp4"]
    if (!mode.includes(type)) return { status: 400, message: `Format tersedia: ${mode.join(", ")}` }
    if (type === "mp4" && !videoQuality.includes(format)) return { status: 400, message: `Quality video: ${videoQuality.join(", ")}` }
    if (type === "mp3" && !audioQuality.includes(format)) return { status: 400, message: `Quality audio: ${audioQuality.join(", ")}` }

    const params =
      type === "mp3"
        ? { copyright: "0", format: "mp3", audio_quality: format, url, api: "dfcb6d76f2f6a9894gjkege8a4ab232222" }
        : { copyright: "0", format, url, api: "dfcb6d76f2f6a9894gjkege8a4ab232222" }

    const { data: metadata } = await axios.get("https://p.lbserver.xyz/ajax/download.php", { params, timeout: 30000 })

    if (!metadata?.progress_url) return { status: 500, message: "Gagal mendapatkan progress_url" }

    let progress = 0
    let json

    return await new Promise((resolve) => {
      const poll = async () => {
        try {
          const res = await axios.get(metadata.progress_url, { timeout: 30000 })
          json = res.data
          progress = json?.progress || progress

          if (progress >= 1000) {
            return resolve({
              status: 200,
              metadata: { title: metadata.title, image: metadata.info?.image },
              download: json.download_url,
              alternatif: json.alternative_download_urls || [],
            })
          }
        } catch {}

        setTimeout(poll, 250)
      }

      poll()
    })
  } catch (e) {
    return { status: 500, message: e.message }
  }
}

function pickVideo(search) {
  const v = search?.videos || []
  return v.find((x) => x.seconds && x.seconds < 900) || v[0] || null
}

async function toOpusFromMp3Buffer(mp3Buffer) {
  const tempInput = path.join(os.tmpdir(), `in_${crypto.randomBytes(6).toString("hex")}.mp3`)
  const tempOutput = path.join(os.tmpdir(), `out_${crypto.randomBytes(6).toString("hex")}.opus`)

  fs.writeFileSync(tempInput, mp3Buffer)

  await new Promise((resolve, reject) => {
    exec(`ffmpeg -y -i "${tempInput}" -c:a libopus -b:a 128k -vbr on -compression_level 10 "${tempOutput}"`, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })

  const opusBuffer = fs.readFileSync(tempOutput)

  try { fs.unlinkSync(tempInput) } catch {}
  try { fs.unlinkSync(tempOutput) } catch {}

  return opusBuffer
}

async function toOggOpusFromMp3Buffer(mp3Buffer) {
  const tempInput = path.join(os.tmpdir(), `in_${crypto.randomBytes(6).toString("hex")}.mp3`)
  const tempOutput = path.join(os.tmpdir(), `out_${crypto.randomBytes(6).toString("hex")}.ogg`)

  fs.writeFileSync(tempInput, mp3Buffer)

  await new Promise((resolve, reject) => {
    exec(
      `ffmpeg -y -i "${tempInput}" -vn -map_metadata -1 -ac 1 -ar 48000 -c:a libopus -b:a 96k -vbr on -application audio -f ogg "${tempOutput}"`,
      (err, stdout, stderr) => {
        if (err) return reject(err)
        resolve()
      }
    )
  })

  const opusBuffer = fs.readFileSync(tempOutput)

  try { fs.unlinkSync(tempInput) } catch {}
  try { fs.unlinkSync(tempOutput) } catch {}

  return opusBuffer
}

async function playCh_v1(hydro, m, query) {
  if (!query) throw new Error("No query")
  if (!global.channel) throw new Error("No channel")

  await hydro.sendMessage(m.chat, { react: { text: "🔎", key: m.key } })

  const search = await yts(query)
  const video = pickVideo(search)
  if (!video) throw new Error("Video not found")

  const ytChannel = video.author?.name || video.author?.username || "Unknown"

  const data = await ytdl.download(video.url, "mp3")
  if (!data.status || !data.dl) throw new Error(data.msg || "Download failed")

  const audioResponse = await axios.get(data.dl, { responseType: "arraybuffer", timeout: 60000 })
  const thumbResponse = await axios.get(data.thumb, { responseType: "arraybuffer", timeout: 30000 })

  if (!audioResponse.data || Buffer.from(audioResponse.data).length < 50000) throw new Error("Invalid audio")

  const opusBuffer = await toOpusFromMp3Buffer(Buffer.from(audioResponse.data))
  if (!opusBuffer || opusBuffer.length < 10000) throw new Error("Convert failed")

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

  return { version: "v1", title: data.title, url: data.url }
}

async function playCh_v2(hydro, m, query) {
  if (!query) throw new Error("No query")
  if (!global.channel) throw new Error("No channel")

  await hydro.sendMessage(m.chat, { react: { text: "🔎", key: m.key } })

  const search = await yts(query)
  const video = pickVideo(search)
  if (!video) throw new Error("Video not found")

  const ytChannel = video.author?.name || video.author?.username || "Unknown"

  const data = await ddownr(video.url, "mp3", "128")
  if (data.status !== 200 || !data.download) throw new Error(data.message || "Download failed")

  const audioResponse = await axios.get(data.download, { responseType: "arraybuffer", timeout: 60000 })
  if (!audioResponse.data || Buffer.from(audioResponse.data).length < 50000) throw new Error("Invalid audio")

  const opusBuffer = await toOggOpusFromMp3Buffer(Buffer.from(audioResponse.data))
  if (!opusBuffer || opusBuffer.length < 10000) throw new Error("Convert failed")

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
        title: data.metadata?.title || video.title,
        body: `Channel • ${ytChannel}`,
        thumbnailUrl: video.thumbnail,
        sourceUrl: video.url,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  })

  return { version: "v2", title: data.metadata?.title || video.title, url: video.url }
}

const VERSIONS = [
  { name: "v1", run: playCh_v1 },
  { name: "v2", run: playCh_v2 },
]

async function playCh(hydro, m, query) {
  let lastErr = null
  for (const v of VERSIONS) {
    try {
      const res = await v.run(hydro, m, query)
      await hydro.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
      return res
    } catch (e) {
      lastErr = e
    }
  }
  await hydro.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
  throw lastErr || new Error("All versions failed")
}

module.exports = playCh