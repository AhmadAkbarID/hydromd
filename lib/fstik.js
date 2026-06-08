const axios = require("axios")
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
const os = require("os")
const { execFile } = require("child_process")
const { promisify } = require("util")
const execFileAsync = promisify(execFile)
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("socketon")

const API_BASE = "https://api.fstik.app"
const ENDPOINT_DIRECT = "/getStickerSetByName"
const ENDPOINT_SEARCH = "/searchStickerSet"

const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  origin: "https://webapp.fstik.app",
  referer: "https://webapp.fstik.app/",
  "user-agent": "NB Android/1.0.0"
}

function withTimeout(promise, ms, label) {
  let t
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(label || "Timeout")), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t))
}

async function hasFfmpeg() {
  try {
    await withTimeout(execFileAsync("ffmpeg", ["-version"]), 5000, "ffmpeg timeout")
    return true
  } catch {
    return false
  }
}

async function downloadAsBuffer(url) {
  const req = axios.get(url, { responseType: "arraybuffer", timeout: 20000, maxContentLength: Infinity, maxBodyLength: Infinity })
  const res = await withTimeout(req, 25000, "download timeout")
  return Buffer.from(res.data)
}

async function webmToWebpAnimated(webmBuffer) {
  const tmp = os.tmpdir()
  const inFile = path.join(tmp, `fstik_in_${Date.now()}_${Math.random().toString(16).slice(2)}.webm`)
  const outFile = path.join(tmp, `fstik_out_${Date.now()}_${Math.random().toString(16).slice(2)}.webp`)
  fs.writeFileSync(inFile, webmBuffer)

  const args = [
    "-y",
    "-i",
    inFile,
    "-vf",
    "scale=512:512:force_original_aspect_ratio=decrease,fps=30,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
    "-loop",
    "0",
    "-an",
    outFile
  ]

  await withTimeout(execFileAsync("ffmpeg", args), 60000, "convert timeout")
  const out = fs.readFileSync(outFile)
  try { fs.unlinkSync(inFile) } catch {}
  try { fs.unlinkSync(outFile) } catch {}
  return out
}

function normalizeQueryAndCount(text) {
  const raw = (text || "").trim()
  const parts = raw.split(/\s+/).filter(Boolean)
  let count = 5
  let query = raw

  const last = parts[parts.length - 1]
  if (last && !isNaN(last)) {
    count = parseInt(parts.pop(), 10)
    if (!Number.isFinite(count) || count <= 0) count = 5
    if (count > 30) count = 30
    query = parts.join(" ").trim()
  }

  return { query, count }
}

function parseSetNameFromLink(link) {
  const m = link.match(/^https?:\/\/t\.me\/addstickers\/([^/?#\s]+)/i)
  return m ? m[1].trim() : null
}

async function fetchStickerSet(query, count) {
  const isLink = /^https?:\/\/t\.me\/addstickers\//i.test(query)

  if (isLink) {
    const name = parseSetNameFromLink(query)
    if (!name) throw new Error("Link paket tidak valid")

    const req = axios.post(
      API_BASE + ENDPOINT_DIRECT,
      { name, user_token: null },
      { headers: HEADERS, timeout: 20000 }
    )
    const res = await withTimeout(req, 25000, "api timeout")
    const result = res.data?.result
    if (!result) throw new Error("Paket stiker tidak ditemukan")

    const stickers = (result.stickers || []).map(s => ({
      image_url: s.thumb?.file_id ? `${API_BASE}/file/${s.thumb.file_id}/sticker.webp` : null,
      video_url: s.video?.file_id ? `${API_BASE}/file/${s.video.file_id}/sticker.webm` : null,
      is_video: !!s.video?.file_id
    })).slice(0, count)

    return {
      title: result.title,
      name: result.name,
      description: result.description,
      tags: result.tags,
      stickerCount: (result.stickers || []).length,
      stickers
    }
  }

  const req = axios.post(
    API_BASE + ENDPOINT_SEARCH,
    { query, skip: 0, limit: 5, type: "", kind: "regular", user_token: null },
    { headers: HEADERS, timeout: 20000 }
  )
  const res = await withTimeout(req, 25000, "api timeout")

  const sets = res.data?.result?.stickerSets
  if (!sets || !sets.length) throw new Error("Paket stiker tidak ditemukan")

  const allStickers = []
  for (const set of sets) {
    const arr = (set.stickers || []).map(s => ({
      image_url: s.thumb?.file_id ? `${API_BASE}/file/${s.thumb.file_id}/sticker.webp` : null,
      video_url: s.video?.file_id ? `${API_BASE}/file/${s.video.file_id}/sticker.webm` : null,
      is_video: !!s.video?.file_id
    }))
    if (arr.length) allStickers.push(...arr)
    if (allStickers.length >= count) break
  }

  if (!allStickers.length) throw new Error("Paket stiker tidak ditemukan")

  const first = sets[0]
  return {
    title: first.title,
    name: first.name,
    description: first.description,
    tags: first.tags,
    stickerCount: allStickers.length,
    stickers: allStickers.slice(0, count)
  }
}

async function buildAndSendPack(hydro, m, packName, publisher, stickerWebpBuffers) {
  const uploadFn = hydro?.waUploadToServer
  if (typeof uploadFn !== "function") throw new Error("waUploadToServer tidak tersedia")

  const uploaded = []
  for (const buf of stickerWebpBuffers) {
    const media = await withTimeout(
      prepareWAMessageMedia({ sticker: buf }, { upload: uploadFn }),
      60000,
      "upload timeout"
    )
    if (media?.stickerMessage) uploaded.push(media.stickerMessage)
  }

  if (!uploaded.length) throw new Error("Gagal upload stiker")

  const packId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex")

  const content = proto.Message.fromObject({
    stickerPackMessage: {
      stickerPackId: packId,
      name: packName || "fstik",
      publisher: publisher || "",
      stickers: uploaded
    }
  })

  const msg = generateWAMessageFromContent(m.chat, content, { quoted: m })
  await withTimeout(hydro.relayMessage(m.chat, msg.message, { messageId: msg.key.id }), 60000, "send timeout")
}

async function sendFstikPack({ hydro, m, text }) {
  const { query, count } = normalizeQueryAndCount(text)
  if (!query) throw new Error("Query kosong")

  const set = await fetchStickerSet(query, count)
  if (!set?.stickers?.length) throw new Error("Paket stiker tidak ditemukan")

  const ffmpegOk = await hasFfmpeg()
  const buffers = []

  for (const s of set.stickers) {
    if (s.is_video && s.video_url) {
      if (!ffmpegOk) continue
      const webm = await downloadAsBuffer(s.video_url)
      const webp = await webmToWebpAnimated(webm)
      buffers.push(webp)
    } else if (s.image_url) {
      const webp = await downloadAsBuffer(s.image_url)
      buffers.push(webp)
    }
  }

  if (!buffers.length) {
    if (!ffmpegOk) throw new Error("ffmpeg tidak ada (video/gif tidak bisa dikonversi)")
    throw new Error("Tidak ada stiker yang bisa diproses")
  }

  await buildAndSendPack(hydro, m, set.title || set.name || "fstik", "fstik", buffers)
}

module.exports = { sendFstikPack }