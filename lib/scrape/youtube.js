const axios = require("axios");
const https = require("https");
const fetch = require("node-fetch");
const WebSocket = require("ws");

const BASE_URL = "https://hub.ytconvert.org/api/download";
const headers = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Origin": "https://media.ytmp3.gg",
  "Referer": "https://media.ytmp3.gg/",
  "User-Agent": "Mozilla/5.0"
};

const delay = ms => new Promise(res => setTimeout(res, ms));

function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    if (u.hostname.includes("youtu.be")) return u.pathname.split("/")[1];
    if (u.pathname.includes("/shorts/")) return u.pathname.split("/shorts/")[1];
    return null;
  } catch {
    return null;
  }
}

function buildThumbnail(url, fallback = null) {
  const id = extractVideoId(url);
  if (!id) return fallback;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

async function requestConvert(payload) {
  const res = await axios.post(BASE_URL, payload, { headers });
  return res.data;
}

async function waitUntilReady(statusUrl) {
  while (true) {
    const { data } = await axios.get(statusUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (data.status === "completed" || data.downloadUrl) return data;
    if (data.status === "error") throw new Error("API merespon status error.");

    await delay(3000);
  }
}

async function primaryMP3(url) {
  const convert = await requestConvert({
    url,
    os: "windows",
    output: { type: "audio", format: "mp3" }
  });
  const status = await waitUntilReady(convert.statusUrl);
  return {
    title: convert.title,
    downloadUrl: status.downloadUrl,
    thumbnail: buildThumbnail(url)
  };
}

async function primaryMP4(url, quality = "720") {
  const convert = await requestConvert({
    url,
    os: "windows",
    output: { type: "video", format: "mp4", quality: quality + "p" }
  });
  const status = await waitUntilReady(convert.statusUrl);
  return {
    title: convert.title,
    downloadUrl: status.downloadUrl,
    thumbnail: buildThumbnail(url),
    quality
  };
}

async function secondaryDownload(url, type = "mp3", format = "128") {
  const params = type === "mp3" ? { format: "mp3", audio_quality: format, url } : { format, url };
  const { data } = await axios.get("https://p.lbserver.xyz/ajax/download.php", { params });

  if (!data?.progress_url) throw new Error("Progress URL tidak ditemukan.");

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const { data: res } = await axios.get(data.progress_url);
        if (res.progress >= 1000) {
          resolve({
            title: data.title,
            downloadUrl: res.download_url,
            thumbnail: data.info?.image
          });
        } else setTimeout(poll, 500);
      } catch (e) {
        setTimeout(poll, 500);
      }
    };
    poll();
  });
}

const SaveNow = {
  api: "https://p.savenow.to",
  key: "dfcb6d76f2f6a9894gjkege8a4ab232222",
  agent: new https.Agent({ rejectUnauthorized: false })
};

async function tertiaryDownload(url, type = "mp3") {
  const format = type === "mp3" ? "mp3" : "720";
  const { data } = await axios.get(`${SaveNow.api}/ajax/download.php`, {
    params: { format, url, api: SaveNow.key },
    httpsAgent: SaveNow.agent
  });

  for (let i = 0; i < 40; i++) {
    try {
      const { data: res } = await axios.get(data.progress_url, { httpsAgent: SaveNow.agent });
      if (res.success && res.download_url) {
        return {
          title: data.info?.title,
          downloadUrl: res.download_url,
          thumbnail: data.info?.image
        };
      }
    } catch {}
    await delay(2500);
  }
  throw new Error("Timeout: SaveNow terlalu lama merespon.");
}

const SS_HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  'Content-Type': 'application/x-www-form-urlencoded',
  'origin': 'https://ssyoutube.online',
  'referer': 'https://ssyoutube.online/en12/'
};

async function quaternaryDownload(url, type = "mp3", quality = "720") {
  const resolusi = type === "mp3" ? "audio" : quality;
  const r = await fetch("https://ssyoutube.online/yt-video-detail/", {
    method: "POST",
    headers: SS_HEADERS,
    body: new URLSearchParams({ videoURL: url })
  });

  const html = await r.text();
  const title = (html.match(/videoTitle[^>]*>(.*?)</) || [])[1] || "Unknown";
  const thumbnail = (html.match(/thumbnail" src="([^"]+)/) || [])[1];

  if (resolusi === "audio") {
    const req = await fetch("https://ssyoutube.online/wp-admin/admin-ajax.php", {
      method: "POST",
      headers: SS_HEADERS,
      body: new URLSearchParams({ action: "get_mp3_conversion_url", videoUrl: url })
    });
    const json = await req.json();
    return { title, thumbnail, downloadUrl: json.data.url };
  }

  throw new Error("SSYoutube hanya mendukung ekstrak MP3 untuk bypass ini.");
}

async function ytmp3(url) {
  try {
    return await primaryMP3(url);
  } catch (e1) {
    console.error(e1.message || e1);
    try {
      return await secondaryDownload(url, "mp3");
    } catch (e2) {
      console.error(e2.message || e2);
      try {
        return await tertiaryDownload(url, "mp3");
      } catch (e3) {
        console.error(e3.message || e3);
        try {
          return await quaternaryDownload(url, "mp3");
        } catch (e4) {
          console.error(e4.message || e4);
          throw new Error("Semua server gagal memproses Audio.");
        }
      }
    }
  }
}

async function ytmp4(url, quality = "720") {
  try {
    return await primaryMP4(url, quality);
  } catch (e1) {
    console.error(e1.message || e1);
    try {
      return await secondaryDownload(url, "mp4", quality);
    } catch (e2) {
      console.error(e2.message || e2);
      try {
        return await tertiaryDownload(url, "mp4");
      } catch (e3) {
        console.error(e3.message || e3);
        throw new Error("Semua server gagal memproses Video.");
      }
    }
  }
}

module.exports = { ytmp3, ytmp4 };