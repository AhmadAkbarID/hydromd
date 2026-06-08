const https = require("https")
const cheerio = require("cheerio")

const client_id = "f8d0d37c39cc4ed68950b72fa9f85be9"
const client_secret = "8531d4c9fa6745a0b56b9c8023bd75a0"

function cleanInput(text = "") {
  return String(text || "").trim()
}

function extractTrackId(text) {
  if (!text) return null
  const s = String(text)
  if (/^[a-zA-Z0-9]{22}$/.test(s)) return s
  const m = s.match(/track\/([a-zA-Z0-9]{22})/)
  return m ? m[1] : null
}

function extractTrackUrl(text) {
  const id = extractTrackId(text)
  if (id) return `https://open.spotify.com/track/${id}`
  if (/spotify\.com\/track\//i.test(String(text))) return String(text).split("?")[0]
  return null
}

function formatDurationFromMs(ms) {
  if (!Number.isFinite(ms)) return "-"
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

let _spotifyTokenCache = {
  token: null,
  expiresAt: 0,
}

async function getSpotifyToken(axios) {
  const now = Date.now()
  if (_spotifyTokenCache.token && now < _spotifyTokenCache.expiresAt) {
    return _spotifyTokenCache.token
  }

  const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64")
  const { data } = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 20000,
    }
  )

  const token = data?.access_token
  const expiresIn = Number(data?.expires_in || 3600)
  if (!token) throw new Error("Failed to get Spotify token")

  _spotifyTokenCache.token = token
  _spotifyTokenCache.expiresAt = Date.now() + Math.max(60, expiresIn - 60) * 1000
  return token
}

async function fetchSpotifyTrackMeta(axios, trackId) {
  const token = await getSpotifyToken(axios)
  const { data: track } = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 20000,
  })

  return {
    title: track?.name || "Spotify Audio",
    artist: Array.isArray(track?.artists)
      ? track.artists.map((a) => a.name).join(", ")
      : "Unknown Artist",
    thumbnail: track?.album?.images?.[0]?.url || "",
    duration: formatDurationFromMs(track?.duration_ms),
  }
}

async function tryGetOfficialMeta(trackId) {
  try {
    if (!trackId) return null
    const axios = (await import("axios")).default
    return await fetchSpotifyTrackMeta(axios, trackId)
  } catch {
    return null
  }
}

async function v1_run(input) {
  const axios = (await import("axios")).default

  const trackId = extractTrackId(input)
  if (!trackId) throw new Error("Invalid Spotify track URL/ID")

  const trackUrl = `https://open.spotify.com/track/${trackId}`
  const officialMeta = await fetchSpotifyTrackMeta(axios, trackId)

  const headers = {
    origin: "https://spotdown.org",
    referer: "https://spotdown.org/",
    "user-agent": "Mozilla/5.0",
  }

  const { data: details } = await axios.get(
    `https://spotdown.org/api/song-details?url=${encodeURIComponent(trackUrl)}`,
    { headers, timeout: 20000 }
  )

  const song = details?.songs?.[0]
  if (!song?.url) throw new Error("Track not found")

  const { data: audioData } = await axios.post(
    "https://spotdown.org/api/download",
    { url: song.url },
    { headers, responseType: "arraybuffer", timeout: 60000 }
  )

  return {
    version: "v1",
    trackId,
    trackUrl,
    song: officialMeta,
    audioBuffer: Buffer.from(audioData),
  }
}

async function v2_run(input) {
  const axios = require("axios")
  const { zencf } = require("zencf")

  const headers = {
    "user-agent": "Mozilla/5.0 (Linux; Android 10)",
    "content-type": "application/json",
    origin: "https://spotidownloader.com",
    referer: "https://spotidownloader.com/",
  }

  const { token } = await zencf.turnstileMin(
    "https://spotidownloader.com/en13",
    "0x4AAAAAAA8QAiFfE5GuBRRS"
  )

  const session = await axios.post(
    "https://api.spotidownloader.com/session",
    { token },
    { headers, timeout: 20000 }
  )

  const bearer = session?.data?.token
  if (!bearer) throw new Error("Failed to get session")

  let trackId = extractTrackId(input)

  if (!trackId) {
    const search = await axios.post(
      "https://api.spotidownloader.com/search",
      { query: input },
      { headers: { ...headers, authorization: `Bearer ${bearer}` }, timeout: 20000 }
    )
    const first = search?.data?.tracks?.[0]
    if (!first?.id) throw new Error("Track not found")
    trackId = first.id
  }

  const dl = await axios.post(
    "https://api.spotidownloader.com/download",
    { id: trackId },
    { headers: { ...headers, authorization: `Bearer ${bearer}` }, timeout: 30000 }
  )

  const link = dl?.data?.link
  if (!link) throw new Error("Download link not available")

  const audioRes = await axios.get(link, {
    responseType: "arraybuffer",
    timeout: 60000,
    headers: { "user-agent": headers["user-agent"] },
  })

  const meta = {
    title: dl?.data?.metadata?.title || "Spotify Audio",
    artist: dl?.data?.metadata?.artist || "Unknown Artist",
    thumbnail: dl?.data?.metadata?.thumbnail || "",
    duration: dl?.data?.metadata?.duration || "-",
  }

  return {
    version: "v2",
    trackId,
    trackUrl: `https://open.spotify.com/track/${trackId}`,
    song: meta,
    audioBuffer: Buffer.from(audioRes.data),
  }
}

