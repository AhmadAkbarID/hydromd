const axios = require("axios")

async function facebook(url) {

  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    }
  })

  const hd = data.match(/"playable_url_quality_hd":"([^"]+)"/)
  const sd = data.match(/"playable_url":"([^"]+)"/)

  const title = data.match(/<title>(.*?)<\/title>/)

  return {
    title: title ? title[1] : "Facebook Video",
    hd: hd ? hd[1].replace(/\\u0026/g, "&") : null,
    sd: sd ? sd[1].replace(/\\u0026/g, "&") : null,
    url: hd?.[1]?.replace(/\\u0026/g, "&") || sd?.[1]?.replace(/\\u0026/g, "&")
  }
}

module.exports = { facebook }