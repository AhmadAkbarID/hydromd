const https = require("https")
const cheerio = require("cheerio")

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

async function tryGetOfficialMeta(trackUrl) {
  try {
    if (!trackUrl) return null;
    const axios = require("axios");
    const cheerio = require("cheerio");
    const { data } = await axios.get(trackUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      timeout: 15000
    });
    const $ = cheerio.load(data);

    let title = $('meta[property="og:title"]').attr('content');
    let desc = $('meta[property="og:description"]').attr('content');
    let thumbnail = $('meta[property="og:image"]').attr('content');

    let artist = "Unknown Artist";
    if (desc) {
        let parts = desc.split('·').map(p => p.trim());
        artist = parts.length > 1 ? parts[1] : desc;
    }

    return {
      title: title || "Spotify Audio",
      artist: artist,
      thumbnail: thumbnail || "",
      duration: "-" 
    };
  } catch (e) {
    return null;
  }
}

async function v1_run(input) {
  const axios = (await import("axios")).default
  const trackId = extractTrackId(input)
  if (!trackId) throw new Error("Invalid Spotify track URL/ID")

  const trackUrl = `https://open.spotify.com/track/${trackId}`
  const headers = {
    origin: "https://spotdown.org",
    referer: "https://spotdown.org/",
    "user-agent": "Mozilla/5.0",
  }

  const { data: details } = await axios.get(`https://spotdown.org/api/song-details?url=${encodeURIComponent(trackUrl)}`, { headers, timeout: 20000 })
  const song = details?.songs?.[0]
  if (!song?.url) throw new Error("Track not found")

  const { data: audioData } = await axios.post("https://spotdown.org/api/download", { url: song.url }, { headers, responseType: "arraybuffer", timeout: 60000 })

  return { version: "v1", trackId, trackUrl, audioBuffer: Buffer.from(audioData), song: {} }
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

  const { token } = await zencf.turnstileMin("https://spotidownloader.com", "0x4AAAAAAA8QAiFfE5GuBRRS")
  const session = await axios.post("https://api.spotidownloader.com/session", { token }, { headers, timeout: 20000 })
  const bearer = session?.data?.token
  if (!bearer) throw new Error("Failed to get session")

  let trackId = extractTrackId(input)
  if (!trackId) {
    const search = await axios.post("https://api.spotidownloader.com/search", { query: input }, { headers: { ...headers, authorization: `Bearer ${bearer}` }, timeout: 20000 })
    const first = search?.data?.tracks?.[0]
    if (!first?.id) throw new Error("Track not found")
    trackId = first.id
  }

  const dl = await axios.post("https://api.spotidownloader.com/download", { id: trackId }, { headers: { ...headers, authorization: `Bearer ${bearer}` }, timeout: 30000 })
  const link = dl?.data?.link
  if (!link) throw new Error("Download link not available")

  const audioRes = await axios.get(link, { responseType: "arraybuffer", timeout: 60000, headers: { "user-agent": headers["user-agent"] } })

  return {
    version: "v2", trackId, trackUrl: `https://open.spotify.com/track/${trackId}`, audioBuffer: Buffer.from(audioRes.data),
    song: {
      title: dl?.data?.metadata?.title,
      artist: dl?.data?.metadata?.artist,
      thumbnail: dl?.data?.metadata?.thumbnail,
      duration: dl?.data?.metadata?.duration
    }
  }
}

async function v3_run(input) {
  const axios = require("axios")
  const base = "https://spotmate.online"
  const trackUrl = extractTrackUrl(input)
  if (!trackUrl) throw new Error("Invalid Spotify track URL/ID")

  const client = axios.create({ httpsAgent: new https.Agent({ rejectUnauthorized: false }), validateStatus: () => true, timeout: 30000 })
  const page = await client.get(base, { headers: { "User-Agent": "Mozilla/5.0", Accept: "*/*" } })
  const cookies = page.headers["set-cookie"] || []
  const cookieString = cookies.map((v) => v.split(";")[0]).join("; ")

  const $ = cheerio.load(page.data || "")
  const csrf = $('meta[name="csrf-token"]').attr("content")
  if (!csrf) throw new Error("CSRF not found")

  const convert = await client.post(base + "/convert", { urls: trackUrl }, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json, text/plain, */*", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", Referer: base, Origin: base, "X-CSRF-TOKEN": csrf, Cookie: cookieString } })
  if (!convert?.data?.url) throw new Error("Convert failed")

  const audioRes = await axios.get(convert.data.url, { responseType: "arraybuffer", timeout: 60000, headers: { "User-Agent": "Mozilla/5.0" } })

  return { version: "v3", trackId: extractTrackId(trackUrl), trackUrl, audioBuffer: Buffer.from(audioRes.data), song: {} }
}

async function v4_run(input) {
  const axios = require("axios")
  const tough = require("tough-cookie")
  const { wrapper } = require("axios-cookiejar-support")
  const spotifyUrl = extractTrackUrl(input)
  if (!spotifyUrl) throw new Error("Invalid Spotify URL")

  const jar = new tough.CookieJar()
  const client = wrapper(axios.create({ jar, withCredentials: true, headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }, timeout: 30000 }))

  const page = await client.get("https://spotdl.io/v2")
  const $ = cheerio.load(page.data || "")
  const csrfToken = $('meta[name="csrf-token"]').attr("content")
  if (!csrfToken) throw new Error("CSRF token tidak ditemukan")

  const convertRes = await client.post("https://spotdl.io/convert", { urls: spotifyUrl }, { headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken, Referer: "https://spotdl.io/v2", Origin: "https://spotdl.io" }, timeout: 30000 })
  if (!convertRes?.data?.url) throw new Error("Gagal convert")

  const audioRes = await axios.get(convertRes.data.url, { responseType: "arraybuffer", headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }, timeout: 60000 })

  return { version: "v4", trackId: extractTrackId(spotifyUrl), trackUrl: spotifyUrl, audioBuffer: Buffer.from(audioRes.data), song: {} }
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
    title: officialMeta.title && officialMeta.title !== "Spotify Audio" ? officialMeta.title : (currentMeta.title || "Spotify Audio"),
    artist: officialMeta.artist && officialMeta.artist !== "Unknown Artist" ? officialMeta.artist : (currentMeta.artist || "Unknown Artist"),
    thumbnail: officialMeta.thumbnail || currentMeta.thumbnail || "",
    duration: currentMeta.duration && currentMeta.duration !== "-" ? currentMeta.duration : (officialMeta.duration || "-"),
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

      if (!res.trackUrl && res.trackId) res.trackUrl = `https://open.spotify.com/track/${res.trackId}`;

      const officialMeta = await tryGetOfficialMeta(res.trackUrl)
      res.song = mergeMetaPreferOfficial(res.song, officialMeta)

      return res
    } catch (e) {
      lastErr = e
    }
  }

  console.error(lastErr.message || lastErr)
  throw lastErr || new Error("Semua server Spotify mati/limit.")
}

module.exports = { spotifyScrape }