async function v3_run(input) {
  const axios = require("axios")
  const base = "https://spotmate.online"

  const trackUrl = extractTrackUrl(input)
  if (!trackUrl) throw new Error("Invalid Spotify track URL/ID")

  const client = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    validateStatus: () => true,
    timeout: 30000,
  })

  const page = await client.get(base + "/en1", {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "*/*" },
  })

  const cookies = page.headers["set-cookie"] || []
  const cookieString = cookies.map((v) => v.split(";")[0]).join("; ")

  const $ = cheerio.load(page.data || "")
  const csrf = $('meta[name="csrf-token"]').attr("content")
  if (!csrf) throw new Error("CSRF not found")

  const convert = await client.post(
    base + "/convert",
    { urls: trackUrl },
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Referer: base + "/en1",
        Origin: base,
        "X-CSRF-TOKEN": csrf,
        Cookie: cookieString,
      },
    }
  )

  if (!convert?.data) throw new Error("Convert failed: empty response")
  if (typeof convert.data === "string") throw new Error("Convert failed: got HTML/string response")
  if (convert.data.error) throw new Error("Convert failed: " + JSON.stringify(convert.data))
  if (!convert.data.url) throw new Error("Convert failed: missing url " + JSON.stringify(convert.data))

  const downloadUrl = convert.data.url

  try {
    await client.post(
      base + "/cdn-cgi/rum",
      { event: "download" },
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "application/json",
          Origin: base,
          Referer: base + "/en1",
          Cookie: cookieString,
        },
        timeout: 15000,
      }
    )
  } catch {}

  const audioRes = await axios.get(downloadUrl, {
    responseType: "arraybuffer",
    timeout: 60000,
    headers: { "User-Agent": "Mozilla/5.0" },
  })

  const trackId = extractTrackId(trackUrl)

  return {
    version: "v3",
    trackId,
    trackUrl,
    song: {
      title: "Spotify Audio",
      artist: "Unknown Artist",
      thumbnail: "",
      duration: "-",
    },
    audioBuffer: Buffer.from(audioRes.data),
  }
}

async function v4_run(input) {
  const axios = require("axios")
  const tough = require("tough-cookie")
  const { wrapper } = require("axios-cookiejar-support")

  const spotifyUrl = extractTrackUrl(input)
  if (!spotifyUrl) throw new Error("Invalid Spotify track URL/ID")

  const jar = new tough.CookieJar()
  const client = wrapper(
    axios.create({
      jar,
      withCredentials: true,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      timeout: 30000,
    })
  )

  const page = await client.get("https://spotdl.io/v2")
  const $ = cheerio.load(page.data || "")
  const csrfToken = $('meta[name="csrf-token"]').attr("content")
  if (!csrfToken) throw new Error("CSRF token tidak ditemukan")

  let trackId = extractTrackId(spotifyUrl)

  const convertRes = await client.post(
    "https://spotdl.io/convert",
    { urls: spotifyUrl },
    {
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
        Referer: "https://spotdl.io/v2",
        Origin: "https://spotdl.io",
      },
      timeout: 30000,
    }
  )

  if (!convertRes?.data) throw new Error("Gagal convert: empty response")
  if (convertRes.data.error) throw new Error("Gagal convert: " + JSON.stringify(convertRes.data))
  if (!convertRes.data.url) throw new Error("Gagal convert: missing url " + JSON.stringify(convertRes.data))

  const downloadUrl = convertRes.data.url

  const audioRes = await axios.get(downloadUrl, {
    responseType: "arraybuffer",
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    timeout: 60000,
  })

  return {
    version: "v4",
    trackId,
    trackUrl: spotifyUrl,
    song: {
      title: "Spotify Audio",
      artist: "Unknown Artist",
      thumbnail: "",
      duration: "-",
    },
    audioBuffer: Buffer.from(audioRes.data),
  }
}

const SCRAPERS = [
  { name: "v1", run: v1_run },
  { name: "v2", run: v2_run },
  { name: "v3", run: v3_run },
  { name: "v4", run: v4_run },
]

function mergeMetaPreferOfficial(currentMeta = {}, officialMeta = null) {
  if (!officialMeta) return currentMeta || {}
  return {
    title: officialMeta.title || currentMeta.title || "Spotify Audio",
    artist: officialMeta.artist || currentMeta.artist || "Unknown Artist",
    thumbnail: officialMeta.thumbnail || currentMeta.thumbnail || "",
    duration: officialMeta.duration || currentMeta.duration || "-",
  }
}

async function spotifyScrape(input, opts = {}) {
  const text = cleanInput(input)
  if (!text) throw new Error("No input provided")

  let lastErr = null

  for (const s of SCRAPERS) {
    try {
      const res = await s.run(text, opts)
      if (!res?.audioBuffer) throw new Error("Invalid response")

      const officialMeta = await tryGetOfficialMeta(res.trackId)
      res.song = mergeMetaPreferOfficial(res.song, officialMeta)

      if (!res.trackUrl && res.trackId) {
        res.trackUrl = `https://open.spotify.com/track/${res.trackId}`
      }

      return res
    } catch (e) {
      lastErr = e
    }
  }

  throw lastErr || new Error("All spotify scrapers failed")
}

module.exports = {
  spotifyScrape,
  v1_run,
  v2_run,
  v3_run,
  v4_run,
}